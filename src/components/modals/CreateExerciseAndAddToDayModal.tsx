/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { z } from "zod";
import { getApiErrorMessage } from "@/lib/api";
import { createExerciseInLibraryAndAddToDay } from "@/services/plans";
import type { PlannedExercise } from "@/types/plans";

const CATEGORY_VALUES = ["strength", "cardio", "mobility", "plyometric", "core"] as const;
const MUSCLE_VALUES = [
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
] as const;
const EQUIPMENT_VALUES = [
    "none",
    "dumbbells",
    "barbell",
    "kettlebell",
    "resistance_bands",
    "machines",
    "full_gym",
] as const;
const SET_TYPES = ["warmup", "working", "drop_set", "amrap", "to_failure"] as const;
const INTENSITY_TYPES = ["rpe", "rir", "percent_1rm"] as const;

// Confirm rir's real bounds with your backend/API docs — 0–10 is a common
// convention but I don't have your validator's source to verify it.
const INTENSITY_RANGES: Record<(typeof INTENSITY_TYPES)[number], { min: number; max: number }> = {
    rpe: { min: 1, max: 10 },
    rir: { min: 0, max: 10 },
    percent_1rm: { min: 1, max: 100 },
};

function hasAtMostDecimals(value: number, maxDecimals: number) {
    const decimalPart = value.toString().split(".")[1];
    return !decimalPart || decimalPart.length <= maxDecimals;
}

const createExerciseSchema = z.object({
    exercise: z.object({
        name: z.string().trim().min(1, "Exercise name is required").max(150, "Exercise name is too long"),
        category: z.enum(CATEGORY_VALUES),
        primaryMuscle: z.enum(MUSCLE_VALUES),
        secondaryMuscles: z.array(z.enum(MUSCLE_VALUES)).max(12).refine((values) => new Set(values).size === values.length, {
            message: "Secondary muscles cannot contain duplicates",
        }),
        equipment: z.array(z.enum(EQUIPMENT_VALUES)).max(7).refine((values) => new Set(values).size === values.length, {
            message: "Equipment cannot contain duplicates",
        }),
        demoVideoUrl: z.union([z.string().trim().url("Enter a valid URL"), z.literal("")]).optional(),
        demoGifUrl: z.union([z.string().trim().url("Enter a valid URL"), z.literal("")]).optional(),
        thumbnailUrl: z.union([z.string().trim().url("Enter a valid URL"), z.literal("")]).optional(),
        instructionSteps: z
            .array(z.string().trim().min(1, "Instruction steps cannot be empty").max(500, "Instruction step is too long"))
            .min(1, "Add at least one instruction step")
            .max(10, "You can add up to 10 instruction steps"),
    }),
    prescription: z.object({
        position: z.number().int().min(1).max(30),
        supersetGroup: z.number().int().min(1).max(30).nullable(),
        restSeconds: z.number().int().min(0).max(3600),
        tempo: z.string().regex(/^([0-9Xx]-){3}[0-9Xx]$/, "Tempo must use four digit-or-X phases such as 3-1-X-0"),
        coachNotes: z.string().trim().max(5000).nullable(),
        sets: z
            .array(
                z
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
                    }),
            )
            .min(1, "Add at least one set")
            .max(20, "You can add up to 20 sets"),
    }),
});

type FormState = z.input<typeof createExerciseSchema>;

type Props = {
    open: boolean;
    programId: string | null;
    programDayId: string | null;
    dayLabel: string;
    defaultPosition: number;
    onClose: () => void;
    onAdded: (plannedExercise: PlannedExercise) => void;
};

const fieldCls =
    "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

function makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function humanizeValue(value: string) {
    return value.replaceAll("_", " ");
}

function parseRequiredNumber(value: string) {
    const trimmed = value.trim();
    return trimmed === "" ? Number.NaN : Number(trimmed);
}

function parseOptionalNumber(value: string) {
    const trimmed = value.trim();
    return trimmed === "" ? null : Number(trimmed);
}

