/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api";
import { replacePlannedExerciseSets, updatePlannedExercise } from "@/services/plans";
// import type { PlannedExercise } from "@/types/plans";
import { Plus, X } from "lucide-react";
import { z } from "zod";
import { TempoTooltip } from "./TempoTooltip";

const SET_TYPES = ["warmup", "working", "drop_set", "amrap", "to_failure"] as const;
const INTENSITY_TYPES = ["rpe", "rir", "percent_1rm"] as const;

const INTENSITY_RANGES: Record<(typeof INTENSITY_TYPES)[number], { min: number; max: number }> = {
    rpe: { min: 1, max: 10 },
    rir: { min: 0, max: 10 },
    percent_1rm: { min: 1, max: 100 },
};

function hasAtMostDecimals(value: number, maxDecimals: number) {
    if (!value) return true;
    const decimalPart = value.toString().split(".")[1];
    return !decimalPart || decimalPart.length <= maxDecimals;
}

function makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseRequiredNumber(value: string) {
    const trimmed = value.trim();
    return trimmed === "" ? Number.NaN : Number(trimmed);
}

function parseOptionalNumber(value: string) {
    const trimmed = value.trim();
    return trimmed === "" ? null : Number(trimmed);
}

const setSchema = z
    .object({
        setType: z.enum(SET_TYPES),
        repsMin: z.number().int().min(1).max(1000).nullable(),
        repsMax: z.number().int().min(1).max(1000).nullable(),
        durationSeconds: z.number().int().min(1).max(21600).nullable(),
        weightKg: z.number().min(0).max(1000).nullable(),
        intensityType: z.enum(INTENSITY_TYPES).nullable(),
        intensityValue: z.number().nullable(),
    })
    .superRefine((set, ctx) => {
        const hasReps = set.repsMin !== null || set.repsMax !== null;
        const hasDuration = set.durationSeconds !== null;
        const targetIsOptional =
            set.setType === "amrap" || set.setType === "to_failure" || set.setType === "drop_set";

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

        if (set.repsMin !== null && set.repsMax !== null && set.repsMax < set.repsMin) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Reps max cannot be lower than reps min",
                path: ["repsMax"],
            });
        }

        if ((set.intensityType === null) !== (set.intensityValue === null)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Intensity type and value must be set together",
                path: ["intensityValue"],
            });
        }

        if (set.intensityType !== null && set.intensityValue !== null) {
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

        if (set.intensityValue !== null && !hasAtMostDecimals(set.intensityValue, 2)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Intensity value can have at most two decimal places",
                path: ["intensityValue"],
            });
        }
    });

const updateExerciseSchema = z.object({
    position: z.number().int().min(1).max(30),
    supersetGroup: z.number().int().min(1).max(30).nullable(),
    restSeconds: z.number().int().min(0).max(3600),
    tempo: z.string().regex(/^([0-9Xx]-){3}[0-9Xx]$/, "Tempo must use four digit-or-X phases such as 3-1-X-0"),
    coachNotes: z.string().trim().max(5000).nullable(),
    sets: z.array(setSchema).min(1, "Add at least one set").max(20, "You can add up to 20 sets"),
});

type EditableSet = {
    id: string;
    mode: "reps" | "duration";
    setType: (typeof SET_TYPES)[number];
    repsMin: string;
    repsMax: string;
    durationSeconds: string;
    weightKg: string;
    intensityType: (typeof INTENSITY_TYPES)[number] | "";
    intensityValue: string;
};

type Props = {
    open: boolean;
    programId: string | null;
    exercise: any; // Using `any` on the prop momentarily to bypass strict property dropping
    onClose: () => void;
    onUpdated: (exercise: any) => void;
};

const fieldCls =
    "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand disabled:cursor-not-allowed disabled:bg-muted/50";

const setTypeOptions = [
    { value: "warmup", label: "warmup" },
    { value: "working", label: "working" },
    { value: "drop_set", label: "drop_set" },
    { value: "amrap", label: "amrap" },
    { value: "to_failure", label: "to_failure" },
] as const;

const intensityTypeOptions = [
    { value: "", label: "None" },
    { value: "rpe", label: "rpe" },
    { value: "rir", label: "rir" },
    { value: "percent_1rm", label: "percent_1rm" },
] as const;

