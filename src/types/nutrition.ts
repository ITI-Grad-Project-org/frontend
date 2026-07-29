// src/types/nutrition.ts

export type ServingUnit = "g" | "ml" | "piece" | "cup" | "tbsp" | "scoop";

export const SERVING_UNITS: { value: ServingUnit; label: string }[] = [
  { value: "g", label: "Grams (g)" },
  { value: "ml", label: "Milliliters (ml)" },
  { value: "piece", label: "Piece" },
  { value: "cup", label: "Cup" },
  { value: "tbsp", label: "Tablespoon (tbsp)" },
  { value: "scoop", label: "Scoop" },
];

export type DietaryTag =
  | "none"
  | "omnivore"
  | "halal"
  | "kosher"
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "gluten_free"
  | "keto"
  | "low_carb"
  | "intermittent_fasting";

export const DIETARY_TAGS: { value: DietaryTag; label: string }[] = [
  { value: "none", label: "None" },
  { value: "omnivore", label: "Omnivore" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "gluten_free", label: "Gluten-Free" },
  { value: "keto", label: "Keto" },
  { value: "low_carb", label: "Low Carb" },
  { value: "intermittent_fasting", label: "Intermittent Fasting" },
];

// ─── Food Types ────────────────────────────────────────────────────────────────

export interface Food {
  id: string;
  tenantId: string;
  name: string;
  brand?: string | null;
  servingSize: number;
  servingUnit: ServingUnit;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number | null;
  dietaryTags: DietaryTag[];
  allergens: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFoodDto {
  name: string;
  brand?: string | null;
  servingSize: number;
  servingUnit: ServingUnit;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number | null;
  dietaryTags?: DietaryTag[];
  allergens?: string[];
}

export interface UpdateFoodDto {
  name?: string;
  brand?: string | null;
  servingSize?: number;
  servingUnit?: ServingUnit;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number | null;
  dietaryTags?: DietaryTag[];
  allergens?: string[];
  isActive?: boolean;
}

export interface GetFoodsParams {
  search?: string;
  servingUnit?: ServingUnit;
  dietaryTag?: DietaryTag;
  allergen?: string;
  includeInactive?: boolean;
}

// ─── Meal Types ────────────────────────────────────────────────────────────────

export interface MealItemDto {
  foodId: string;
  amount: number;
}

export interface CreateMealDto {
  name: string;
  description?: string | null;
  photoUrl?: string | null;
  prepNotes?: string | null;
  dietaryTags?: DietaryTag[];
  allergens?: string[];
  items: MealItemDto[];
}

export interface UpdateMealDto {
  name?: string;
  description?: string | null;
  photoUrl?: string | null;
  prepNotes?: string | null;
  dietaryTags?: DietaryTag[];
  allergens?: string[];
  isActive?: boolean;
}

export interface ReplaceMealItemsDto {
  items: MealItemDto[];
}

export interface NutrientsSummary {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number | null;
}

export interface CoachMealFoodSummary {
  id: string;
  name: string;
  brand?: string | null;
  servingSize: number;
  servingUnit: ServingUnit;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number | null;
  dietaryTags: DietaryTag[];
  allergens: string[];
  isActive: boolean;
}

export interface MealIngredient {
  id: string;
  position: number;
  amount: number;
  servingUnit: ServingUnit;
  food: CoachMealFoodSummary;
  nutrients: NutrientsSummary;
}

export interface Meal {
  id: string;
  name: string;
  description?: string | null;
  photoUrl?: string | null;
  prepNotes?: string | null;
  dietaryTags: DietaryTag[];
  additionalAllergens: string[];
  effectiveAllergens: string[];
  isActive: boolean;
  ingredientCount: number;
  ingredients: MealIngredient[];
  totals: NutrientsSummary;
  createdAt: string;
  updatedAt: string;
}

export interface GetMealsParams {
  search?: string;
  dietaryTag?: DietaryTag;
  allergen?: string;
  includeInactive?: boolean;
}
