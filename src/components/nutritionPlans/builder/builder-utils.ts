import type { NutritionPlanMeal } from "@/types/nutritionPlans";
import type { Meal } from "@/types/nutrition";

export const formatTo12Hour = (time24: string) => {
  if (!time24) return "";
  const [hoursStr, minutesStr = "00"] = time24.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export function getOverlayMeal(data: unknown): Meal | null {
  if (!data || typeof data !== "object") return null;
  const item = data as Record<string, unknown>;
  if (item.kind === "library-meal" && item.meal) {
    return item.meal as Meal;
  }
  return null;
}

export function getOverlayDisplayMeal(data: unknown): { name: string; slot?: string } | null {
  if (!data || typeof data !== "object") return null;
  const item = data as Record<string, unknown>;

  if (item.kind === "library-meal" && item.meal) {
    const meal = item.meal as Meal;
    return { name: meal.name };
  }

  if (item.kind === "planned-meal" && item.meal) {
    const meal = item.meal as NutritionPlanMeal;
    return { name: meal.mealName, slot: meal.slot ?? undefined };
  }

  return null;
}

export function reorderPlannedMeals(
  meals: NutritionPlanMeal[],
  draggedId: string,
  targetId: string,
): NutritionPlanMeal[] {
  const ordered = meals.slice().sort((a, b) => (a.position || 0) - (b.position || 0));
  const fromIndex = ordered.findIndex((m) => m.id === draggedId);
  const toIndex = ordered.findIndex((m) => m.id === targetId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return ordered;
  const [moved] = ordered.splice(fromIndex, 1);
  ordered.splice(toIndex, 0, moved);
  return ordered.map((m, i) => ({ ...m, position: i + 1 }));
}

export function getPublishValidationMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;

  const axiosError = error as { response?: { data?: unknown } };
  const data = axiosError.response?.data;
  if (!data || typeof data !== "object") return null;

  const body = data as {
    message?: string;
    errors?: Array<{
      weekNumber?: number;
      dayNumber?: number;
      scheduledDate?: string;
      issues?: Array<{ code?: string; fields?: string[]; message?: string }>;
    }>;
  };

  if (!Array.isArray(body.errors) || body.errors.length === 0) return null;

  const missingMeals: string[] = [];
  const missingTargets: string[] = [];

  for (const entry of body.errors) {
    const label = `W${entry.weekNumber ?? "?"}D${entry.dayNumber ?? "?"}`;
    for (const issue of entry.issues ?? []) {
      if (issue.code === "missing_planned_meal") missingMeals.push(label);
      if (issue.code === "missing_required_targets") missingTargets.push(label);
    }
  }

  if (missingMeals.length === 0 && missingTargets.length === 0) return null;

  const lines: string[] = ["Can't publish — fix the following:"];

  if (missingMeals.length > 0) {
    const summary =
      missingMeals.length <= 5
        ? missingMeals.join(", ")
        : `${missingMeals.slice(0, 5).join(", ")} +${missingMeals.length - 5} more`;
    lines.push(`• ${missingMeals.length} day(s) have no meals (${summary}) — add meals or mark as flexible.`);
  }

  if (missingTargets.length > 0) {
    const summary =
      missingTargets.length <= 5
        ? missingTargets.join(", ")
        : `${missingTargets.slice(0, 5).join(", ")} +${missingTargets.length - 5} more`;
    lines.push(`• ${missingTargets.length} day(s) are missing macro targets (${summary}) — set protein, carbs & fat targets via Configure Day or plan-level targets.`);
  }

  return lines.join("\n");
}