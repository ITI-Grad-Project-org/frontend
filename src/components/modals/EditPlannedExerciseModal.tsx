import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm, useFieldArray } from "react-hook-form";
import type { Control, FieldValues, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Plus, X } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { replacePlannedExerciseSets, updatePlannedExercise } from "@/services/plans";
import type { PlannedExercise } from "@/types/plans";
import { TempoTooltip } from "@/components/ui/TempoTooltip";
import {
    editPlannedExerciseFormSchema,
    buildEditDefaultValues,
    makeDefaultSet,
} from "@/schemas/addDayExercise";
import type { EditPlannedExerciseFormValues, EditPlannedExerciseSubmitValues } from "@/schemas/addDayExercise";
import { ConnectedSetRow } from "../plans/ConnectedSetRow";

// ─── Styles ───────────────────────────────────────────────────────────────────

const fieldCls =
    "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand disabled:cursor-not-allowed disabled:bg-muted/50";
const fieldErrorCls = "border-destructive focus:border-destructive";
const errorMsgCls = "mt-1.5 text-xs text-destructive";


// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
    open: boolean;
    programId: string | null;
    exercise: PlannedExercise | null;
    onClose: () => void;
    onUpdated: (exercise: PlannedExercise) => void;
};

// ─── Modal content ────────────────────────────────────────────────────────────

