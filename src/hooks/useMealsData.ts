// src/hooks/useMealsData.ts
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getMeals,
  createMeal,
  updateMeal,
  replaceMealItems,
  archiveMeal,
  unarchiveMeal,
} from "@/services/nutrition";
import { getApiErrorMessage } from "@/lib/api";
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

export function useMealsData() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<MealsFilters>(defaultFilters);

  // Archive modal state
  const [mealToArchive, setMealToArchive] = useState<Meal | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const seqRef = useRef(0);
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  });

  const fetchMeals = useCallback(async (isRefresh = false) => {
    const seq = ++seqRef.current;
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const data = await getMeals(buildParams(filtersRef.current));
      if (seq !== seqRef.current) return;
      setMeals(data);
    } catch (err) {
      if (seq !== seqRef.current) return;
      setError(getApiErrorMessage(err, "Failed to load meals. Please try again."));
    } finally {
      if (seq === seqRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchMeals();
  }, [
    filters.search,
    filters.dietaryTag,
    filters.allergen,
    filters.includeInactive,
    filters.showArchivedOnly,
    fetchMeals,
  ]);

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
        toast.success(`Meal "${newMeal.name}" created.`);
        void fetchMeals(true);
        return newMeal;
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to create meal."));
        throw err;
      }
    },
    [fetchMeals]
  );

  const handleUpdateMeal = useCallback(
    async (
      mealId: string,
      metaDto: UpdateMealDto,
      recipeDto?: ReplaceMealItemsDto
    ): Promise<Meal> => {
      try {
        // Strip items if present because PATCH /nutrition/library/meals/:mealId rejects items
        const { items: _items, ...patchBody } = metaDto as UpdateMealDto & { items?: unknown };
        let updated = await updateMeal(mealId, patchBody);
        if (recipeDto && recipeDto.items.length > 0) {
          updated = await replaceMealItems(mealId, recipeDto);
        }
        toast.success(`Meal "${updated.name}" updated.`);
        setMeals((prev) => prev.map((m) => (m.id === mealId ? updated : m)));
        return updated;
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to update meal."));
        throw err;
      }
    },
    []
  );

  const handleArchiveConfirm = useCallback(async () => {
    if (!mealToArchive) return;
    setIsArchiving(true);
    try {
      await archiveMeal(mealToArchive.id);
      toast.success(`Meal "${mealToArchive.name}" archived.`);
      setMeals((prev) =>
        prev.map((m) => (m.id === mealToArchive.id ? { ...m, isActive: false } : m))
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to archive meal."));
    } finally {
      setIsArchiving(false);
      setMealToArchive(null);
    }
  }, [mealToArchive]);

  const handleUnarchive = useCallback(async (meal: Meal) => {
    try {
      const restored = await unarchiveMeal(meal.id);
      toast.success(`Meal "${meal.name}" unarchived.`);
      setMeals((prev) => prev.map((m) => (m.id === meal.id ? restored : m)));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to unarchive meal."));
    }
  }, []);

  const hasActiveFilter =
    !!filters.search ||
    !!filters.dietaryTag ||
    !!filters.allergen ||
    filters.includeInactive ||
    filters.showArchivedOnly;

  const filteredMeals = filters.showArchivedOnly
    ? meals.filter((m) => !m.isActive)
    : meals;

  return {
    meals,
    filteredMeals,
    loading,
    error,
    isRefreshing,
    filters,
    hasActiveFilter,
    handleFiltersChange,
    resetFilters,
    refreshData: () => fetchMeals(true),
    handleCreateMeal,
    handleUpdateMeal,
    handleUnarchive,
    actions: {
      mealToArchive,
      setMealToArchive,
      isArchiving,
      handleArchiveConfirm,
    },
  };
}
