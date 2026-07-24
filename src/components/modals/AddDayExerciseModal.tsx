import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, DumbbellIcon, GripVertical, X } from "lucide-react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api";
import { addLibraryExerciseToDay } from "@/services/plans";
import type { Exercise } from "@/types/exercise";
import type { PlannedExercise } from "@/types/plans";

type SetFormValue = {
    setType: string;
    repsMin: string;
    repsMax: string;
    durationSeconds: string;
    weightKg: string;
    intensityType: string;
    intensityValue: string;
};

type AddDayExerciseFormValue = {
    position: string;
    supersetGroup: string;
    restSeconds: string;
    tempo: string;
    coachNotes: string;
    sets: SetFormValue[];
};

type Props = {
    open: boolean;
    programId: string | null;
    programDayId: string | null;
    dayLabel: string;
    exercise: Exercise | null;
    defaultPosition: number;
    onClose: () => void;
    onAdded: (plannedExercise: PlannedExercise) => void;
};

const fieldCls =
    "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

const setTypeOptions = [
    { value: "warmup", label: "Warmup" },
    { value: "working", label: "Working" },
    { value: "drop_set", label: "Drop set" },
    { value: "amrap", label: "AMRAP" },
    { value: "to_failure", label: "To failure" },
];

const intensityTypeOptions = [
    { value: "rpe", label: "RPE" },
    { value: "rir", label: "RIR" },
    { value: "percent_1rm", label: "% 1RM" },
];

