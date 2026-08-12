// src/hooks/useMealsData.ts
import { useCallback, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getMeals,
  createMeal,
  updateMeal,
  replaceMealItems,
  archiveMeal,
  unarchiveMeal,
} from "@/services/nutrition";
import { getApiErrorMessage } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import type {
  Meal,
  CreateMealDto,
  UpdateMealDto,
  ReplaceMealItemsDto,
  DietaryTag,
} from "@/types/nutrition";
import { toast } from "react-toastify";

export type MealsFilters = {
  search: string;
  dietaryTag: DietaryTag | "";
  allergen: string;
  includeInactive: boolean;
  showArchivedOnly: boolean;
};

const defaultFilters: MealsFilters = {
  search: "",
  dietaryTag: "",
  allergen: "",
  includeInactive: false,
  showArchivedOnly: false,
};

function buildParams(f: MealsFilters) {
  const params: Record<string, string | boolean> = {};
  if (f.search.trim()) params.search = f.search.trim();
  if (f.dietaryTag) params.dietaryTag = f.dietaryTag;
  if (f.allergen.trim()) params.allergen = f.allergen.trim();
  if (f.includeInactive || f.showArchivedOnly) params.includeInactive = true;
  return params;
}

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function useMealsData() {
  const [filters, setFilters] = useState<MealsFilters>(defaultFilters);

  // Archive modal state
  const [mealToArchive, setMealToArchive] = useState<Meal | null>(null);

  // Each filter combination is cached, so the image-heavy meal library loads
  // once per combo instead of on every page visit.
  const mealsQuery = useQuery({
    queryKey: ["meals", buildParams(filters)],
    queryFn: () => getMeals(buildParams(filters)),
    staleTime: 5 * 60_000,
  });

  const markLibraryStale = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["meals"],
      refetchType: "none",
    });
  }, []);

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveMeal(id),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Failed to archive meal.")),
  });

  const handleFiltersChange = useCallback((next: Partial<MealsFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleCreateMeal = useCallback(
    async (dto: CreateMealDto): Promise<Meal> => {
      try {
        const newMeal = await createMeal(dto);
        queryClient.setQueryData<Meal[]>(
          ["meals", buildParams(filters)],
          (prev) => [newMeal, ...(prev ?? [])],
        );
        markLibraryStale();
        toast.success(`Meal "${newMeal.name}" created.`);
        return newMeal;
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to create meal."));
        throw err;
      }
    },
    [filters, markLibraryStale],
  );

  const handleUpdateMeal = useCallback(
    async (
      mealId: string,
      metaDto: UpdateMealDto,
      recipeDto?: ReplaceMealItemsDto,
    ): Promise<Meal> => {
      try {
        // Strip items if present because PATCH /nutrition/library/meals/:mealId rejects items
        const patchBody = { ...(metaDto as UpdateMealDto & { items?: unknown }) };
        delete patchBody.items;
        let updated = await updateMeal(mealId, patchBody);
        if (recipeDto && recipeDto.items.length > 0) {
          updated = await replaceMealItems(mealId, recipeDto);
        }
        queryClient.setQueryData<Meal[]>(
          ["meals", buildParams(filters)],
          (prev) => prev?.map((m) => (m.id === mealId ? updated : m)),
        );
        markLibraryStale();
        toast.success(`Meal "${updated.name}" updated.`);
        return updated;
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to update meal."));
        throw err;
      }
    },
    [filters, markLibraryStale],
  );

  const handleArchiveConfirm = useCallback(async () => {
    if (!mealToArchive) return;
    try {
      await archiveMutation.mutateAsync(mealToArchive.id);
      queryClient.setQueryData<Meal[]>(
        ["meals", buildParams(filters)],
        (prev) =>
          prev?.map((m) =>
            m.id === mealToArchive.id ? { ...m, isActive: false } : m,
          ),
      );
      markLibraryStale();
      toast.success(`Meal "${mealToArchive.name}" archived.`);
    } finally {
      setMealToArchive(null);
    }
  }, [mealToArchive, archiveMutation, filters, markLibraryStale]);

  const handleUnarchive = useCallback(
    async (meal: Meal) => {
      try {
        const restored = await unarchiveMeal(meal.id);
        queryClient.setQueryData<Meal[]>(
          ["meals", buildParams(filters)],
          (prev) => prev?.map((m) => (m.id === meal.id ? restored : m)),
        );
        markLibraryStale();
        toast.success(`Meal "${meal.name}" unarchived.`);
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to unarchive meal."));
      }
    },
    [filters, markLibraryStale],
  );

  const hasActiveFilter =
    !!filters.search ||
    !!filters.dietaryTag ||
    !!filters.allergen ||
    filters.includeInactive ||
    filters.showArchivedOnly;

  const meals = mealsQuery.data ?? [];

  const filteredMeals = filters.showArchivedOnly
    ? meals.filter((m) => !m.isActive)
    : meals;

  return {
    meals,
    filteredMeals,
    loading: mealsQuery.isPending,
    error: toError(mealsQuery.error, "Failed to load meals. Please try again."),
    isRefreshing: mealsQuery.isFetching && !mealsQuery.isPending,
    filters,
    hasActiveFilter,
    handleFiltersChange,
    resetFilters,
    refreshData: () => void mealsQuery.refetch(),
    handleCreateMeal,
    handleUpdateMeal,
    handleUnarchive,
    actions: {
      mealToArchive,
      setMealToArchive,
      isArchiving: archiveMutation.isPending,
      handleArchiveConfirm,
    },
  };
}