import { z } from "zod";

// ─── Constants ────────────────────────────────────────────────────────────────

export const SET_TYPES = [
  "warmup",
  "working",
  "drop_set",
  "amrap",
  "to_failure",
] as const;
export const INTENSITY_TYPES = ["rpe", "rir", "percent_1rm"] as const;

export const INTENSITY_RANGES: Record<
  (typeof INTENSITY_TYPES)[number],
  { min: number; max: number }
> = {
  rpe: { min: 1, max: 10 },
  rir: { min: 0, max: 10 },
  percent_1rm: { min: 1, max: 100 },
};

// ─── Option lists ─────────────────────────────────────────────────────────────

export const setTypeOptions = [
  { value: "warmup", label: "warmup" },
  { value: "working", label: "working" },
  { value: "drop_set", label: "drop_set" },
  { value: "amrap", label: "amrap" },
  { value: "to_failure", label: "to_failure" },
] as const;

export const intensityTypeOptions = [
  { value: "", label: "None" },
  { value: "rpe", label: "rpe" },
  { value: "rir", label: "rir" },
  { value: "percent_1rm", label: "percent_1rm" },
] as const;

// ─── Coercion helpers ─────────────────────────────────────────────────────────

export function toNumber(val: unknown): number {
  if (typeof val === "number") return val;
  const trimmed = String(val ?? "").trim();
  return trimmed === "" ? NaN : Number(trimmed);
}

export function toNumberOrNull(val: unknown): number | null {
  if (typeof val === "number") return val;
  const trimmed = String(val ?? "").trim();
  return trimmed === "" ? null : Number(trimmed);
}

function hasAtMostDecimals(value: number, maxDecimals: number) {
  if (!value) return true;
  const decimalPart = value.toString().split(".")[1];
  return !decimalPart || decimalPart.length <= maxDecimals;
}

// ─── Set schema ───────────────────────────────────────────────────────────────

