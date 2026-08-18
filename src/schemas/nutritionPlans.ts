// src/schemas/nutritionPlans.ts
import { z } from "zod";
import { getLocalDateInputValue } from "@/lib/dates";

export { getLocalDateInputValue };

export const nutritionGoalOptions = [
  { value: "fat_loss", label: "Fat loss" },
  { value: "muscle_gain", label: "Muscle gain" },
  { value: "recomposition", label: "Recomposition" },
  { value: "strength", label: "Strength" },
  { value: "endurance", label: "Endurance" },
  { value: "general_health", label: "General health" },
  { value: "yoga_mobility", label: "Yoga / mobility" },
] as const;

const optionalDescriptionSchema = z.union([
  z.string().trim().max(5000, "Description must be 5,000 characters or fewer"),
  z.literal(""),
]);

const durationWeeksSchema = z
  .string()
  .trim()
  .refine(
    (value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 52,
    {
      message: "Duration must be a whole number between 1 and 52 weeks",
    },
  );

const optionalNumericTarget = (min: number, max: number, label: string) =>
  z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    })
    .refine(
      (val) => val === null || (val >= min && val <= max),
      { message: `${label} must be between ${min} and ${max}` },
    );

export const createNutritionPlanSchema = z.object({
  membershipId: z.string().uuid("Select a client"),
  name: z
    .string()
    .trim()
    .min(1, "Plan name is required")
    .max(150, "Plan name must be 150 characters or fewer"),
  description: optionalDescriptionSchema.optional(),
  goal: z
    .enum([
      "fat_loss",
      "muscle_gain",
      "recomposition",
      "strength",
      "endurance",
      "general_health",
      "yoga_mobility",
      "",
    ])
    .optional()
    .transform((val) => (val === "" ? null : val)),
  durationWeeks: durationWeeksSchema,
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  targetCalories: optionalNumericTarget(800, 6000, "Target calories"),
  targetProteinG: optionalNumericTarget(1, 350, "Target protein (g)"),
  targetCarbsG: optionalNumericTarget(0, 800, "Target carbs (g)"),
  targetFatG: optionalNumericTarget(1, 200, "Target fat (g)"),
  targetFiberG: optionalNumericTarget(0, 100, "Target fiber (g)"),
  targetWaterMl: optionalNumericTarget(250, 6000, "Target water (ml)"),
});

export type CreateNutritionPlanFormData = z.input<typeof createNutritionPlanSchema>;
export type CreateNutritionPlanParsedData = z.output<typeof createNutritionPlanSchema>;

export const updateNutritionPlanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Plan name is required")
    .max(150, "Plan name must be 150 characters or fewer"),
  description: optionalDescriptionSchema.optional(),
  goal: z
    .enum([
      "fat_loss",
      "muscle_gain",
      "recomposition",
      "strength",
      "endurance",
      "general_health",
      "yoga_mobility",
      "",
    ])
    .optional()
    .transform((val) => (val === "" ? null : val)),
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  targetCalories: optionalNumericTarget(800, 6000, "Target calories"),
  targetProteinG: optionalNumericTarget(1, 350, "Target protein (g)"),
  targetCarbsG: optionalNumericTarget(0, 800, "Target carbs (g)"),
  targetFatG: optionalNumericTarget(1, 200, "Target fat (g)"),
  targetFiberG: optionalNumericTarget(0, 100, "Target fiber (g)"),
  targetWaterMl: optionalNumericTarget(250, 6000, "Target water (ml)"),
});

export type UpdateNutritionPlanFormData = z.input<typeof updateNutritionPlanSchema>;
export type UpdateNutritionPlanParsedData = z.output<typeof updateNutritionPlanSchema>;

export const defaultCreateNutritionPlanValues: CreateNutritionPlanFormData = {
  membershipId: "",
  name: "",
  description: "",
  goal: "fat_loss",
  durationWeeks: "4",
  startDate: getLocalDateInputValue(),
  targetCalories: "",
  targetProteinG: "",
  targetCarbsG: "",
  targetFatG: "",
  targetFiberG: "",
  targetWaterMl: "",
};

// ─── Day & Meal Builder Schemas ───────────────────────────────────────────────

export const updateNutritionPlanDaySchema = z.object({
  isFlexibleDay: z.boolean(),
  notes: optionalDescriptionSchema.optional(),
  targetCaloriesOverride: optionalNumericTarget(800, 6000, "Calorie override"),
  targetProteinGOverride: optionalNumericTarget(1, 350, "Protein override (g)"),
  targetCarbsGOverride: optionalNumericTarget(0, 800, "Carbs override (g)"),
  targetFatGOverride: optionalNumericTarget(1, 200, "Fat override (g)"),
  targetFiberGOverride: optionalNumericTarget(0, 100, "Fiber override (g)"),
  targetWaterMlOverride: optionalNumericTarget(250, 6000, "Water override (ml)"),
});

export type UpdateNutritionPlanDayFormData = z.input<typeof updateNutritionPlanDaySchema>;
export type UpdateNutritionPlanDayParsedData = z.output<typeof updateNutritionPlanDaySchema>;

export const mealSlotEnum = z.enum([
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "pre_workout",
  "post_workout",
]);

export const addMealFromLibrarySchema = z.object({
  mealId: z.string().uuid("Valid meal required"),
  slot: mealSlotEnum,
  position: z.number().int().min(1).max(10),
  suggestedTime: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:mm (e.g. 08:30)")
    .or(z.literal(""))
    .nullable()
    .optional(),
  coachNotes: optionalDescriptionSchema.optional(),
  itemOverrides: z
    .array(
      z.object({
        mealIngredientId: z.string(),
        foodName: z.string(),
        servingUnit: z.string(),
        amount: z.number().min(0, "Amount must be >= 0").max(1500, "Amount must be <= 1500"),
      })
    )
    .optional(),
});

export type AddMealFromLibraryFormData = z.input<typeof addMealFromLibrarySchema>;
export type AddMealFromLibraryParsedData = z.output<typeof addMealFromLibrarySchema>;


export const editPlannedMealSchema = z.object({
  slot: mealSlotEnum,
  position: z.number().int().min(1).max(10),
  suggestedTime: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:mm (e.g. 08:30)")
    .or(z.literal(""))
    .nullable()
    .optional(),
  coachNotes: optionalDescriptionSchema.optional(),
  foods: z.array(
    z.object({
      plannedMealFoodId: z.string(),
      foodName: z.string(),
      servingUnit: z.string(),
      amount: z.number().min(0.01, "Amount must be greater than 0").max(1500, "Amount must be <= 1500"),
    })
  ),
});

export type EditPlannedMealFormData = z.input<typeof editPlannedMealSchema>;
export type EditPlannedMealParsedData = z.output<typeof editPlannedMealSchema>;

