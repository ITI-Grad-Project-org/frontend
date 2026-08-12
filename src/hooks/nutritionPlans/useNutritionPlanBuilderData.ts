import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import {
  archiveNutritionPlan,
  deletePlannedMeal,
  getNutritionPlan,
  publishNutritionPlan,
  updateNutritionPlanDay,
  updatePlannedMeal,
} from "@/services/nutritionPlans";
import type {
  NutritionPlanDay,
  NutritionPlanMeal,
  NutritionPlanTree,
} from "@/types/nutritionPlans";
import {
  getPublishValidationMessage,
  reorderPlannedMeals,
} from "@/components/nutritionPlans/builder/builder-utils";

export function useNutritionPlanBuilderData(planId?: string) {
  const [tree, setTree] = useState<NutritionPlanTree | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeekId, setSelectedWeekId] = useState<string>("");
  const [reorderingDayId, setReorderingDayId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Keep the Nutrition Plans list fresh — edits made here must show when the
  // coach navigates back to /dashboard/nutrition-plans.
  useEffect(() => () => void queryClient.invalidateQueries({ queryKey: ["nutrition-plans"] }), []);

  const fetchTree = async () => {
    if (!planId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNutritionPlan(planId);
      setTree(data);
      if (data.weeks?.length > 0) {
        setSelectedWeekId((curr) => (curr && data.weeks.some((w) => w.id === curr) ? curr : data.weeks[0].id));
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to load nutrition plan builder.");
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTree();
  }, [planId]);

  const activeWeek = useMemo(() => {
    if (!tree?.weeks?.length) return null;
    return tree.weeks.find((w) => w.id === selectedWeekId) || tree.weeks[0];
  }, [tree, selectedWeekId]);

  // ─── Local tree updaters (avoid full re-fetch for meal-level changes) ──────

  function addMealToDay(dayId: string, plannedMeal: NutritionPlanMeal) {
    setTree((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weeks: prev.weeks.map((week) => ({
          ...week,
          days: week.days.map((day) =>
            day.id === dayId
              ? {
                ...day,
                meals: [...(day.meals || []), plannedMeal].sort(
                  (a, b) => (a.position || 0) - (b.position || 0),
                ),
              }
              : day,
          ),
        })),
      };
    });
  }

  function updateMeal(updatedMeal: NutritionPlanMeal) {
    setTree((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weeks: prev.weeks.map((week) => ({
          ...week,
          days: week.days.map((day) => ({
            ...day,
            meals: (day.meals || []).map((m) =>
              m.id === updatedMeal.id ? updatedMeal : m,
            ),
          })),
        })),
      };
    });
  }

  function deleteMealLocal(mealId: string) {
    setTree((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weeks: prev.weeks.map((week) => ({
          ...week,
          days: week.days.map((day) => ({
            ...day,
            meals: (day.meals || []).filter((m) => m.id !== mealId),
          })),
        })),
      };
    });
  }

  function updateDay(updatedDay: NutritionPlanDay) {
    setTree((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weeks: prev.weeks.map((week) => ({
          ...week,
          days: week.days.map((day) =>
            day.id === updatedDay.id ? updatedDay : day,
          ),
        })),
      };
    });
  }

  // ─── DnD handlers ───────────────────────────────────────────────────────────

  // Case 2: planned meal → planned meal (same-day reorder). Returns true if handled.
  function handlePlannedMealDrag(draggedMeal: NutritionPlanMeal, targetMeal: NutritionPlanMeal, draggedDayId: string, targetDayId: string): boolean {
    if (!draggedMeal || !targetMeal || draggedMeal.id === targetMeal.id) return false;
    // Only handle same-day reordering
    if (draggedDayId !== targetDayId) return false;

    const currentDay = activeWeek?.days.find((d) => d.id === draggedDayId);
    if (!currentDay || !currentDay.meals) return false;

    const reordered = reorderPlannedMeals(currentDay.meals, draggedMeal.id, targetMeal.id);
    const newPosition = reordered.find((m) => m.id === draggedMeal.id)?.position ?? 1;

    // Snapshot for rollback
    const snapshot = currentDay.meals.slice();

    // Optimistic update
    setTree((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weeks: prev.weeks.map((week) => ({
          ...week,
          days: week.days.map((day) =>
            day.id === draggedDayId
              ? { ...day, meals: reordered }
              : day,
          ),
        })),
      };
    });

    setReorderingDayId(draggedDayId);
    void (async () => {
      try {
        await updatePlannedMeal(tree!.id, draggedMeal.id, { position: newPosition });
      } catch (err) {
        // Roll back
        setTree((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            weeks: prev.weeks.map((week) => ({
              ...week,
              days: week.days.map((day) =>
                day.id === draggedDayId ? { ...day, meals: snapshot } : day,
              ),
            })),
          };
        });
        toast.error(getApiErrorMessage(err, "Could not reorder this meal."));
      } finally {
        setReorderingDayId(null);
      }
    })();

    return true;
  }

  // ─── Action handlers ────────────────────────────────────────────────────────

  async function publishPlan(): Promise<boolean> {
    if (!tree) return false;
    setIsPublishing(true);
    try {
      await publishNutritionPlan(tree.id);
      toast.success("Nutrition plan published successfully.");
      setIsPublishing(false);
      await fetchTree();
      return true;
    } catch (err) {
      const validationMessage = getPublishValidationMessage(err);
      toast.error(validationMessage ?? getApiErrorMessage(err, "Could not publish plan. Every day must contain valid food prescriptions."), {
        autoClose: validationMessage ? 8000 : 5000,
      });
      setIsPublishing(false);
      return false;
    }
  }

  async function archivePlan(): Promise<boolean> {
    if (!tree) return false;
    setIsArchiving(true);
    try {
      await archiveNutritionPlan(tree.id);
      toast.success("Nutrition plan archived.");
      setIsArchiving(false);
      await fetchTree();
      return true;
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not archive plan."));
      setIsArchiving(false);
      return false;
    }
  }

  async function removePlannedMeal(meal: NutritionPlanMeal): Promise<boolean> {
    if (!tree) return false;
    try {
      await deletePlannedMeal(tree.id, meal.id);
      toast.success("Planned meal removed.");
      deleteMealLocal(meal.id);
      return true;
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete planned meal."));
      return false;
    }
  }

  async function toggleFlexibleDay(day: NutritionPlanDay): Promise<boolean> {
    if (!tree) return false;
    const next = !day.isFlexibleDay;
    // Optimistic update
    updateDay({ ...day, isFlexibleDay: next });
    try {
      const updated = await updateNutritionPlanDay(tree.id, day.id, { isFlexibleDay: next });
      updateDay(updated);
      return true;
    } catch (err) {
      // Roll back
      updateDay(day);
      toast.error(getApiErrorMessage(err, "Could not update flexible day status."));
      return false;
    }
  }

  return {
    tree,
    isLoading,
    error,
    selectedWeekId,
    setSelectedWeekId,
    activeWeek,
    reorderingDayId,
    isPublishing,
    isArchiving,
    fetchTree,
    addMealToDay,
    updateMeal,
    updateDay,
    handlePlannedMealDrag,
    publishPlan,
    archivePlan,
deletePlannedMeal: removePlannedMeal,
    toggleFlexibleDay,
  };
}