function CreateExerciseAndAddToDayModalContent({
    programId,
    programDayId,
    dayLabel,
    defaultPosition,
    onClose,
    onAdded,
}: Omit<Props, "open">) {
    const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
    const [name, setName] = useState("");
    const [category, setCategory] = useState<(typeof CATEGORY_VALUES)[number]>("strength");
    const [primaryMuscle, setPrimaryMuscle] = useState<(typeof MUSCLE_VALUES)[number]>("chest");
    const [secondaryMuscles, setSecondaryMuscles] = useState<(typeof MUSCLE_VALUES)[number][]>([]);
    const [equipment, setEquipment] = useState<(typeof EQUIPMENT_VALUES)[number][]>(["none"]);
    const [demoVideoUrl, setDemoVideoUrl] = useState("");
    const [demoGifUrl, setDemoGifUrl] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [instructionSteps, setInstructionSteps] = useState<Array<{ id: string; value: string }>>([
        { id: makeId(), value: "" },
    ]);
    const [position, setPosition] = useState(String(defaultPosition));
    const [supersetGroup, setSupersetGroup] = useState("");
    const [restSeconds, setRestSeconds] = useState("90");
    const [tempoParts, setTempoParts] = useState(["3", "1", "1", "0"]);
    const [coachNotes, setCoachNotes] = useState("");
    const [sets, setSets] = useState<
        Array<{
            id: string;
            mode: "reps" | "duration" | "none";
            setType: (typeof SET_TYPES)[number];
            repsMin: string;
            repsMax: string;
            durationSeconds: string;
            weightKg: string;
            intensityType: (typeof INTENSITY_TYPES)[number] | "";
            intensityValue: string;

        }>
    >([
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

    useEffect(() => {
        setPosition(String(defaultPosition));
    }, [defaultPosition]);

    const tempo = useMemo(() => tempoParts.join("-"), [tempoParts]);

    const handleClose = () => {
        if (!isSubmittingLocal) {
            onClose();
        }
    };

    const toggleMuscle = (value: (typeof MUSCLE_VALUES)[number]) => {
        setSecondaryMuscles((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
    };

    const toggleEquipment = (value: (typeof EQUIPMENT_VALUES)[number]) => {
        setEquipment((prev) => {
            if (value === "none") {
                return prev.includes("none") ? [] : ["none"];
            }

            const next = prev.filter((item) => item !== "none");
            return next.includes(value) ? next.filter((item) => item !== value) : [...next, value];
        });
    };

    const updateStep = (id: string, value: string) => {
        setInstructionSteps((prev) => prev.map((step) => (step.id === id ? { ...step, value } : step)));
    };

    const addStep = () => setInstructionSteps((prev) => [...prev, { id: makeId(), value: "" }]);
    const removeStep = (id: string) => setInstructionSteps((prev) => (prev.length > 1 ? prev.filter((step) => step.id !== id) : prev));

    const updateSet = <K extends keyof (typeof sets)[number]>(id: string, key: K, value: (typeof sets)[number][K]) => {
        setSets((prev) => prev.map((set) => (set.id === id ? { ...set, [key]: value } : set)));
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

    const handleTempoChange = (index: number, value: string) => {
        const next = value.replace(/[^0-9xX]/g, "").slice(0, 1).toUpperCase();
        setTempoParts((prev) => prev.map((part, currentIndex) => (currentIndex === index ? next : part)));
    };

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!programId || !programDayId) {
            return;
        }

        const payload: FormState = {
            exercise: {
                name: name.trim(),
                category,
                primaryMuscle,
                secondaryMuscles,
                equipment,
                demoVideoUrl: demoVideoUrl.trim(),
                demoGifUrl: demoGifUrl.trim(),
                thumbnailUrl: thumbnailUrl.trim(),
                instructionSteps: instructionSteps.map((step) => step.value),
            },
            prescription: {
                position: parseRequiredNumber(position),
                supersetGroup: parseOptionalNumber(supersetGroup),
                restSeconds: parseRequiredNumber(restSeconds),
                tempo,
                coachNotes: coachNotes.trim(),
                sets: sets.map((set) => ({
                    setType: set.setType,
                    repsMin: set.mode === "reps" ? parseOptionalNumber(set.repsMin) : null,
                    repsMax: set.mode === "reps" ? parseOptionalNumber(set.repsMax) : null,
                    durationSeconds: set.mode === "duration" ? parseOptionalNumber(set.durationSeconds) : null,
                    weightKg: parseOptionalNumber(set.weightKg),
                    intensityType: set.intensityType === "" ? null : set.intensityType,
                    intensityValue: parseOptionalNumber(set.intensityValue),
                })),
                // sets: sets.map((set) => ({
                //     setType: set.setType,
                //     repsMin: parseRequiredNumber(set.repsMin),
                //     repsMax: parseRequiredNumber(set.repsMax),
                //     durationSeconds: parseRequiredNumber(set.durationSeconds),
                //     weightKg: parseRequiredNumber(set.weightKg),
                //     intensityType: set.intensityType,
                //     intensityValue: parseRequiredNumber(set.intensityValue),
                // })),
            },
        };

        const parsed = createExerciseSchema.safeParse(payload);
        if (!parsed.success) {
            toast.error(parsed.error.issues[0]?.message ?? "Please check the form.");
            return;
        }

        setIsSubmittingLocal(true);

        try {
            const result = await createExerciseInLibraryAndAddToDay(programId, programDayId, {
                exercise: {
                    name: parsed.data.exercise.name,
                    category: parsed.data.exercise.category,
                    primaryMuscle: parsed.data.exercise.primaryMuscle,
                    secondaryMuscles: parsed.data.exercise.secondaryMuscles,
                    equipment: parsed.data.exercise.equipment,
                    demoVideoUrl: parsed.data.exercise.demoVideoUrl || null,
                    demoGifUrl: parsed.data.exercise.demoGifUrl || null,
                    thumbnailUrl: parsed.data.exercise.thumbnailUrl || null,
                    instructionSteps: parsed.data.exercise.instructionSteps,
                },
                prescription: {
                    position: parsed.data.prescription.position,
                    supersetGroup: parsed.data.prescription.supersetGroup,
                    restSeconds: parsed.data.prescription.restSeconds,
                    tempo: parsed.data.prescription.tempo,
                    coachNotes: parsed.data.prescription.coachNotes || null,
                    sets: parsed.data.prescription.sets,
                },
            });

            toast.success("Exercise created and added to the day.");
            onAdded(result.plannedExercise);
            onClose();
        } catch (error) {
            toast.error(
                getApiErrorMessage(error, "We could not create this exercise and add it to the day."),
            );
        } finally {
            setIsSubmittingLocal(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onClick={handleClose}
        >
            <form
                className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl"
                onClick={(event) => event.stopPropagation()}
                onSubmit={onSubmit}
            >
                <div className="flex items-start justify-between gap-4 border-b border-border p-6 pb-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Create exercise in library
                        </p>
                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                            Add to {dayLabel}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-xl border border-border p-2 transition hover:bg-muted"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto p-6">
                    <section className="rounded-3xl border border-border bg-card p-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Exercise
                        </h3>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <label className="block sm:col-span-2">
                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Name *</span>
                                <input
                                    id="create-exercise-name"
                                    name="create-exercise-name"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    className={fieldCls}
                                />
                                <p className="mt-1 text-[11px] text-muted-foreground">Max 150 characters.</p>
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                    Category *
                                </span>
                                <select
                                    id="create-exercise-category"
                                    name="create-exercise-category"
                                    value={category}
                                    onChange={(event) => setCategory(event.target.value as (typeof CATEGORY_VALUES)[number])}
                                    className={fieldCls}
                                >
                                    {CATEGORY_VALUES.map((value) => (
                                        <option key={value} value={value}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Allowed: strength, cardio, mobility, plyometric, core.
                                </p>
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                    Primary muscle *
                                </span>
                                <select
                                    id="create-exercise-primary-muscle"
                                    name="create-exercise-primary-muscle"
                                    value={primaryMuscle}
                                    onChange={(event) => setPrimaryMuscle(event.target.value as (typeof MUSCLE_VALUES)[number])}
                                    className={fieldCls}
                                >
                                    {MUSCLE_VALUES.map((value) => (
                                        <option key={value} value={value}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Allowed muscle values are the same as the library schema.
                                </p>
                            </label>

                            <fieldset className="sm:col-span-2">
                                <legend className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                    Secondary muscles
                                </legend>
                                <div className="rounded-2xl border border-border bg-background p-3">
                                    <div className="flex flex-wrap gap-2">
                                        {MUSCLE_VALUES.map((value) => {
                                            const active = secondaryMuscles.includes(value);

                                            return (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => toggleMuscle(value)}
                                                    aria-pressed={active}
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${active
                                                        ? "border-brand bg-brand/10 text-foreground"
                                                        : "border-border bg-background text-muted-foreground hover:border-brand hover:text-foreground"
                                                        }`}
                                                >
                                                    {active ? <X size={10} /> : <Plus size={10} />}
                                                    {humanizeValue(value)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Optional. Allowed values: chest, back, shoulders, biceps, triceps, forearms, quads, hamstrings, glutes, calves, core, full body.
                                </p>
                            </fieldset>

                            <fieldset className="sm:col-span-2">
                                <legend className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                    Equipment
                                </legend>
                                <div className="rounded-2xl border border-border bg-background p-3">
                                    <div className="flex flex-wrap gap-2">
                                        {EQUIPMENT_VALUES.map((value) => {
                                            const active = equipment.includes(value);

                                            return (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => toggleEquipment(value)}
                                                    aria-pressed={active}
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${active
                                                        ? "border-brand bg-brand/10 text-foreground"
                                                        : "border-border bg-background text-muted-foreground hover:border-brand hover:text-foreground"
                                                        }`}
                                                >
                                                    {active ? <X size={10} /> : <Plus size={10} />}
                                                    {humanizeValue(value)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Allowed equipment: none, dumbbells, barbell, kettlebell, resistance bands, machines, full gym.
                                </p>
                            </fieldset>

                            <fieldset className="sm:col-span-2">
                                <legend className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                    Instruction steps *
                                </legend>
                                <div className="space-y-2">
                                    {instructionSteps.map((step, index) => (
                                        <div key={step.id} className="flex gap-2">
                                            <input
                                                id={`create-exercise-step-${index + 1}`}
                                                name={`create-exercise-step-${index + 1}`}
                                                value={step.value}
                                                onChange={(event) => updateStep(step.id, event.target.value)}
                                                className={fieldCls}
                                                placeholder={`Step ${index + 1}`}
                                            />
                                            {instructionSteps.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeStep(step.id)}
                                                    className="rounded-2xl border border-border px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addStep}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                                    >
                                        <Plus className="size-4" />
                                        Add step
                                    </button>
                                </div>
                            </fieldset>

                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                    Demo video URL
                                </span>
                                <input
                                    id="create-exercise-demo-video-url"
                                    name="create-exercise-demo-video-url"
                                    value={demoVideoUrl}
                                    onChange={(event) => setDemoVideoUrl(event.target.value)}
                                    className={fieldCls}
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                    Demo GIF URL
                                </span>
                                <input
                                    id="create-exercise-demo-gif-url"
                                    name="create-exercise-demo-gif-url"
                                    value={demoGifUrl}
                                    onChange={(event) => setDemoGifUrl(event.target.value)}
                                    className={fieldCls}
                                />
                            </label>

                            <label className="block sm:col-span-2">
                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                    Thumbnail URL
                                </span>
                                <input
                                    id="create-exercise-thumbnail-url"
                                    name="create-exercise-thumbnail-url"
                                    value={thumbnailUrl}
                                    onChange={(event) => setThumbnailUrl(event.target.value)}
                                    className={fieldCls}
                                />
                            </label>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-border bg-card p-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Prescription
                        </h3>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                    Position
                                </span>
                                <input
                                    id="create-exercise-position"
                                    name="create-exercise-position"
                                    value={position}
                                    onChange={(event) => setPosition(event.target.value)}
                                    type="number"
                                    min={1}
                                    max={30}
                                    className={fieldCls}
                                />
                                <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 1 to 30.</p>
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                    Rest seconds
                                </span>
                                <input
                                    id="create-exercise-rest-seconds"
                                    name="create-exercise-rest-seconds"
                                    value={restSeconds}
                                    onChange={(event) => setRestSeconds(event.target.value)}
                                    type="number"
                                    min={0}
                                    max={3600}
                                    className={fieldCls}
                                />
                                <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 0 to 3600.</p>
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                    Superset group
                                </span>
                                <input
                                    id="create-exercise-superset-group"
                                    name="create-exercise-superset-group"
                                    value={supersetGroup}
                                    onChange={(event) => setSupersetGroup(event.target.value)}
                                    type="number"
                                    min={1}
                                    max={30}
                                    className={fieldCls}
                                />
                                <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 1 to 30.</p>
                            </label>

                            <div className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                    Tempo *
                                </span>
                                <div className="grid grid-cols-4 gap-2">
                                    {tempoParts.map((part, index) => (
                                        <input
                                            key={index}
                                            id={`create-exercise-tempo-${index + 1}`}
                                            name={`create-exercise-tempo-${index + 1}`}
                                            value={part}
                                            onChange={(event) => handleTempoChange(index, event.target.value)}
                                            maxLength={1}
                                            className={`${fieldCls} text-center text-lg font-semibold uppercase`}
                                            aria-label={`Tempo phase ${index + 1}`}
                                        />
                                    ))}
                                </div>
                                <p className="mt-1 text-[11px] text-muted-foreground">Use exactly 4 phases, each a digit or X.</p>
                            </div>

                            <label className="block sm:col-span-2">
                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                    Coach notes
                                </span>
                                <textarea
                                    id="create-exercise-coach-notes"
                                    name="create-exercise-coach-notes"
                                    value={coachNotes}
                                    onChange={(event) => setCoachNotes(event.target.value)}
                                    rows={3}
                                    className={`${fieldCls} min-h-24 resize-y`}
                                />
                            </label>
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    Sets
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Every set field is required.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={addSet}
                                className="inline-flex items-center gap-2 rounded-2xl border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                            >
                                <Plus className="size-4" />
                                Add set
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {sets.map((set, index) => (
                                <div key={set.id} className="rounded-3xl border border-border bg-background p-4">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-foreground">Set {index + 1}</p>
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
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        <label className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Set type *
                                            </span>
                                            <select
                                                id={`create-exercise-set-type-${index + 1}`}
                                                name={`create-exercise-set-type-${index + 1}`}
                                                value={set.setType}
                                                onChange={(event) =>
                                                    updateSet(set.id, "setType", event.target.value as (typeof SET_TYPES)[number])
                                                }
                                                className={fieldCls}
                                            >
                                                {SET_TYPES.map((value) => (
                                                    <option key={value} value={value}>
                                                        {value}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        {/* <label className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Reps min *
                                            </span>
                                            <input
                                                id={`create-exercise-reps-min-${index + 1}`}
                                                name={`create-exercise-reps-min-${index + 1}`}
                                                value={set.repsMin}
                                                onChange={(event) => updateSet(set.id, "repsMin", event.target.value)}
                                                type="number"
                                                min={1}
                                                max={1000}
                                                className={fieldCls}
                                            />
                                            <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 1 to 1000.</p>
                                        </label>

                                        <label className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Reps max *
                                            </span>
                                            <input
                                                id={`create-exercise-reps-max-${index + 1}`}
                                                name={`create-exercise-reps-max-${index + 1}`}
                                                value={set.repsMax}
                                                onChange={(event) => updateSet(set.id, "repsMax", event.target.value)}
                                                type="number"
                                                min={1}
                                                max={1000}
                                                className={fieldCls}
                                            />
                                            <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 1 to 1000.</p>
                                        </label>

                                        <label className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Duration seconds *
                                            </span>
                                            <input
                                                id={`create-exercise-duration-seconds-${index + 1}`}
                                                name={`create-exercise-duration-seconds-${index + 1}`}
                                                value={set.durationSeconds}
                                                onChange={(event) => updateSet(set.id, "durationSeconds", event.target.value)}
                                                type="number"
                                                min={1}
                                                max={21600}
                                                className={fieldCls}
                                            />
                                            <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 1 to 21600.</p>
                                        </label> */}

                                        {/* <div className="block sm:col-span-2 lg:col-span-3">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Prescribed by *
                                            </span>
                                            <div className="inline-flex rounded-2xl border border-border bg-background p-1">
                                                <button
                                                    type="button"
                                                    onClick={() => updateSet(set.id, "mode", "reps")}
                                                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${set.mode === "reps"
                                                        ? "bg-brand text-brand-foreground"
                                                        : "text-muted-foreground hover:text-foreground"
                                                        }`}
                                                >
                                                    Reps
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateSet(set.id, "mode", "duration")}
                                                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${set.mode === "duration"
                                                        ? "bg-brand text-brand-foreground"
                                                        : "text-muted-foreground hover:text-foreground"
                                                        }`}
                                                >
                                                    Duration
                                                </button>
                                            </div>
                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                A set is prescribed by reps or duration, never both.
                                            </p>
                                        </div> */}
                                        <div className="block sm:col-span-2 lg:col-span-3">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Prescribed by {set.setType === "working" || set.setType === "warmup" ? "*" : ""}
                                            </span>
                                            <div className="inline-flex rounded-2xl border border-border bg-background p-1">
                                                <button
                                                    type="button"
                                                    onClick={() => updateSet(set.id, "mode", "reps")}
                                                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${set.mode === "reps"
                                                        ? "bg-brand text-brand-foreground"
                                                        : "text-muted-foreground hover:text-foreground"
                                                        }`}
                                                >
                                                    Reps
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateSet(set.id, "mode", "duration")}
                                                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${set.mode === "duration"
                                                        ? "bg-brand text-brand-foreground"
                                                        : "text-muted-foreground hover:text-foreground"
                                                        }`}
                                                >
                                                    Duration
                                                </button>
                                                {(set.setType === "amrap" ||
                                                    set.setType === "to_failure" ||
                                                    set.setType === "drop_set") && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateSet(set.id, "mode", "none")}
                                                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${set.mode === "none"
                                                                ? "bg-brand text-brand-foreground"
                                                                : "text-muted-foreground hover:text-foreground"
                                                                }`}
                                                        >
                                                            None
                                                        </button>
                                                    )}
                                            </div>
                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                {set.setType === "amrap" ||
                                                    set.setType === "to_failure" ||
                                                    set.setType === "drop_set"
                                                    ? "Optional for this set type — you may still add reps or duration if you want a specific target."
                                                    : "Working and warmup sets need either reps or a duration."}
                                            </p>
                                        </div>

                                        {set.mode === "reps" ? (
                                            <>
                                                <label className="block">
                                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                        Reps min *
                                                    </span>
                                                    <input
                                                        id={`create-exercise-reps-min-${index + 1}`}
                                                        name={`create-exercise-reps-min-${index + 1}`}
                                                        value={set.repsMin}
                                                        onChange={(event) => updateSet(set.id, "repsMin", event.target.value)}
                                                        type="number"
                                                        min={1}
                                                        max={1000}
                                                        className={fieldCls}
                                                    />
                                                    <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 1 to 1000.</p>
                                                </label>

                                                <label className="block">
                                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                        Reps max *
                                                    </span>
                                                    <input
                                                        id={`create-exercise-reps-max-${index + 1}`}
                                                        name={`create-exercise-reps-max-${index + 1}`}
                                                        value={set.repsMax}
                                                        onChange={(event) => updateSet(set.id, "repsMax", event.target.value)}
                                                        type="number"
                                                        min={1}
                                                        max={1000}
                                                        className={fieldCls}
                                                    />
                                                    <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 1 to 1000.</p>
                                                </label>
                                            </>
                                        ) : (
                                            <label className="block">
                                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                    Duration seconds *
                                                </span>
                                                <input
                                                    id={`create-exercise-duration-seconds-${index + 1}`}
                                                    name={`create-exercise-duration-seconds-${index + 1}`}
                                                    value={set.durationSeconds}
                                                    onChange={(event) => updateSet(set.id, "durationSeconds", event.target.value)}
                                                    type="number"
                                                    min={1}
                                                    max={21600}
                                                    className={fieldCls}
                                                />
                                                <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 1 to 21600.</p>
                                            </label>
                                        )}


                                        <label className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Weight kg
                                            </span>
                                            <input
                                                id={`create-exercise-weight-kg-${index + 1}`}
                                                name={`create-exercise-weight-kg-${index + 1}`}
                                                value={set.weightKg}
                                                onChange={(event) => updateSet(set.id, "weightKg", event.target.value)}
                                                type="number"
                                                min={0}
                                                max={1000}
                                                step="0.5"
                                                className={fieldCls}
                                            />
                                            <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 0 to 1000.</p>
                                        </label>

                                        {/* <label className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Intensity type *
                                            </span>
                                            <select
                                                id={`create-exercise-intensity-type-${index + 1}`}
                                                name={`create-exercise-intensity-type-${index + 1}`}
                                                value={set.intensityType}
                                                onChange={(event) =>
                                                    updateSet(set.id, "intensityType", event.target.value as (typeof INTENSITY_TYPES)[number])
                                                }
                                                className={fieldCls}
                                            >
                                                {INTENSITY_TYPES.map((value) => (
                                                    <option key={value} value={value}>
                                                        {value}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="mt-1 text-[11px] text-muted-foreground">Allowed: rpe, rir, percent_1rm.</p>
                                        </label>

                                        <label className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Intensity value *
                                            </span>
                                            <input
                                                id={`create-exercise-intensity-value-${index + 1}`}
                                                name={`create-exercise-intensity-value-${index + 1}`}
                                                value={set.intensityValue}
                                                onChange={(event) => updateSet(set.id, "intensityValue", event.target.value)}
                                                type="number"
                                                min={0}
                                                max={100}
                                                step="0.5"
                                                className={fieldCls}
                                            />
                                            <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 0 to 100.</p>
                                        </label> */}

                                        <label className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Intensity type
                                            </span>
                                            <select
                                                id={`create-exercise-intensity-type-${index + 1}`}
                                                name={`create-exercise-intensity-type-${index + 1}`}
                                                value={set.intensityType}
                                                onChange={(event) =>
                                                    updateSet(
                                                        set.id,
                                                        "intensityType",
                                                        event.target.value as (typeof INTENSITY_TYPES)[number] | "",
                                                    )
                                                }
                                                className={fieldCls}
                                            >
                                                <option value="">None</option>
                                                {INTENSITY_TYPES.map((value) => (
                                                    <option key={value} value={value}>
                                                        {value}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="mt-1 text-[11px] text-muted-foreground">Optional. Allowed: rpe, rir, percent_1rm.</p>
                                        </label>

                                        <label className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Intensity value{set.intensityType ? " *" : ""}
                                            </span>
                                            <input
                                                id={`create-exercise-intensity-value-${index + 1}`}
                                                name={`create-exercise-intensity-value-${index + 1}`}
                                                value={set.intensityValue}
                                                onChange={(event) => updateSet(set.id, "intensityValue", event.target.value)}
                                                type="number"
                                                min={set.intensityType ? INTENSITY_RANGES[set.intensityType].min : undefined}
                                                max={set.intensityType ? INTENSITY_RANGES[set.intensityType].max : undefined}
                                                step="0.5"
                                                disabled={!set.intensityType}
                                                className={`${fieldCls} disabled:cursor-not-allowed disabled:opacity-50`}
                                            />
                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                {set.intensityType
                                                    ? `Allowed range for ${set.intensityType}: ${INTENSITY_RANGES[set.intensityType].min} to ${INTENSITY_RANGES[set.intensityType].max}.`
                                                    : "Pick an intensity type to enter a value."}
                                            </p>
                                        </label>


                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border p-6 pt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmittingLocal}
                        className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmittingLocal ? "Saving…" : "Create and add"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function CreateExerciseAndAddToDayModal(props: Props) {
    if (!props.open || typeof document === "undefined") {
        return null;
    }

    return createPortal(<CreateExerciseAndAddToDayModalContent {...props} />, document.body);
}
