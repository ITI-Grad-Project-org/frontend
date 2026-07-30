// src/schemas/nutritionPlans.ts
import { z } from "zod";

export const nutritionGoalOptions = [
  { value: "fat_loss", label: "Fat loss" },
  { value: "muscle_gain", label: "Muscle gain" },
  { value: "recomposition", label: "Recomposition" },
  { value: "strength", label: "Strength" },
  { value: "endurance", label: "Endurance" },
  { value: "general_health", label: "General health" },
  { value: "yoga_mobility", label: "Yoga / mobility" },
] as const;

export function getLocalDateInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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