export const setFormSchema = z
  .object({
    mode: z.enum(["reps", "duration"]),
    setType: z.enum(SET_TYPES),
    repsMin: z.preprocess(
      toNumberOrNull,
      z.number().int().min(1).max(1000).nullable(),
    ),
    repsMax: z.preprocess(
      toNumberOrNull,
      z.number().int().min(1).max(1000).nullable(),
    ),
    durationSeconds: z.preprocess(
      toNumberOrNull,
      z.number().int().min(1).max(21600).nullable(),
    ),
    weightKg: z.preprocess(
      toNumberOrNull,
      z.number().min(0).max(1000).nullable(),
    ),
    intensityType: z.union([z.enum(INTENSITY_TYPES), z.literal("")]),
    intensityValue: z.preprocess(toNumberOrNull, z.number().nullable()),
  })
  .superRefine((set, ctx) => {
    const hasReps = set.repsMin !== null || set.repsMax !== null;
    const hasDuration = set.durationSeconds !== null;
    const targetIsOptional =
      set.setType === "amrap" ||
      set.setType === "to_failure" ||
      set.setType === "drop_set";

    if (hasReps && hasDuration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A set must be prescribed by reps or duration, not both",
        path: ["durationSeconds"],
      });
    }
    if (!targetIsOptional && !hasReps && !hasDuration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Working and warmup sets need either reps or a duration",
        path: ["repsMin"],
      });
    }
    if (set.repsMax !== null && set.repsMin === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Reps max requires reps min",
        path: ["repsMax"],
      });
    }
    if (
      set.repsMin !== null &&
      set.repsMax !== null &&
      set.repsMax < set.repsMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Reps max cannot be lower than reps min",
        path: ["repsMax"],
      });
    }
    if ((set.intensityType === "") !== (set.intensityValue === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Intensity type and value must be set together",
        path: ["intensityValue"],
      });
    }
    if (set.intensityType !== "" && set.intensityValue !== null) {
      const range = INTENSITY_RANGES[set.intensityType];
      if (set.intensityValue < range.min || set.intensityValue > range.max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${set.intensityType.toUpperCase()} must be between ${range.min} and ${range.max}`,
          path: ["intensityValue"],
        });
      }
    }
    if (set.weightKg !== null && !hasAtMostDecimals(set.weightKg, 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Weight can have at most two decimal places",
        path: ["weightKg"],
      });
    }
    if (
      set.intensityValue !== null &&
      !hasAtMostDecimals(set.intensityValue, 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Intensity value can have at most two decimal places",
        path: ["intensityValue"],
      });
    }
  });

// ─── Top-level schema ─────────────────────────────────────────────────────────

export const addDayExerciseFormSchema = z.object({
  position: z.preprocess(
    toNumber,
    z
      .number({ message: "Position is required" })
      .int()
      .min(1, "Min 1")
      .max(30, "Max 30"),
  ),
  supersetGroup: z.preprocess(
    toNumberOrNull,
    z.number().int().min(1, "Min 1").max(30, "Max 30").nullable(),
  ),
  restSeconds: z.preprocess(
    toNumber,
    z
      .number({ message: "Rest seconds is required" })
      .int()
      .min(0, "Min 0")
      .max(3600, "Max 3600"),
  ),
  tempo0: z.string().regex(/^[0-9Xx]$/, "Use a digit or X"),
  tempo1: z.string().regex(/^[0-9Xx]$/, "Use a digit or X"),
  tempo2: z.string().regex(/^[0-9Xx]$/, "Use a digit or X"),
  tempo3: z.string().regex(/^[0-9Xx]$/, "Use a digit or X"),
  coachNotes: z.string().trim().max(5000, "Max 5,000 characters"),
  sets: z
    .array(setFormSchema)
    .min(1, "Add at least one set")
    .max(20, "You can add up to 20 sets"),
});

export type AddDayExerciseFormValues = z.input<typeof addDayExerciseFormSchema>;
export type AddDayExerciseSubmitValues = z.output<
  typeof addDayExerciseFormSchema
>;

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function makeDefaultSet(): AddDayExerciseFormValues["sets"][number] {
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

export const defaultAddDayExerciseValues: AddDayExerciseFormValues = {
  position: "1",
  supersetGroup: "",
  restSeconds: "90",
  tempo0: "0",
  tempo1: "0",
  tempo2: "0",
  tempo3: "0",
  coachNotes: "",
  sets: [makeDefaultSet()],
};

// ─── Edit planned exercise schema ─────────────────────────────────────────────
// Same field shape as addDayExerciseFormSchema — reuses setFormSchema directly.

export const editPlannedExerciseFormSchema = z.object({
  position: z.preprocess(
    toNumber,
    z
      .number({ message: "Position is required" })
      .int()
      .min(1, "Min 1")
      .max(30, "Max 30"),
  ),
  supersetGroup: z.preprocess(
    toNumberOrNull,
    z.number().int().min(1, "Min 1").max(30, "Max 30").nullable(),
  ),
  restSeconds: z.preprocess(
    toNumber,
    z
      .number({ message: "Rest seconds is required" })
      .int()
      .min(0, "Min 0")
      .max(3600, "Max 3600"),
  ),
  tempo0: z.string().regex(/^[0-9Xx]$/, "Use a digit or X"),
  tempo1: z.string().regex(/^[0-9Xx]$/, "Use a digit or X"),
  tempo2: z.string().regex(/^[0-9Xx]$/, "Use a digit or X"),
  tempo3: z.string().regex(/^[0-9Xx]$/, "Use a digit or X"),
  coachNotes: z.string().trim().max(5000, "Max 5,000 characters"),
  sets: z
    .array(setFormSchema)
    .min(1, "Add at least one set")
    .max(20, "You can add up to 20 sets"),
});

export type EditPlannedExerciseFormValues = z.input<
  typeof editPlannedExerciseFormSchema
>;
export type EditPlannedExerciseSubmitValues = z.output<
  typeof editPlannedExerciseFormSchema
>;

// ─── Build default values from an existing PlannedExercise ────────────────────

type AnySet = {
  durationSeconds?: number | null;
  duration_seconds?: number | null;
  weightKg?: number | null;
  weight_kg?: number | null;
  repsMin?: number | null;
  reps_min?: number | null;
  repsMax?: number | null;
  reps_max?: number | null;
  intensityValue?: number | null;
  intensity_value?: number | null;
  intensityType?: string | null;
  intensity_type?: string | null;
  setType?: string;
  set_type?: string;
};

function setToFormValues(
  set: AnySet,
): EditPlannedExerciseFormValues["sets"][number] {
  const duration = set.durationSeconds ?? set.duration_seconds ?? null;
  const weight = set.weightKg ?? set.weight_kg ?? null;
  const repsMin = set.repsMin ?? set.reps_min ?? null;
  const repsMax = set.repsMax ?? set.reps_max ?? null;
  const intensityVal = set.intensityValue ?? set.intensity_value ?? null;
  const intensityTyp = set.intensityType ?? set.intensity_type ?? null;
  const setType = (set.setType ??
    set.set_type ??
    "working") as EditPlannedExerciseFormValues["sets"][number]["setType"];

  return {
    mode: duration != null ? "duration" : "reps",
    setType,
    repsMin: repsMin != null ? String(repsMin) : "",
    repsMax: repsMax != null ? String(repsMax) : "",
    durationSeconds: duration != null ? String(duration) : "",
    weightKg: weight != null ? String(weight) : "",
    intensityType: (intensityTyp ??
      "") as EditPlannedExerciseFormValues["sets"][number]["intensityType"],
    intensityValue: intensityVal != null ? String(intensityVal) : "",
  };
}

export function buildEditDefaultValues(exercise: {
  position?: number | null;
  supersetGroup?: number | null;
  restSeconds?: number | null;
  tempo?: string | null;
  coachNotes?: string | null;
  sets?: AnySet[];
}): EditPlannedExerciseFormValues {
  const tempoParts =
    exercise.tempo && /^([0-9Xx]-){3}[0-9Xx]$/i.test(exercise.tempo)
      ? exercise.tempo.split("-")
      : ["0", "0", "0", "0"];

  const sets = exercise.sets?.length
    ? exercise.sets.map(setToFormValues)
    : [makeDefaultSet()];

  return {
    position: exercise.position != null ? String(exercise.position) : "1",
    supersetGroup:
      exercise.supersetGroup != null ? String(exercise.supersetGroup) : "",
    restSeconds:
      exercise.restSeconds != null ? String(exercise.restSeconds) : "90",
    tempo0: tempoParts[0] ?? "0",
    tempo1: tempoParts[1] ?? "0",
    tempo2: tempoParts[2] ?? "0",
    tempo3: tempoParts[3] ?? "0",
    coachNotes: exercise.coachNotes ?? "",
    sets,
  };
}
