import { z } from "zod";
import { setFormSchema, toNumber, toNumberOrNull } from "./addDayExercise";

// ─── Constants ────────────────────────────────────────────────────────────────

export const CATEGORY_VALUES = ["strength", "cardio", "mobility", "plyometric", "core"] as const;

export const MUSCLE_VALUES = [
    "chest", "back", "shoulders", "biceps", "triceps", "forearms",
    "quads", "hamstrings", "glutes", "calves", "core", "full_body",
] as const;

export const EQUIPMENT_VALUES = [
    "none", "dumbbells", "barbell", "kettlebell",
    "resistance_bands", "machines", "full_gym",
] as const;

// ─── Schema ───────────────────────────────────────────────────────────────────

const optionalUrl = z.union([z.string().trim().url("Enter a valid URL"), z.literal("")]);

export const createExerciseAndAddToDayFormSchema = z.object({
    // ── Exercise section ──────────────────────────────────────────────────────
    name: z.string().trim().min(1, "Exercise name is required").max(150, "Max 150 characters"),
    category: z.enum(CATEGORY_VALUES, { message: "Category is required" }),
    primaryMuscle: z.enum(MUSCLE_VALUES, { message: "Primary muscle is required" }),
    // Chip arrays — managed via Controller, validated here
    secondaryMuscles: z
        .array(z.enum(MUSCLE_VALUES))
        .max(12, "Max 12 secondary muscles")
        .refine((v) => new Set(v).size === v.length, "Secondary muscles cannot contain duplicates"),
    equipment: z
        .array(z.enum(EQUIPMENT_VALUES))
        .max(7, "Max 7 equipment items")
        .refine((v) => new Set(v).size === v.length, "Equipment cannot contain duplicates"),
    demoVideoUrl: optionalUrl.optional(),
    demoGifUrl: optionalUrl.optional(),
    thumbnailUrl: optionalUrl.optional(),
    // Instruction steps — each item is { value: string }; useFieldArray needs an object
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

    // ── Prescription section ──────────────────────────────────────────────────
    position:      z.preprocess(toNumber,       z.number({ message: "Position is required" }).int().min(1, "Min 1").max(30, "Max 30")),
    supersetGroup: z.preprocess(toNumberOrNull, z.number().int().min(1, "Min 1").max(30, "Max 30").nullable()),
    restSeconds:   z.preprocess(toNumber,       z.number({ message: "Rest seconds is required" }).int().min(0, "Min 0").max(3600, "Max 3600")),
    tempo0: z.string().regex(/^[0-9Xx]$/, "Use a digit or X"),
    tempo1: z.string().regex(/^[0-9Xx]$/, "Use a digit or X"),
    tempo2: z.string().regex(/^[0-9Xx]$/, "Use a digit or X"),
    tempo3: z.string().regex(/^[0-9Xx]$/, "Use a digit or X"),
    coachNotes: z.string().trim().max(5000, "Max 5,000 characters"),
    sets: z.array(setFormSchema).min(1, "Add at least one set").max(20, "Max 20 sets"),
});

export type CreateExerciseAndAddToDayFormValues  = z.input<typeof createExerciseAndAddToDayFormSchema>;
export type CreateExerciseAndAddToDaySubmitValues = z.output<typeof createExerciseAndAddToDayFormSchema>;

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function makeDefaultSet(): CreateExerciseAndAddToDayFormValues["sets"][number] {
    return {
        mode: "reps",
        setType: "working",
        repsMin: "",
        repsMax: "",
        durationSeconds: "",
        weightKg: "",
        intensityType: "",
        intensityValue: "",
    };
}

export function getDefaultFormValues(defaultPosition: number): CreateExerciseAndAddToDayFormValues {
    return {
        name: "",
        category: "strength",
        primaryMuscle: "chest",
        secondaryMuscles: [],
        equipment: ["none"],
        demoVideoUrl: "",
        demoGifUrl: "",
        thumbnailUrl: "",
        instructionSteps: [{ value: "" }],
        position: String(defaultPosition),
        supersetGroup: "",
        restSeconds: "90",
        tempo0: "3",
        tempo1: "1",
        tempo2: "1",
        tempo3: "0",
        coachNotes: "",
        sets: [makeDefaultSet()],
    };
}