function buildInitialSets(exercise: any): EditableSet[] {
    const hasDuration = exercise.durationSeconds !== null && exercise.durationSeconds !== undefined && exercise.durationSeconds !== "";


    if (!exercise?.sets?.length) {
        return [
            {
                id: makeId(),
                mode: hasDuration ? "duration" : "reps",
                setType: "working",
                repsMin: "",
                repsMax: "",
                durationSeconds: "",
                weightKg: "",
                intensityType: "",
                intensityValue: "",
            },
        ];
    }

    return exercise.sets.map((set: any) => {
        // Bulletproof check for both camelCase and snake_case variations
        const duration = set.durationSeconds ?? set.duration_seconds;
        const weight = set.weightKg ?? set.weight_kg;
        const repsMin = set.repsMin ?? set.reps_min;
        const repsMax = set.repsMax ?? set.reps_max;
        const intensityVal = set.intensityValue ?? set.intensity_value;
        const intensityTyp = set.intensityType ?? set.intensity_type;
        const setType = set.setType ?? set.set_type ?? "working";

        // Explicitly set mode to duration if duration value exists
        const hasDuration = duration !== null && duration !== undefined && duration !== "";

        return {
            id: set.id || makeId(),
            mode: hasDuration ? "duration" : "reps",
            setType,
            repsMin: repsMin != null ? String(repsMin) : "",
            repsMax: repsMax != null ? String(repsMax) : "",
            durationSeconds: duration != null ? String(duration) : "",
            weightKg: weight != null ? String(weight) : "",
            intensityType: intensityTyp ?? "",
            intensityValue: intensityVal != null ? String(intensityVal) : "",
        };
    });
}

