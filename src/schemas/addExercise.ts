import { z } from "zod";

export const CATEGORY_OPTIONS = [
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "mobility", label: "Mobility" },
  { value: "plyometric", label: "Plyometric" },
  { value: "core", label: "Core" },
] as const;

export const MUSCLE_OPTIONS = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "biceps", label: "Biceps" },
  { value: "triceps", label: "Triceps" },
  { value: "forearms", label: "Forearms" },
  { value: "quads", label: "Quads" },
  { value: "hamstrings", label: "Hamstrings" },
  { value: "glutes", label: "Glutes" },
  { value: "calves", label: "Calves" },
  { value: "core", label: "Core" },
  { value: "full_body", label: "Full Body" },
] as const;

export const EQUIPMENT_OPTIONS = [
  { value: "none", label: "Bodyweight / None" },
  { value: "dumbbells", label: "Dumbbells" },
  { value: "barbell", label: "Barbell" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "resistance_bands", label: "Resistance Bands" },
  { value: "machines", label: "Machines" },
  { value: "full_gym", label: "Full Gym" },
] as const;

export const MUSCLE_VALUES = MUSCLE_OPTIONS.map((o) => o.value);
export const EQUIPMENT_VALUES = EQUIPMENT_OPTIONS.map((o) => o.value);

export const addExerciseSchema = z.object({
  name: z.string().trim().min(1, "Exercise name is required"),
  category: z.enum(CATEGORY_OPTIONS.map((o) => o.value), {
    message: "Category is required",
  }),
  primaryMuscle: z.enum(MUSCLE_VALUES, {
    message: "Primary muscle is required",
  }),
  secondaryMuscles: z
    .array(z.enum(MUSCLE_VALUES))
    .max(12, "Max 12 secondary muscles")
    .refine((v) => new Set(v).size === v.length, "Secondary muscles cannot contain duplicates"),
  equipment: z
    .array(z.enum(EQUIPMENT_VALUES))
    .max(7, "Max 7 equipment items")
    .refine((v) => new Set(v).size === v.length, "Equipment cannot contain duplicates"),
  instructionSteps: z
    .array(
      z.object({
        value: z
          .string()
          .trim()
          .min(1, "Step cannot be empty")
          .max(500, "Step must be 500 characters or fewer"),
      }),
    )
    .min(1, "Add at least one instruction step")
    .max(10, "Max 10 instruction steps"),
  thumbnailUrl: z
    .union([z.string().trim().url("Enter a valid URL"), z.literal("")])
    .optional(),
  demoVideoUrl: z
    .union([z.string().trim().url("Enter a valid URL"), z.literal("")])
    .optional(),
  demoGifUrl: z
    .union([z.string().trim().url("Enter a valid URL"), z.literal("")])
    .optional(),
});

export type AddExerciseFormData = z.input<typeof addExerciseSchema>;
export type AddExerciseSubmitValues = z.output<typeof addExerciseSchema>;

export function makeDefaultInstructionStep(): AddExerciseFormData["instructionSteps"][number] {
  return { value: "" };
}

export function getDefaultExerciseValues(
  exercise?: {
    name?: string;
    category?: AddExerciseFormData["category"];
    primaryMuscle?: AddExerciseFormData["primaryMuscle"];
    secondaryMuscles?: string[];
    equipment?: string[];
    instructionSteps?: string[];
    thumbnailUrl?: string | null;
    demoVideoUrl?: string | null;
    demoGifUrl?: string | null;
  },
): AddExerciseFormData {
  return {
    name: exercise?.name ?? "",
    category: exercise?.category as AddExerciseFormData["category"],
    primaryMuscle:
      (exercise?.primaryMuscle as AddExerciseFormData["primaryMuscle"]) ?? "",
    secondaryMuscles: (exercise?.secondaryMuscles ?? []) as AddExerciseFormData["secondaryMuscles"],
    equipment: (exercise?.equipment?.length ? exercise.equipment : ["none"]) as AddExerciseFormData["equipment"],
    instructionSteps: exercise?.instructionSteps?.length
      ? exercise.instructionSteps.map((s) => ({ value: s }))
      : [makeDefaultInstructionStep()],
    thumbnailUrl: exercise?.thumbnailUrl ?? "",
    demoVideoUrl: exercise?.demoVideoUrl ?? "",
    demoGifUrl: exercise?.demoGifUrl ?? "",
  };
}
