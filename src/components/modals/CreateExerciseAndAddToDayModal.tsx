import { createPortal } from "react-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Plus, X } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { createExerciseInLibraryAndAddToDay } from "@/services/plans";
import type { PlannedExercise } from "@/types/plans";
import { TempoTooltip } from "@/components/ui/TempoTooltip";
import {
    createExerciseAndAddToDayFormSchema,
    getDefaultFormValues,
    makeDefaultSet,
    CATEGORY_VALUES,
    MUSCLE_VALUES,
    EQUIPMENT_VALUES,
} from "@/schemas/createExerciseAndAddToDay";
import type {
    CreateExerciseAndAddToDayFormValues,
    CreateExerciseAndAddToDaySubmitValues,
} from "@/schemas/createExerciseAndAddToDay";
import { ConnectedSetRow } from "../plans/ConnectedSetRow";

// ─── Styles ───────────────────────────────────────────────────────────────────

const fieldCls =
    "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand disabled:cursor-not-allowed disabled:bg-muted/50";
const fieldErrorCls = "border-destructive focus:border-destructive";
const errorMsgCls = "mt-1.5 text-xs text-destructive";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function humanize(value: string) {
    return value.replaceAll("_", " ");
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
    open: boolean;
    programId: string | null;
    programDayId: string | null;
    dayLabel: string;
    defaultPosition: number;
    onClose: () => void;
    onAdded: (plannedExercise: PlannedExercise) => void;
};


// ─── Modal content ────────────────────────────────────────────────────────────