function EditPlannedExerciseModalContent({
    programId,
    exercise,
    onClose,
    onUpdated,
}: Omit<Props, "open">) {
    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<EditPlannedExerciseFormValues, unknown, EditPlannedExerciseSubmitValues>({
        resolver: zodResolver(editPlannedExerciseFormSchema),
        defaultValues: exercise ? buildEditDefaultValues(exercise) : undefined,
    });

    // Sync form whenever the exercise prop changes (modal reused for different exercises)
    useEffect(() => {
        if (exercise) {
            reset(buildEditDefaultValues(exercise));
        }
    }, [exercise, reset]);

    const { fields, append, remove } = useFieldArray({ control, name: "sets" });

    const isPending = isSubmitting;

    // Cast to base FieldValues type for the shared ConnectedSetRow component
    const fvControl = control as unknown as Control<FieldValues>;
    const fvRegister = register as unknown as UseFormRegister<FieldValues>;
    const fvSetValue = setValue as unknown as UseFormSetValue<FieldValues>;

    const onSubmit = async (values: EditPlannedExerciseSubmitValues) => {
        if (!programId || !exercise) return;

        const tempo = `${values.tempo0}-${values.tempo1}-${values.tempo2}-${values.tempo3}`;

        try {
            const updatedExercise = await updatePlannedExercise(programId, exercise.id, {
                position: values.position,
                supersetGroup: values.supersetGroup,
                restSeconds: values.restSeconds,
                tempo,
                coachNotes: values.coachNotes.trim() || null,
            });

            const updatedSets = await replacePlannedExerciseSets(programId, exercise.id, {
                sets: values.sets.map((set) => ({
                    setType: set.setType,
                    repsMin: set.mode === "reps" ? set.repsMin : null,
                    repsMax: set.mode === "reps" ? set.repsMax : null,
                    durationSeconds: set.mode === "duration" ? set.durationSeconds : null,
                    weightKg: set.weightKg,
                    intensityType: set.intensityType === "" ? null : set.intensityType,
                    intensityValue: set.intensityValue,
                })),
            });

            onUpdated({ ...updatedExercise, sets: updatedSets } as PlannedExercise);
            toast.success("Exercise updated.");
            onClose();
        } catch (error) {
            toast.error(getApiErrorMessage(error, "We could not update this exercise."));
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
                className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit(onSubmit)}
            >
                {/* Header */}
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-6 pb-4">
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
                        aria-label="Close"
                        className="rounded-xl border border-border p-2 transition hover:bg-muted"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Prescription fields */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Position */}
                        <div>
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Position *</span>
                                <input
                                    readOnly
                                    {...register("position")}
                                    type="number" min={1} max={30} disabled={isPending}
                                    className={`${fieldCls} ${errors.position ? fieldErrorCls : ""}`}
                                />
                            </label>
                            {errors.position
                                ? <p className={errorMsgCls} role="alert">{errors.position.message}</p>
                                : <p className="mt-1 text-[11px] text-muted-foreground">drag the exercise to change its order for the client</p>
                            }
                        </div>

                        {/* Rest seconds */}
                        <div>
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Rest seconds *</span>
                                <input
                                    {...register("restSeconds")}
                                    type="number" min={0} max={3600} disabled={isPending}
                                    className={`${fieldCls} ${errors.restSeconds ? fieldErrorCls : ""}`}
                                />
                            </label>
                            {errors.restSeconds
                                ? <p className={errorMsgCls} role="alert">{errors.restSeconds.message}</p>
                                : <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 0 to 3600 seconds.</p>
                            }
                        </div>

                        {/* Superset group */}
                        <div>
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Superset group</span>
                                <input
                                    {...register("supersetGroup")}
                                    type="number" min={1} max={30} disabled={isPending}
                                    className={`${fieldCls} ${errors.supersetGroup ? fieldErrorCls : ""}`}
                                />
                            </label>
                            {errors.supersetGroup
                                ? <p className={errorMsgCls} role="alert">{errors.supersetGroup.message}</p>
                                : <p className="mt-1 text-[11px] text-muted-foreground">Optional. Allowed range: 1 to 30.</p>
                            }
                        </div>

                        {/* Tempo */}
                        <div>
                            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                Tempo * <TempoTooltip />
                            </span>
                            <div className="grid grid-cols-4 gap-2">
                                {(["tempo0", "tempo1", "tempo2", "tempo3"] as const).map((name) => (
                                    <input
                                        key={name}
                                        {...register(name)}
                                        disabled={isPending}
                                        className={`${fieldCls} text-center font-medium ${errors[name] ? fieldErrorCls : ""}`}
                                    />
                                ))}
                            </div>
                            {(errors.tempo0 ?? errors.tempo1 ?? errors.tempo2 ?? errors.tempo3)
                                ? <p className={errorMsgCls} role="alert">Each tempo phase must be a digit (0–9) or X.</p>
                                : <p className="mt-1 text-[11px] text-muted-foreground">Format: 4 digits or X (e.g. 3-1-X-0).</p>
                            }
                        </div>

                        {/* Coach notes */}
                        <div className="sm:col-span-2">
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Coach notes</span>
                                <textarea
                                    {...register("coachNotes")}
                                    rows={3} disabled={isPending}
                                    className={`${fieldCls} min-h-24 resize-y ${errors.coachNotes ? fieldErrorCls : ""}`}
                                />
                            </label>
                            {errors.coachNotes
                                ? <p className={errorMsgCls} role="alert">{errors.coachNotes.message}</p>
                                : <p className="mt-1 text-[11px] text-muted-foreground">Maximum 5,000 characters.</p>
                            }
                        </div>
                    </div>

                    {/* Sets */}
                    <div className="mt-8 flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">SETS</h3>
                            {errors.sets?.root
                                ? <p className={errorMsgCls} role="alert">{errors.sets.root.message}</p>
                                : <p className="mt-0.5 text-xs text-muted-foreground">Every set field is required.</p>
                            }
                        </div>
                        <button
                            type="button"
                            onClick={() => append(makeDefaultSet())}
                            disabled={isPending}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
                        >
                            <Plus className="size-3.5" />
                            Add set
                        </button>
                    </div>

                    <div className="mt-4 space-y-4">
                        {fields.map((field, index) => (
                            <ConnectedSetRow
                                key={field.id}
                                index={index}
                                control={fvControl}
                                register={fvRegister}
                                setValue={fvSetValue}
                                setErrors={errors.sets?.[index] as Record<string, unknown> | undefined}
                                isPending={isPending}
                                canRemove={fields.length > 1}
                                onRemove={() => remove(index)}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border p-6 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isPending ? "Saving…" : "Save exercise"}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ─── Public export ────────────────────────────────────────────────────────────

export default function EditPlannedExerciseModal(props: Props) {
    if (!props.open || typeof document === "undefined") return null;

    return createPortal(
        <EditPlannedExerciseModalContent {...props} />,
        document.body,
    );
}
