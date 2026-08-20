// src/schemas/ai.ts
import { z } from "zod";
import { getLocalDateInputValue } from "@/lib/dates";

export const aiPlanKindOptions: { value: "training" | "nutrition"; label: string }[] = [
  { value: "training", label: "Training plan" },
  { value: "nutrition", label: "Nutrition plan" },
];

export const aiPlanGoalOptions: { value: string; label: string }[] = [
  { value: "", label: "Not specified — use the client's intake" },
  { value: "fat_loss", label: "Fat loss" },
  { value: "muscle_gain", label: "Muscle gain" },
  { value: "recomposition", label: "Recomposition" },
  { value: "strength", label: "Strength" },
  { value: "endurance", label: "Endurance" },
  { value: "general_health", label: "General health" },
  { value: "yoga_mobility", label: "Yoga / mobility" },
];

const optionalGoalSchema = z.union([
  z.literal(""),
  z.enum([
    "fat_loss",
    "muscle_gain",
    "recomposition",
    "strength",
    "endurance",
    "general_health",
    "yoga_mobility",
  ]),
]);

const optionalDayCountSchema = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .refine(
      (value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 7,
      { message: "Use a whole number between 1 and 7" },
    ),
]);

export const aiPlanConfigSchema = z.object({
  membershipId: z.string().uuid("Select a client"),
  kind: z.enum(["training", "nutrition"]),
  daysPerWeek: optionalDayCountSchema,
  goal: optionalGoalSchema,
  coachNotes: z
    .string()
    .trim()
    .max(2000, "Notes must be 2,000 characters or fewer"),
});

export type AIPlanConfigFormData = z.input<typeof aiPlanConfigSchema>;

export const defaultAIPlanConfigValues: AIPlanConfigFormData = {
  membershipId: "",
  kind: "training",
  daysPerWeek: "",
  goal: "",
  coachNotes: "",
};

export const acceptSuggestionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Plan name is required")
    .max(150, "Plan name must be 150 characters or fewer"),
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .refine(
      (value) => value >= getLocalDateInputValue(),
      "Start date cannot be in the past",
    ),
});

export type AcceptSuggestionFormData = z.input<typeof acceptSuggestionSchema>;
export type AcceptSuggestionSubmitValues = z.output<typeof acceptSuggestionSchema>;

export const defaultAcceptSuggestionValues: AcceptSuggestionFormData = {
  name: "",
  startDate: getLocalDateInputValue(),
};