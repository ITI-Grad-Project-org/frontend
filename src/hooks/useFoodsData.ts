// src/hooks/useFoodsData.ts
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getFoods,
  createFood,
  updateFood,
  archiveFood,
  unarchiveFood,
} from "@/services/nutrition";
import { getApiErrorMessage } from "@/lib/api";
import type {
  Food,
  CreateFoodDto,
  UpdateFoodDto,
  ServingUnit,
  DietaryTag,
} from "@/types/nutrition";
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

export function useFoodsData() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<FoodsFilters>(defaultFilters);

  // Archive modal state
  const [foodToArchive, setFoodToArchive] = useState<Food | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const seqRef = useRef(0);
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  });

  const fetchFoods = useCallback(async (isRefresh = false) => {
    const seq = ++seqRef.current;
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const data = await getFoods(buildParams(filtersRef.current));
      if (seq !== seqRef.current) return;
      setFoods(data);
    } catch (err) {
      if (seq !== seqRef.current) return;
      setError(getApiErrorMessage(err, "Failed to load foods. Please try again."));
    } finally {
      if (seq === seqRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchFoods();
  }, [
    filters.search,
    filters.servingUnit,
    filters.dietaryTag,
    filters.allergen,
    filters.includeInactive,
    filters.showArchivedOnly,
    fetchFoods,
  ]);

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
        toast.success(`Food "${newFood.name}" created.`);
        void fetchFoods(true);
        return newFood;
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to create food."));
        throw err;
      }
    },
    [fetchFoods]
  );

  const handleUpdateFood = useCallback(
    async (foodId: string, dto: UpdateFoodDto): Promise<Food> => {
      try {
        const updated = await updateFood(foodId, dto);
        toast.success(`Food "${updated.name}" updated.`);
        setFoods((prev) => prev.map((f) => (f.id === foodId ? updated : f)));
        return updated;
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to update food."));
        throw err;
      }
    },
    []
  );

  const handleArchiveConfirm = useCallback(async () => {
    if (!foodToArchive) return;
    setIsArchiving(true);
    try {
      await archiveFood(foodToArchive.id);
      toast.success(`Food "${foodToArchive.name}" archived.`);
      setFoods((prev) =>
        prev.map((f) => (f.id === foodToArchive.id ? { ...f, isActive: false } : f))
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to archive food."));
    } finally {
      setIsArchiving(false);
      setFoodToArchive(null);
    }
  }, [foodToArchive]);

  const handleUnarchive = useCallback(async (food: Food) => {
    try {
      const restored = await unarchiveFood(food.id);
      toast.success(`Food "${food.name}" unarchived.`);
      setFoods((prev) => prev.map((f) => (f.id === food.id ? restored : f)));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to unarchive food."));
    }
  }, []);

  const hasActiveFilter =
    !!filters.search ||
    !!filters.servingUnit ||
    !!filters.dietaryTag ||
    !!filters.allergen ||
    filters.includeInactive ||
    filters.showArchivedOnly;

  const filteredFoods = filters.showArchivedOnly
    ? foods.filter((f) => !f.isActive)
    : foods;

  return {
    foods,
    filteredFoods,
    loading,
    error,
    isRefreshing,
    filters,
    hasActiveFilter,
    handleFiltersChange,
    resetFilters,
    refreshData: () => fetchFoods(true),
    handleCreateFood,
    handleUpdateFood,
    handleUnarchive,
    actions: {
      foodToArchive,
      setFoodToArchive,
      isArchiving,
      handleArchiveConfirm,
    },
  };
}
