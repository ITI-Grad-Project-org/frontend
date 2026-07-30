// src/types/nutritionPlans.ts

export type NutritionPlanGoal =
  | "fat_loss"
  | "muscle_gain"
  | "recomposition"
  | "strength"
  | "endurance"
  | "general_health"
  | "yoga_mobility";

export type NutritionPlanStatus = "draft" | "published" | "cancelled";
export type NutritionPlanSchedulePhase = "scheduled" | "active" | "ended";

export interface NutritionPlanTargets {
  calories?: number | null;
  proteinG?: number | null;
  carbsG?: number | null;
  fatG?: number | null;
  fiberG?: number | null;
  waterMl?: number | null;
}

export interface NutritionPlanSummary {
  id: string;
  membershipId: string;
  membership?: {
    id: string;
    status: string;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl?: string | null;
    };
  };
  name: string;
  description?: string | null;
  goal?: NutritionPlanGoal | null;
  durationWeeks: number;
  startDate: string;
  endDate: string;
  targets?: NutritionPlanTargets | null;
  status: NutritionPlanStatus;
  schedulePhase?: NutritionPlanSchedulePhase | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientNutritionPlanPayload {
  membershipId: string;
  name: string;
  description?: string | null;
  goal?: NutritionPlanGoal | null;
  durationWeeks: number;
  startDate: string;
  targetCalories?: number | null;
  targetProteinG?: number | null;
  targetCarbsG?: number | null;
  targetFatG?: number | null;
  targetFiberG?: number | null;
  targetWaterMl?: number | null;
}

export interface UpdateClientNutritionPlanPayload {
  name?: string;
  description?: string | null;
  goal?: NutritionPlanGoal | null;
  startDate?: string;
  targetCalories?: number | null;
  targetProteinG?: number | null;
  targetCarbsG?: number | null;
  targetFatG?: number | null;
  targetFiberG?: number | null;
  targetWaterMl?: number | null;
}

export interface GetNutritionPlansParams {
  membershipId?: string;
  status?: NutritionPlanStatus;
  goal?: NutritionPlanGoal;
  search?: string;
  isArchived?: boolean;
}

// ─── Builder Tree Types ────────────────────────────────────────────────────────

export interface NutritionPlanWarning {
  type: string;
  dayId?: string;
  scheduledDate?: string;
  plannedMealId?: string;
  mealName?: string;
  preference?: string;
  allergen?: string;
  message: string;
  advisory?: boolean;
}

export interface NutritionClientDietaryProfile {
  dietaryPreferences?: string[];
  allergies?: string[];
}

export interface NutrientsSummary {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number | null;
}

export interface NutritionPlanFood {
  id: string;
  sourceFoodId?: string | null;
  sourceMealIngredientId?: string | null;
  position: number;
  foodName: string;
  brand?: string | null;
  servingSize: number;
  servingUnit: string;
  amount: number;
  nutrientsPerServing?: NutrientsSummary;
  nutrients?: NutrientsSummary;
}

export interface NutritionPlanMeal {
  id: string;
  sourceMealId?: string | null;
  mealName: string;
  description?: string | null;
  photoUrl?: string | null;
  prepNotes?: string | null;
  dietaryTags?: string[];
  allergens?: string[];
  slot?: string;
  position: number;
  suggestedTime?: string | null;
  coachNotes?: string | null;
  foods?: NutritionPlanFood[];
  totals?: NutrientsSummary;
}

export interface TargetVarianceItem {
  target: number;
  prescribed: number;
  absoluteDifference: number;
  percentageDifference: number;
}

export interface TargetVarianceMap {
  calories?: TargetVarianceItem;
  proteinG?: TargetVarianceItem;
  carbsG?: TargetVarianceItem;
  fatG?: TargetVarianceItem;
  fiberG?: TargetVarianceItem;
}

export interface NutritionPlanDay {
  id: string;
  dayNumber: number;
  scheduledDate: string;
  isFlexibleDay?: boolean;
  targetOverrides?: NutritionPlanTargets | null;
  effectiveTargets?: NutritionPlanTargets | null;
  prescribedTotals?: NutrientsSummary | null;
  variance?: TargetVarianceMap | null;
  notes?: string | null;
  warnings?: NutritionPlanWarning[];
  meals?: NutritionPlanMeal[];
}

export interface NutritionPlanWeek {
  id: string;
  weekNumber: number;
  notes?: string | null;
  days: NutritionPlanDay[];
}

export interface NutritionPlanTree extends NutritionPlanSummary {
  clientDietaryProfile?: NutritionClientDietaryProfile | null;
  dietaryAdvisoryNotice?: string | null;
  warnings?: NutritionPlanWarning[];
  weeks: NutritionPlanWeek[];
}