function CreateExerciseAndAddToDayModalContent({
    programId,
    programDayId,
    dayLabel,
    defaultPosition,
    onClose,
    onAdded,
}: Omit<Props, "open">) {
    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CreateExerciseAndAddToDayFormValues>({
        resolver: zodResolver(createExerciseAndAddToDayFormSchema),
        defaultValues: getDefaultFormValues(defaultPosition),
    });

    const { fields: stepFields, append: appendStep, remove: removeStep } =
        useFieldArray({ control, name: "instructionSteps" });

    const { fields: setFields, append: appendSet, remove: removeSet } =
        useFieldArray({ control, name: "sets" });

    const isPending = isSubmitting;
    const handleClose = () => { if (!isPending) onClose(); };

    const onSubmit = async (values: CreateExerciseAndAddToDaySubmitValues) => {
        if (!programId || !programDayId) return;
        const tempo = `${values.tempo0}-${values.tempo1}-${values.tempo2}-${values.tempo3}`;
        try {
            const result = await createExerciseInLibraryAndAddToDay(programId, programDayId, {
                exercise: {
                    name: values.name,
                    category: values.category,
                    primaryMuscle: values.primaryMuscle,
                    secondaryMuscles: values.secondaryMuscles,
                    equipment: values.equipment,
                    demoVideoUrl: values.demoVideoUrl || null,
                    demoGifUrl: values.demoGifUrl || null,
                    thumbnailUrl: values.thumbnailUrl || null,
                    instructionSteps: values.instructionSteps.map((s) => s.value),
                },
                prescription: {
                    position: values.position,
                    supersetGroup: values.supersetGroup,
                    restSeconds: values.restSeconds,
                    tempo,
                    coachNotes: values.coachNotes.trim() || null,
                    sets: values.sets.map((set) => ({
                        setType: set.setType,
                        repsMin: set.mode === "reps" ? set.repsMin : null,
                        repsMax: set.mode === "reps" ? set.repsMax : null,
                        durationSeconds: set.mode === "duration" ? set.durationSeconds : null,
                        weightKg: set.weightKg,
                        intensityType: set.intensityType === "" ? null : set.intensityType,
                        intensityValue: set.intensityValue,
                    })),
                },
            });
            toast.success("Exercise created and added to the day.");
            onAdded(result.plannedExercise);
            onClose();
        } catch (error) {
            toast.error(getApiErrorMessage(error, "We could not create this exercise and add it to the day."));
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            role="dialog" aria-modal="true" onClick={handleClose}
        >
            <form
                className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit(onSubmit)}
            >
                {/* Header */}
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-6 pb-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Create exercise in library
                        </p>
                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Add to {dayLabel}</h2>
                    </div>
                    <button type="button" onClick={handleClose} aria-label="Close"
                        className="rounded-xl border border-border p-2 transition hover:bg-muted">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto p-6">

                    {/* ══════════════ EXERCISE SECTION ══════════════ */}
                    <section className="rounded-3xl border border-border bg-card p-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Exercise</h3>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">

                            {/* Name */}
                            <div className="sm:col-span-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Name *</span>
                                    <input {...register("name")} disabled={isPending}
                                        className={`${fieldCls} ${errors.name ? fieldErrorCls : ""}`} />
                                </label>
                                {errors.name
                                    ? <p className={errorMsgCls} role="alert">{errors.name.message}</p>
                                    : <p className="mt-1 text-[11px] text-muted-foreground">Max 150 characters.</p>}
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Category *</span>
                                    <select {...register("category")} disabled={isPending}
                                        className={`${fieldCls} ${errors.category ? fieldErrorCls : ""}`}>
                                        {CATEGORY_VALUES.map((v) => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </label>
                                {errors.category && <p className={errorMsgCls} role="alert">{errors.category.message}</p>}
                            </div>

                            {/* Primary muscle */}
                            <div>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Primary muscle *</span>
                                    <select {...register("primaryMuscle")} disabled={isPending}
                                        className={`${fieldCls} ${errors.primaryMuscle ? fieldErrorCls : ""}`}>
                                        {MUSCLE_VALUES.map((v) => <option key={v} value={v}>{humanize(v)}</option>)}
                                    </select>
                                </label>
                                {errors.primaryMuscle && <p className={errorMsgCls} role="alert">{errors.primaryMuscle.message}</p>}
                            </div>

                            {/* Secondary muscles */}
                            <fieldset className="sm:col-span-2">
                                <legend className="mb-1.5 block text-xs font-semibold text-muted-foreground">Secondary muscles</legend>
                                <Controller control={control} name="secondaryMuscles"
                                    render={({ field }) => (
                                        <div className="rounded-2xl border border-border bg-background p-3">
                                            <div className="flex flex-wrap gap-2">
                                                {MUSCLE_VALUES.map((v) => {
                                                    const active = field.value.includes(v);
                                                    return (
                                                        <button key={v} type="button" disabled={isPending} aria-pressed={active}
                                                            onClick={() => field.onChange(active ? field.value.filter((m) => m !== v) : [...field.value, v])}
                                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${active ? "border-brand bg-brand/10 text-foreground" : "border-border text-muted-foreground hover:border-brand hover:text-foreground"}`}>
                                                            {active ? <X size={10} /> : <Plus size={10} />}
                                                            {humanize(v)}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                />
                                {errors.secondaryMuscles && <p className={errorMsgCls} role="alert">{errors.secondaryMuscles.message}</p>}
                            </fieldset>

                            {/* Equipment */}
                            <fieldset className="sm:col-span-2">
                                <legend className="mb-1.5 block text-xs font-semibold text-muted-foreground">Equipment</legend>
                                <Controller control={control} name="equipment"
                                    render={({ field }) => (
                                        <div className="rounded-2xl border border-border bg-background p-3">
                                            <div className="flex flex-wrap gap-2">
                                                {EQUIPMENT_VALUES.map((v) => {
                                                    const active = field.value.includes(v);
                                                    return (
                                                        <button key={v} type="button" disabled={isPending} aria-pressed={active}
                                                            onClick={() => {
                                                                if (v === "none") {
                                                                    field.onChange(active ? [] : ["none"]);
                                                                } else {
                                                                    const next = field.value.filter((e) => e !== "none");
                                                                    field.onChange(active ? next.filter((e) => e !== v) : [...next, v]);
                                                                }
                                                            }}
                                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${active ? "border-brand bg-brand/10 text-foreground" : "border-border text-muted-foreground hover:border-brand hover:text-foreground"}`}>
                                                            {active ? <X size={10} /> : <Plus size={10} />}
                                                            {humanize(v)}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                />
                                {errors.equipment && <p className={errorMsgCls} role="alert">{errors.equipment.message}</p>}
                            </fieldset>

                            {/* Instruction steps */}
                            <fieldset className="sm:col-span-2">
                                <legend className="mb-1.5 block text-xs font-semibold text-muted-foreground">Instruction steps *</legend>
                                <div className="space-y-2">
                                    {stepFields.map((stepField, i) => (
                                        <div key={stepField.id}>
                                            <div className="flex gap-2">
                                                <input {...register(`instructionSteps.${i}.value`)} disabled={isPending}
                                                    placeholder={`Step ${i + 1}`}
                                                    className={`${fieldCls} ${errors.instructionSteps?.[i]?.value ? fieldErrorCls : ""}`} />
                                                {stepFields.length > 1 && (
                                                    <button type="button" onClick={() => removeStep(i)} disabled={isPending}
                                                        className="rounded-2xl border border-border px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted disabled:opacity-60">
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            {errors.instructionSteps?.[i]?.value && (
                                                <p className={errorMsgCls} role="alert">{errors.instructionSteps[i]?.value?.message}</p>
                                            )}
                                        </div>
                                    ))}
                                    {errors.instructionSteps?.root && (
                                        <p className={errorMsgCls} role="alert">{errors.instructionSteps.root.message}</p>
                                    )}
                                    <p className="text-[11px] text-muted-foreground">At least 1 step, max 10.</p>
                                    <button type="button" onClick={() => appendStep({ value: "" })}
                                        disabled={isPending || stepFields.length >= 10}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60">
                                        <Plus className="size-4" /> Add step
                                    </button>
                                </div>
                            </fieldset>

                            {/* Optional URLs */}
                            <div>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Demo video URL</span>
                                    <input {...register("demoVideoUrl")} disabled={isPending}
                                        className={`${fieldCls} ${errors.demoVideoUrl ? fieldErrorCls : ""}`} />
                                </label>
                                {errors.demoVideoUrl && <p className={errorMsgCls} role="alert">{errors.demoVideoUrl.message}</p>}
                            </div>

                            <div>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Demo GIF URL</span>
                                    <input {...register("demoGifUrl")} disabled={isPending}
                                        className={`${fieldCls} ${errors.demoGifUrl ? fieldErrorCls : ""}`} />
                                </label>
                                {errors.demoGifUrl && <p className={errorMsgCls} role="alert">{errors.demoGifUrl.message}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Thumbnail URL</span>
                                    <input {...register("thumbnailUrl")} disabled={isPending}
                                        className={`${fieldCls} ${errors.thumbnailUrl ? fieldErrorCls : ""}`} />
                                </label>
                                {errors.thumbnailUrl && <p className={errorMsgCls} role="alert">{errors.thumbnailUrl.message}</p>}
                            </div>

                        </div>
                    </section>

                    {/* ══════════════ PRESCRIPTION SECTION ══════════════ */}
                    <section className="rounded-3xl border border-border bg-card p-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Prescription</h3>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">

                            {/* Position */}
                            <div>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Position *</span>
                                    <input {...register("position")} type="number" min={1} max={30} disabled={isPending}
                                        className={`${fieldCls} ${errors.position ? fieldErrorCls : ""}`} />
                                </label>
                                {errors.position
                                    ? <p className={errorMsgCls} role="alert">{errors.position.message}</p>
                                    : <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 1 to 30.</p>}
                            </div>

                            {/* Rest seconds */}
                            <div>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Rest seconds *</span>
                                    <input {...register("restSeconds")} type="number" min={0} max={3600} disabled={isPending}
                                        className={`${fieldCls} ${errors.restSeconds ? fieldErrorCls : ""}`} />
                                </label>
                                {errors.restSeconds
                                    ? <p className={errorMsgCls} role="alert">{errors.restSeconds.message}</p>
                                    : <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 0 to 3600 seconds.</p>}
                            </div>

                            {/* Superset group */}
                            <div>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Superset group</span>
                                    <input {...register("supersetGroup")} type="number" min={1} max={30} disabled={isPending}
                                        className={`${fieldCls} ${errors.supersetGroup ? fieldErrorCls : ""}`} />
                                </label>
                                {errors.supersetGroup
                                    ? <p className={errorMsgCls} role="alert">{errors.supersetGroup.message}</p>
                                    : <p className="mt-1 text-[11px] text-muted-foreground">Optional. Allowed range: 1 to 30.</p>}
                            </div>

                            {/* Tempo */}
                            <div>
                                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                    Tempo * <TempoTooltip />
                                </span>
                                <div className="grid grid-cols-4 gap-2">
                                    {(["tempo0", "tempo1", "tempo2", "tempo3"] as const).map((name) => (
                                        <input key={name} {...register(name)} disabled={isPending}
                                            className={`${fieldCls} text-center font-medium ${errors[name] ? fieldErrorCls : ""}`} />
                                    ))}
                                </div>
                                {(errors.tempo0 ?? errors.tempo1 ?? errors.tempo2 ?? errors.tempo3)
                                    ? <p className={errorMsgCls} role="alert">Each tempo phase must be a digit (0–9) or X.</p>
                                    : <p className="mt-1 text-[11px] text-muted-foreground">Format: 4 digits or X (e.g. 3-1-X-0).</p>}
                            </div>

                            {/* Coach notes */}
                            <div className="sm:col-span-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Coach notes</span>
                                    <textarea {...register("coachNotes")} rows={3} disabled={isPending}
                                        className={`${fieldCls} min-h-24 resize-y ${errors.coachNotes ? fieldErrorCls : ""}`} />
                                </label>
                                {errors.coachNotes
                                    ? <p className={errorMsgCls} role="alert">{errors.coachNotes.message}</p>
                                    : <p className="mt-1 text-[11px] text-muted-foreground">Maximum 5,000 characters.</p>}
                            </div>

                        </div>

                        {/* Sets */}
                        <div className="mt-6 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Sets</p>
                                {errors.sets?.root
                                    ? <p className={errorMsgCls} role="alert">{errors.sets.root.message}</p>
                                    : <p className="mt-0.5 text-xs text-muted-foreground">Every set field is required.</p>}
                            </div>
                            <button type="button" onClick={() => appendSet(makeDefaultSet())}
                                disabled={isPending || setFields.length >= 20}
                                className="inline-flex items-center gap-2 rounded-2xl border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60">
                                <Plus className="size-4" /> Add set
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {setFields.map((field, index) => (
                                <ConnectedSetRow
                                    key={field.id}
                                    index={index}
                                    control={control}
                                    register={register}
                                    setValue={setValue}
                                    setErrors={errors.sets?.[index] as Record<string, unknown> | undefined}
                                    isPending={isPending}
                                    canRemove={setFields.length > 1}
                                    onRemove={() => removeSet(index)}
                                />
                            ))}
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border p-6 pt-4">
                    <button type="button" onClick={handleClose} disabled={isPending}
                        className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60">
                        Cancel
                    </button>
                    <button type="submit" disabled={isPending}
                        className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                        {isPending ? "Saving…" : "Create and add"}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ─── Public export ────────────────────────────────────────────────────────────

export default function CreateExerciseAndAddToDayModal(props: Props) {
    if (!props.open || typeof document === "undefined") return null;

    const resetKey = `${props.programDayId ?? ""}::${props.defaultPosition}`;

    return createPortal(
        <CreateExerciseAndAddToDayModalContent key={resetKey} {...props} />,
        document.body,
    );
}