function toNullableNumber(value: string) {
    const trimmed = value.trim();

    if (!trimmed) {
        return null;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
}

function buildDefaultValues(defaultPosition: number): AddDayExerciseFormValue {
    return {
        position: String(defaultPosition),
        supersetGroup: "",
        restSeconds: "90",
        tempo: "",
        coachNotes: "",
        sets: [
            {
                setType: "working",
                repsMin: "",
                repsMax: "",
                durationSeconds: "",
                weightKg: "",
                intensityType: "rpe",
                intensityValue: "",
            },
        ],
    };
}

function AddDayExerciseModalContent({
    programId,
    programDayId,
    dayLabel,
    exercise,
    defaultPosition,
    onClose,
    onAdded,
}: Omit<Props, "open">) {
    const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

    const defaults = useMemo(
        () => buildDefaultValues(defaultPosition),
        [defaultPosition],
    );

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AddDayExerciseFormValue>({
        defaultValues: defaults,
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "sets",
    });

    useEffect(() => {
        if (exercise && programDayId) {
            reset(buildDefaultValues(defaultPosition));
        }
    }, [defaultPosition, exercise, programDayId, reset]);

    const handleClose = () => {
        if (!isSubmitting && !isSubmittingLocal) {
            onClose();
        }
    };

    const onSubmit = async (values: AddDayExerciseFormValue) => {
        if (!programId || !programDayId || !exercise) {
            return;
        }

        const position = Number(values.position);
        const restSeconds = Number(values.restSeconds);
        const supersetGroup = toNullableNumber(values.supersetGroup);
        const tempo = values.tempo.trim() || null;
        const coachNotes = values.coachNotes.trim() || null;

        if (!Number.isInteger(position) || position < 1) {
            toast.error("Position must be a positive whole number.");
            return;
        }

        if (!Number.isInteger(restSeconds) || restSeconds < 0) {
            toast.error("Rest seconds must be zero or a positive whole number.");
            return;
        }

        const sets = values.sets
            .map((set) => ({
                setType: set.setType.trim(),
                repsMin: toNullableNumber(set.repsMin),
                repsMax: toNullableNumber(set.repsMax),
                durationSeconds: toNullableNumber(set.durationSeconds),
                weightKg: toNullableNumber(set.weightKg),
                intensityType: set.intensityType.trim() || null,
                intensityValue: toNullableNumber(set.intensityValue),
            }))
            .filter((set) => set.setType.length > 0);

        if (sets.length === 0) {
            toast.error("Add at least one set before saving.");
            return;
        }

        setIsSubmittingLocal(true);

        try {
            const plannedExercise = await addLibraryExerciseToDay(programId, programDayId, {
                exerciseId: exercise.id,
                position,
                supersetGroup,
                restSeconds,
                tempo,
                coachNotes,
                sets: sets.map((set) => ({
                    setType: set.setType as
                        | "working"
                        | "warmup"
                        | "drop_set"
                        | "amrap"
                        | "to_failure",
                    repsMin: set.repsMin ?? null,
                    repsMax: set.repsMax ?? null,
                    durationSeconds: set.durationSeconds ?? null,
                    weightKg: set.weightKg ?? 0,
                    intensityType: set.intensityType as
                        | "rpe"
                        | "rir"
                        | "percent_1rm",
                    intensityValue: set.intensityValue ?? 0,
                })),
            });

            toast.success("Exercise added to the day.");
            onAdded(plannedExercise);
            onClose();
        } catch (error) {
            toast.error(
                getApiErrorMessage(
                    error,
                    "We could not add this exercise to the day. Please try again.",
                ),
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
                onSubmit={handleSubmit(onSubmit)}
                className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-6 pb-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Add exercise to day
                        </p>
                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                            {exercise?.name ?? "Exercise"}
                        </h2>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                            {dayLabel} · Configure the prescription before saving.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="cursor-pointer rounded-xl border border-border p-2 transition-colors hover:bg-muted"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="rounded-3xl border border-border bg-muted/20 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-muted-foreground">
                                <DumbbellIcon size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">{exercise?.name}</p>
                                <p className="mt-1 text-xs text-muted-foreground capitalize">
                                    {exercise?.primaryMuscle?.replaceAll("_", " ")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                Position *
                            </span>
                            <input
                                {...register("position")}
                                type="number"
                                min={1}
                                max={30}
                                className={fieldCls}
                            />
                            {errors.position && (
                                <p className="mt-1 text-xs text-destructive">{errors.position.message}</p>
                            )}
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                Rest seconds *
                            </span>
                            <input
                                {...register("restSeconds")}
                                type="number"
                                min={0}
                                max={3600}
                                className={fieldCls}
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                Superset group
                            </span>
                            <input
                                {...register("supersetGroup")}
                                type="number"
                                min={1}
                                max={30}
                                placeholder="Optional"
                                className={fieldCls}
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                Tempo
                            </span>
                            <input
                                {...register("tempo")}
                                placeholder="3-1-1-0"
                                className={fieldCls}
                            />
                        </label>

                        <label className="block sm:col-span-2">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                Coach notes
                            </span>
                            <textarea
                                {...register("coachNotes")}
                                rows={3}
                                placeholder="Stop one rep before form breaks."
                                className={`${fieldCls} min-h-24 resize-y`}
                            />
                        </label>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    Sets
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Add the set prescription for this day exercise.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    append({
                                        setType: "working",
                                        repsMin: "",
                                        repsMax: "",
                                        durationSeconds: "",
                                        weightKg: "",
                                        intensityType: "",
                                        intensityValue: "",
                                    })
                                }
                                className="inline-flex items-center gap-2 rounded-2xl border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                            >
                                <Plus className="size-4" />
                                Add set
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="rounded-3xl border border-border bg-card p-4">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="size-4 text-muted-foreground" />
                                            <p className="text-sm font-semibold text-foreground">
                                                Set {index + 1}
                                            </p>
                                        </div>

                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
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
                                                {...register(`sets.${index}.setType`)}
                                                className={fieldCls}
                                            >
                                                {setTypeOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Reps min
                                            </span>
                                            <input
                                                {...register(`sets.${index}.repsMin`)}
                                                type="number"
                                                min={0}
                                                className={fieldCls}
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Reps max
                                            </span>
                                            <input
                                                {...register(`sets.${index}.repsMax`)}
                                                type="number"
                                                min={0}
                                                className={fieldCls}
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Duration seconds
                                            </span>
                                            <input
                                                {...register(`sets.${index}.durationSeconds`)}
                                                type="number"
                                                min={1}
                                                className={fieldCls}
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Weight kg
                                            </span>
                                            <input
                                                {...register(`sets.${index}.weightKg`)}
                                                type="number"
                                                min={0}
                                                step="0.5"
                                                className={fieldCls}
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Intensity type
                                            </span>
                                            <select
                                                {...register(`sets.${index}.intensityType`)}
                                                className={fieldCls}
                                            >
                                                {intensityTypeOptions.map((option) => (
                                                    <option key={option.value || "none"} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                                Intensity value
                                            </span>
                                            <input
                                                {...register(`sets.${index}.intensityValue`)}
                                                type="number"
                                                min={0}
                                                step="0.5"
                                                className={fieldCls}
                                            />
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border p-6 pt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex items-center justify-center rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting || isSubmittingLocal}
                        className="inline-flex items-center justify-center rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting || isSubmittingLocal ? "Adding…" : "Add to day"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function AddDayExerciseModal(props: Props) {
    if (!props.open || typeof document === "undefined") {
        return null;
    }

    return createPortal(<AddDayExerciseModalContent {...props} />, document.body);
}
