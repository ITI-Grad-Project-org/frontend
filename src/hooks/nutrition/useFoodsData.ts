// src/hooks/useFoodsData.ts
import { useCallback, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getFoods,
  createFood,
  updateFood,
  archiveFood,
  unarchiveFood,
} from "@/services/nutrition";
import { getApiErrorMessage } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import type { Food, CreateFoodDto, UpdateFoodDto, ServingUnit, DietaryTag } from "@/types/nutrition";
import { toast } from "react-toastify";

export type FoodsFilters = {
  search: string;
  servingUnit: ServingUnit | "";
  dietaryTag: DietaryTag | "";
  allergen: string;
  includeInactive: boolean;
  showArchivedOnly: boolean;
};

const defaultFilters: FoodsFilters = {
  search: "",
  servingUnit: "",
  dietaryTag: "",
  allergen: "",
  includeInactive: false,
  showArchivedOnly: false,
};

function buildParams(f: FoodsFilters) {
  const params: Record<string, string | boolean> = {};
  if (f.search.trim()) params.search = f.search.trim();
  if (f.servingUnit) params.servingUnit = f.servingUnit;
  if (f.dietaryTag) params.dietaryTag = f.dietaryTag;
  if (f.allergen.trim()) params.allergen = f.allergen.trim();
  if (f.includeInactive || f.showArchivedOnly) params.includeInactive = true;
  return params;
}

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function useFoodsData() {
  const [filters, setFilters] = useState<FoodsFilters>(defaultFilters);

  // Archive modal state
  const [foodToArchive, setFoodToArchive] = useState<Food | null>(null);

  // Each filter combination is cached, so the food library loads once per
  // combo instead of on every page visit.
  const foodsQuery = useQuery({
    queryKey: ["foods", buildParams(filters)],
    queryFn: () => getFoods(buildParams(filters)),
    staleTime: 5 * 60_000,
  });

  const markLibraryStale = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["foods"],
      refetchType: "none",
    });
  }, []);

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveFood(id),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Failed to archive food.")),
  });

  const handleFiltersChange = useCallback((next: Partial<FoodsFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleCreateFood = useCallback(
    async (dto: CreateFoodDto): Promise<Food> => {
      try {
        const newFood = await createFood(dto);
        queryClient.setQueryData<Food[]>(
          ["foods", buildParams(filters)],
          (prev) => [newFood, ...(prev ?? [])],
        );
        markLibraryStale();
        toast.success(`Food "${newFood.name}" created.`);
        return newFood;
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to create food."));
        throw err;
      }
    },
    [filters, markLibraryStale],
  );

  const handleUpdateFood = useCallback(
    async (foodId: string, dto: UpdateFoodDto): Promise<Food> => {
      try {
        const updated = await updateFood(foodId, dto);
        queryClient.setQueryData<Food[]>(
          ["foods", buildParams(filters)],
          (prev) => prev?.map((f) => (f.id === foodId ? updated : f)),
        );
        markLibraryStale();
        toast.success(`Food "${updated.name}" updated.`);
        return updated;
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to update food."));
        throw err;
      }
    },
    [filters, markLibraryStale],
  );

  const handleArchiveConfirm = useCallback(async () => {
    if (!foodToArchive) return;
    try {
      await archiveMutation.mutateAsync(foodToArchive.id);
      queryClient.setQueryData<Food[]>(
        ["foods", buildParams(filters)],
        (prev) =>
          prev?.map((f) =>
            f.id === foodToArchive.id ? { ...f, isActive: false } : f,
          ),
      );
      markLibraryStale();
      toast.success(`Food "${foodToArchive.name}" archived.`);
    } finally {
      setFoodToArchive(null);
    }
  }, [foodToArchive, archiveMutation, filters, markLibraryStale]);

  const handleUnarchive = useCallback(
    async (food: Food) => {
      try {
        const restored = await unarchiveFood(food.id);
        queryClient.setQueryData<Food[]>(
          ["foods", buildParams(filters)],
          (prev) => prev?.map((f) => (f.id === food.id ? restored : f)),
        );
        markLibraryStale();
        toast.success(`Food "${food.name}" unarchived.`);
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to unarchive food."));
      }
    },
    [filters, markLibraryStale],
  );

  const hasActiveFilter =
    !!filters.search ||
    !!filters.servingUnit ||
    !!filters.dietaryTag ||
    !!filters.allergen ||
    filters.includeInactive ||
    filters.showArchivedOnly;

  const foods = foodsQuery.data ?? [];

  const filteredFoods = filters.showArchivedOnly
    ? foods.filter((f) => !f.isActive)
    : foods;

  return {
    foods,
    filteredFoods,
    loading: foodsQuery.isPending,
    error: toError(foodsQuery.error, "Failed to load foods. Please try again."),
    isRefreshing: foodsQuery.isFetching && !foodsQuery.isPending,
    filters,
    hasActiveFilter,
    handleFiltersChange,
    resetFilters,
    refreshData: () => void foodsQuery.refetch(),
    handleCreateFood,
    handleUpdateFood,
    handleUnarchive,
    actions: {
      foodToArchive,
      setFoodToArchive,
      isArchiving: archiveMutation.isPending,
      handleArchiveConfirm,
    },
  };
}