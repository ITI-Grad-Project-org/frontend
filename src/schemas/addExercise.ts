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

export const addExerciseSchema = z.object({
  name: z.string().trim().min(1, "Exercise name is required"),
  category: z.enum(["strength", "cardio", "mobility", "plyometric", "core"], {
    message: "Category is required",
  }),
  primaryMuscle: z.enum(
    [
      "chest",
      "back",
      "shoulders",
      "biceps",
      "triceps",
      "forearms",
      "quads",
      "hamstrings",
      "glutes",
      "calves",
      "core",
      "full_body",
    ],
    { message: "Primary muscle is required" },
  ),
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

export type AddExerciseFormData = z.infer<typeof addExerciseSchema>;
