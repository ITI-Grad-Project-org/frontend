import { z } from "zod";
import { toNumber, toNumberOrNull } from "./addDayExercise";
import type { DietaryTag, ServingUnit } from "@/types/nutrition";
import { SERVING_UNITS, DIETARY_TAGS } from "@/types/nutrition";

// ─── Constants ────────────────────────────────────────────────────────────────

export const SERVING_UNIT_VALUES = SERVING_UNITS.map((u) => u.value) as [
  ServingUnit,
  ...ServingUnit[],
];

export const DIETARY_TAG_VALUES = DIETARY_TAGS.map((t) => t.value) as [
  DietaryTag,
  ...DietaryTag[],
];

// ─── Schema ───────────────────────────────────────────────────────────────────

export const addEditFoodSchema = z.object({
  name: z.string().trim().min(1, "Food name is required").max(150, "Food name cannot exceed 150 characters"),
  brand: z.string().trim().max(150, "Brand cannot exceed 150 characters"),
  servingSize: z.preprocess(
    toNumber,
    z.number().min(0.1, "Serving size must be greater than 0").max(1000, "Serving size must be between 1 and 1000"),
  ),
  servingUnit: z.enum(SERVING_UNIT_VALUES),
  calories: z.preprocess(
    toNumber,
    z.number().min(0, "Calories must be between 0 and 2000").max(2000, "Calories must be between 0 and 2000"),
  ),
  proteinG: z.preprocess(
    toNumber,
    z.number().min(0, "Protein must be between 0 and 150g").max(150, "Protein must be between 0 and 150g"),
  ),
  carbsG: z.preprocess(
    toNumber,
    z.number().min(0, "Carbohydrates must be between 0 and 300g").max(300, "Carbohydrates must be between 0 and 300g"),
  ),
  fatG: z.preprocess(
    toNumber,
    z.number().min(0, "Fat must be between 0 and 150g").max(150, "Fat must be between 0 and 150g"),
  ),
  fiberG: z.preprocess(
    toNumberOrNull,
    z.number().min(0, "Fiber must be between 0 and 75g").max(75, "Fiber must be between 0 and 75g").nullable(),
  ),
  dietaryTags: z
    .array(z.enum(DIETARY_TAG_VALUES))
    .max(11, "Too many dietary tags")
    .refine((v) => new Set(v).size === v.length, "Dietary tags cannot contain duplicates")
    .refine(
      (v) => !v.includes("none") || v.length === 1,
      "The 'None' tag cannot be combined with other tags",
    ),
  allergens: z.array(z.string()).max(30, "Too many allergens"),
});

export type AddEditFoodFormValues = z.input<typeof addEditFoodSchema>;
export type AddEditFoodSubmitValues = z.output<typeof addEditFoodSchema>;

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function getFoodDefaults(
  food?: {
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
  },
): AddEditFoodFormValues {
  return {
    name: food?.name ?? "",
    brand: food?.brand ?? "",
    servingSize: String(food?.servingSize ?? 100),
    servingUnit: food?.servingUnit ?? "g",
    calories: String(food?.calories ?? 165),
    proteinG: String(food?.proteinG ?? 31),
    carbsG: String(food?.carbsG ?? 0),
    fatG: String(food?.fatG ?? 3.6),
    fiberG: food?.fiberG != null ? String(food.fiberG) : "",
    dietaryTags: food?.dietaryTags?.length ? food.dietaryTags : ["none"],
    allergens: food?.allergens ?? [],
  };
}

export function toFoodSubmitDto(values: AddEditFoodSubmitValues) {
  return {
    name: values.name,
    brand: values.brand.trim() || null,
    servingSize: values.servingSize,
    servingUnit: values.servingUnit,
    calories: values.calories,
    proteinG: values.proteinG,
    carbsG: values.carbsG,
    fatG: values.fatG,
    fiberG: values.fiberG ?? 0,
    dietaryTags: values.dietaryTags,
    allergens: values.allergens,
  };
}