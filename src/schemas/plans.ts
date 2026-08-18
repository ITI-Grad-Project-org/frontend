import { z } from "zod";
import { getLocalDateInputValue } from "@/lib/dates";

export { getLocalDateInputValue };

export const planGoalOptions = [
  { value: "fat_loss", label: "Fat loss" },
  { value: "muscle_gain", label: "Muscle gain" },
  { value: "recomposition", label: "Recomposition" },
  { value: "strength", label: "Strength" },
  { value: "endurance", label: "Endurance" },
  { value: "general_health", label: "General health" },
  { value: "yoga_mobility", label: "Yoga / mobility" },
] as const;

export const planDifficultyOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

const durationWeeksSchema = z
  .string()
  .trim()
  .refine(
    (value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 52,
    {
      message: "Use a whole number between 1 and 52",
    },
  );

const optionalDescriptionSchema = z.union([
  z.string().trim().max(5000, "Description must be 5,000 characters or fewer"),
  z.literal(""),
]);

export const createClientProgramSchema = z.object({
  membershipId: z.string().uuid("Select a client"),
  name: z
    .string()
    .trim()
    .min(2, "Plan name is required")
    .max(150, "Plan name must be 150 characters or fewer"),
  description: optionalDescriptionSchema.optional(),
  goal: z.enum([
    "fat_loss",
    "muscle_gain",
    "recomposition",
    "strength",
    "endurance",
    "general_health",
    "yoga_mobility",
  ]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  durationWeeks: durationWeeksSchema,
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
});

export type CreateClientProgramFormData = z.infer<
  typeof createClientProgramSchema
>;

export const updateClientProgramSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Plan name is required")
    .max(150, "Plan name must be 150 characters or fewer"),
  description: optionalDescriptionSchema.optional(),
  goal: z.enum([
    "fat_loss",
    "muscle_gain",
    "recomposition",
    "strength",
    "endurance",
    "general_health",
    "yoga_mobility",
  ]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
});

export type UpdateClientProgramFormData = z.infer<
  typeof updateClientProgramSchema
>;

export const defaultCreateClientProgramValues: CreateClientProgramFormData = {
  membershipId: "",
  name: "",
  description: "",
  goal: "general_health",
  difficulty: "beginner",
  durationWeeks: "8",
  startDate: getLocalDateInputValue(),
};

export const updateProgramDaySchema = z.object({
  name: z
    .string()
    .trim()
    .max(150, "Name must be 150 characters or fewer")
    .optional(),
  notes: z
    .string()
    .trim()
    .max(5000, "Notes must be 5,000 characters or fewer")
    .optional(),
  isRestDay: z.boolean(),
});

export type UpdateProgramDayFormData = z.infer<typeof updateProgramDaySchema>;

export const rescheduleSchema = z.object({
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .refine(
      (val) => val >= getLocalDateInputValue(),
      "Start date cannot be in the past",
    ),
});

export type RescheduleFormData = z.infer<typeof rescheduleSchema>;