function EditPlannedExerciseModalContent({
    programId,
    exercise,
    onClose,
    onUpdated,
}: Omit<Props, "open">) {
    const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
    const [position, setPosition] = useState(exercise?.position != null ? String(exercise.position) : "1");
    const [supersetGroup, setSupersetGroup] = useState(
        exercise?.supersetGroup != null ? String(exercise.supersetGroup) : "",
    );
    const [restSeconds, setRestSeconds] = useState(
        exercise?.restSeconds != null ? String(exercise.restSeconds) : "90",
    );
    const [tempoParts, setTempoParts] = useState(() => {
        if (exercise?.tempo && /^([0-9Xx]-){3}[0-9Xx]$/i.test(exercise.tempo)) {
            return exercise.tempo.split("-");
        }
        return ["0", "0", "0", "0"];
    });
    const [coachNotes, setCoachNotes] = useState(exercise?.coachNotes ?? "");
    const [sets, setSets] = useState<EditableSet[]>(() => buildInitialSets(exercise));

    useEffect(() => {
        if (exercise) {
            setPosition(exercise.position != null ? String(exercise.position) : "1");
            setSupersetGroup(exercise.supersetGroup != null ? String(exercise.supersetGroup) : "");
            setRestSeconds(exercise.restSeconds != null ? String(exercise.restSeconds) : "90");

            if (exercise.tempo && /^([0-9Xx]-){3}[0-9Xx]$/i.test(exercise.tempo)) {
                setTempoParts(exercise.tempo.split("-"));
            } else {
                setTempoParts(["0", "0", "0", "0"]);
            }

            setCoachNotes(exercise.coachNotes ?? "");
            setSets(buildInitialSets(exercise));
        }
    }, [exercise]);

    const tempo = useMemo(() => tempoParts.join("-"), [tempoParts]);

    const handleTempoChange = (index: number, value: string) => {
        // Strip out anything that isn't a number or x/X, take the first char, and capitalize it
        const next = value.replace(/[^0-9xX]/g, "").slice(0, 1).toUpperCase();
        setTempoParts((prev: any[]) => prev.map((part, currentIndex) => (currentIndex === index ? next : part)));
    };

    const updateSet = <K extends keyof EditableSet>(id: string, key: K, value: EditableSet[K]) => {
        setSets((prev) =>
            prev.map((set) => {
                if (set.id !== id) return set;
                const nextSet = { ...set, [key]: value };
                if (key === "intensityType" && value === "") {
                    nextSet.intensityValue = "";
                }
                return nextSet;
            }),
        );
    };

    const addSet = () =>
        setSets((prev) => [
            ...prev,
            {
                id: makeId(),
                mode: "reps",
                setType: "working",
                repsMin: "",
                repsMax: "",
                durationSeconds: "",
                weightKg: "",
                intensityType: "",
                intensityValue: "",
            },
        ]);

    const removeSet = (id: string) => setSets((prev) => (prev.length > 1 ? prev.filter((set) => set.id !== id) : prev));

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!programId || !exercise) {
            return;
        }

        const payload = {
            position: parseRequiredNumber(position),
            supersetGroup: parseOptionalNumber(supersetGroup),
            restSeconds: parseRequiredNumber(restSeconds),
            tempo,
            coachNotes: coachNotes.trim() || null,
            sets: sets.map((set) => ({
                setType: set.setType,
                repsMin: set.mode === "reps" ? parseOptionalNumber(set.repsMin) : null,
                repsMax: set.mode === "reps" ? parseOptionalNumber(set.repsMax) : null,
                durationSeconds: set.mode === "duration" ? parseOptionalNumber(set.durationSeconds) : null,
                weightKg: parseOptionalNumber(set.weightKg),
                intensityType: set.intensityType === "" ? null : set.intensityType,
                intensityValue: parseOptionalNumber(set.intensityValue),
            })),
        };

        const parsed = updateExerciseSchema.safeParse(payload);
        if (!parsed.success) {
            toast.error(parsed.error.issues[0]?.message ?? "Please check the form.");
            return;
        }

        setIsSubmittingLocal(true);

        try {
            // Replace these API functions with your exact ones
            const updatedExercise = await updatePlannedExercise(programId, exercise.id, {
                position: parsed.data.position,
                supersetGroup: parsed.data.supersetGroup,
                restSeconds: parsed.data.restSeconds,
                tempo: parsed.data.tempo,
                coachNotes: parsed.data.coachNotes,
            });

            const updatedSets = await replacePlannedExerciseSets(programId, exercise.id, {
                sets: parsed.data.sets,
            });

            onUpdated({
                ...updatedExercise,
                sets: updatedSets,
            });
            toast.success("Exercise updated.");
            onClose();
        } catch (error) {
            toast.error(getApiErrorMessage(error, "We could not update this exercise."));
        } finally {
            setIsSubmittingLocal(false);
        }
    };
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <form
                className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl"
                onClick={(event) => event.stopPropagation()}
                onSubmit={onSubmit}
            >
                <div className="flex items-start justify-between gap-4 border-b border-border p-6 pb-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Edit exercise
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-foreground">
                            {exercise?.exerciseName ?? "Exercise"}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-border p-2 transition hover:bg-muted"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Position *</span>
                            <input
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                type="number"
                                min={1}
                                max={30}
                                className={fieldCls}
                            />
                            <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 1 to 30.</p>
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Rest seconds *</span>
                            <input
                                value={restSeconds}
                                onChange={(e) => setRestSeconds(e.target.value)}
                                type="number"
                                min={0}
                                max={3600}
                                className={fieldCls}
                            />
                            <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 0 to 3600 seconds.</p>
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Superset group</span>
                            <input
                                value={supersetGroup}
                                onChange={(e) => setSupersetGroup(e.target.value)}
                                type="number"
                                min={1}
                                max={30}
                                className={fieldCls}
                            />
                            <p className="mt-1 text-[11px] text-muted-foreground">Optional. Allowed range: 1 to 30.</p>
                        </label>

                        <div className="block">
                            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                Tempo * <TempoTooltip />
                            </span>
                            <div className="grid grid-cols-4 gap-2">
                                {tempoParts.map((part: string | number | readonly string[] | undefined, index: number) => (
                                    <input
                                        key={`tempo-${index}`}
                                        value={part}
                                        onChange={(e) => handleTempoChange(index, e.target.value)}
                                        className={`${fieldCls} text-center font-medium`}
                                    />
                                ))}
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground">Format: 4 digits or X (e.g. 3-1-X-0).</p>
                        </div>

                        <label className="block sm:col-span-2">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Coach notes</span>
                            <textarea
                                value={coachNotes}
                                onChange={(e) => setCoachNotes(e.target.value)}
                                rows={3}
                                maxLength={5000}
                                className={`${fieldCls} min-h-24 resize-y`}
                            />
                            <p className="mt-1 text-[11px] text-muted-foreground">Maximum 5000 characters.</p>
                        </label>
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">SETS</h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">Every set field is required.</p>
                        </div>
                        <button
                            type="button"
                            onClick={addSet}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
                        >
                            <Plus className="size-3.5" />
                            Add set
                        </button>
                    </div>

                    <div className="mt-4 space-y-4">
                        {sets.map((set, index) => {
                            const intensityRange = set.intensityType ? INTENSITY_RANGES[set.intensityType] : null;

                            return (
                                <div key={set.id} className="rounded-3xl border border-border bg-card/50 p-5">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-foreground">Set {index + 1}</p>
                                        </div>
                                        {sets.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSet(set.id)}
                                                className="rounded-xl px-2 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Set type *
                                            </span>
                                            <select
                                                value={set.setType}
                                                onChange={(e) =>
                                                    updateSet(set.id, "setType", e.target.value as (typeof SET_TYPES)[number])
                                                }
                                                className={fieldCls}
                                            >
                                                {setTypeOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <div>
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Prescribed by *
                                            </span>
                                            <div className="inline-flex rounded-full border border-border bg-muted/30 p-1">
                                                <button
                                                    type="button"
                                                    onClick={() => updateSet(set.id, "mode", "reps")}
                                                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${set.mode === "reps"
                                                        ? "bg-brand text-brand-foreground shadow-sm"
                                                        : "text-muted-foreground hover:text-foreground"
                                                        }`}
                                                >
                                                    Reps
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateSet(set.id, "mode", "duration")}
                                                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${set.mode === "duration"
                                                        ? "bg-brand text-brand-foreground shadow-sm"
                                                        : "text-muted-foreground hover:text-foreground"
                                                        }`}
                                                >
                                                    Duration
                                                </button>
                                            </div>
                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                Working and warmup sets need either reps or a duration.
                                            </p>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {set.mode === "reps" ? (
                                                <>
                                                    <label className="block">
                                                        <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                            Reps min *
                                                        </span>
                                                        <input
                                                            value={set.repsMin}
                                                            onChange={(e) => updateSet(set.id, "repsMin", e.target.value)}
                                                            type="number"
                                                            min={1}
                                                            max={1000}
                                                            className={fieldCls}
                                                        />
                                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                                            Allowed range: 1 to 1000.
                                                        </p>
                                                    </label>

                                                    <label className="block">
                                                        <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                            Reps max *
                                                        </span>
                                                        <input
                                                            value={set.repsMax}
                                                            onChange={(e) => updateSet(set.id, "repsMax", e.target.value)}
                                                            type="number"
                                                            min={1}
                                                            max={1000}
                                                            className={fieldCls}
                                                        />
                                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                                            Allowed range: 1 to 1000.
                                                        </p>
                                                    </label>
                                                </>
                                            ) : (
                                                <label className="block">
                                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                        Duration seconds *
                                                    </span>
                                                    <input
                                                        value={set.durationSeconds}
                                                        onChange={(e) => updateSet(set.id, "durationSeconds", e.target.value)}
                                                        type="number"
                                                        min={1}
                                                        max={21600}
                                                        className={fieldCls}
                                                    />
                                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                                        Allowed range: 1 to 21600.
                                                    </p>
                                                </label>
                                            )}

                                            <label className="block">
                                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                    Weight kg
                                                </span>
                                                <input
                                                    value={set.weightKg}
                                                    onChange={(e) => updateSet(set.id, "weightKg", e.target.value)}
                                                    type="number"
                                                    min={0}
                                                    max={1000}
                                                    step="0.01"
                                                    className={fieldCls}
                                                />
                                                <p className="mt-1 text-[11px] text-muted-foreground">
                                                    Allowed range: 0 to 1000.
                                                </p>
                                            </label>

                                            <label className="block">
                                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                    Intensity type
                                                </span>
                                                <select
                                                    value={set.intensityType}
                                                    onChange={(e) =>
                                                        updateSet(
                                                            set.id,
                                                            "intensityType",
                                                            e.target.value as (typeof INTENSITY_TYPES)[number] | "",
                                                        )
                                                    }
                                                    className={fieldCls}
                                                >
                                                    {intensityTypeOptions.map((option) => (
                                                        <option key={option.value || "none"} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="mt-1 text-[11px] text-muted-foreground">
                                                    Optional. Allowed: rpe, rir, percent_1rm.
                                                </p>
                                            </label>

                                            <label className="block">
                                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                    Intensity value
                                                </span>
                                                <input
                                                    value={set.intensityValue}
                                                    disabled={!set.intensityType}
                                                    onChange={(e) => updateSet(set.id, "intensityValue", e.target.value)}
                                                    type="number"
                                                    min={intensityRange?.min ?? 0}
                                                    max={intensityRange?.max ?? 100}
                                                    step="0.01"
                                                    className={fieldCls}
                                                />
                                                <p className="mt-1 text-[11px] text-muted-foreground">
                                                    {intensityRange
                                                        ? `Allowed range: ${intensityRange.min} to ${intensityRange.max}.`
                                                        : "Pick an intensity type to enter a value."}
                                                </p>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border p-6 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmittingLocal}
                        className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmittingLocal ? "Saving…" : "Save exercise"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function EditPlannedExerciseModal(props: Props) {
    if (!props.open || typeof document === "undefined") {
        return null;
    }

    return createPortal(<EditPlannedExerciseModalContent {...props} />, document.body);
}