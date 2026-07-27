/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from "react-hook-form";
import type { Control, FieldValues, UseFormRegister } from "react-hook-form";
import { IntensityTypeTooltip } from "@/components/ui/IntensityTypeTooltip";
import { SetTypeTooltip } from "@/components/ui/SetTypeTooltip";
import { INTENSITY_RANGES, INTENSITY_TYPES, setTypeOptions, intensityTypeOptions } from "@/schemas/addDayExercise";

// ─── Shared field styles ──────────────────────────────────────────────────────

export const fieldCls =
    "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand disabled:cursor-not-allowed disabled:bg-muted/50";
export const fieldErrorCls = "border-destructive focus:border-destructive";
export const errorMsgCls = "mt-1.5 text-xs text-destructive";

// ─── Props ────────────────────────────────────────────────────────────────────

export type SetRowProps = {
    index: number;
    control: Control<FieldValues>;
    register: UseFormRegister<FieldValues>;
    setErrors: Record<string, any> | undefined;
    /** Resolved via useWatch in the parent ConnectedSetRow */
    mode: "reps" | "duration";
    /** Resolved via useWatch in the parent ConnectedSetRow */
    intensityType: string;
    isPending: boolean;
    canRemove: boolean;
    onRemove: () => void;
    setsFieldName: string;
    /**
     * Called when the user clicks a mode button.
     * The parent ConnectedSetRow owns setValue and clears the opposing fields here.
     */
    onModeChange: (newMode: "reps" | "duration") => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SetRow({
    index,
    control,
    register,
    setErrors,
    mode,
    intensityType,
    isPending,
    canRemove,
    onRemove,
    setsFieldName,
    onModeChange,
}: SetRowProps) {
    const intensityRange = intensityType
        ? INTENSITY_RANGES[intensityType as (typeof INTENSITY_TYPES)[number]]
        : null;

    const f = (name: string) => `${setsFieldName}.${index}.${name}` as never;

    return (
        <div className="rounded-3xl border border-border bg-card/50 p-5">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-foreground">Set {index + 1}</p>
                {canRemove && (
                    <button type="button" onClick={onRemove} disabled={isPending}
                        className="rounded-xl px-2 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive">
                        Remove
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {/* Set type */}
                <div>
                    <label className="block">
                        <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            Set type * <SetTypeTooltip />
                        </span>
                        <select {...register(f("setType"))} disabled={isPending}
                            className={`${fieldCls} ${setErrors?.setType ? fieldErrorCls : ""}`}>
                            {setTypeOptions.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </label>
                    {setErrors?.setType && <p className={errorMsgCls} role="alert">{setErrors.setType.message}</p>}
                </div>

                {/* Mode toggle — clicking calls onModeChange which lives in ConnectedSetRow */}
                <div>
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Prescribed by *</span>
                    <Controller
                        control={control}
                        name={f("mode")}
                        render={({ field }) => (
                            <div className="inline-flex rounded-full border border-border bg-muted/30 p-1">
                                {(["reps", "duration"] as const).map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => {
                                            if (field.value === m) return;
                                            onModeChange(m);
                                        }}
                                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${field.value === m
                                            ? "bg-brand text-brand-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}>
                                        {m.charAt(0).toUpperCase() + m.slice(1)}
                                    </button>
                                ))}
                            </div>
                        )}
                    />

                    <p className="mt-1 text-[11px] text-muted-foreground">
                        Working and warmup sets need either reps or a duration.
                    </p>
                    <p className="text-[11px] font-bold text-muted-foreground">Switching type resets the other value</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Reps or duration */}
                    {mode === "reps" ? (
                        <>
                            <div>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Reps min *</span>
                                    <input {...register(f("repsMin"))} type="number" min={1} max={1000} disabled={isPending}
                                        className={`${fieldCls} ${setErrors?.repsMin ? fieldErrorCls : ""}`} />
                                </label>
                                {setErrors?.repsMin
                                    ? <p className={errorMsgCls} role="alert">{setErrors.repsMin.message}</p>
                                    : <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 1 to 1000.</p>}
                            </div>
                            <div>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Reps max</span>
                                    <input {...register(f("repsMax"))} type="number" min={1} max={1000} disabled={isPending}
                                        className={`${fieldCls} ${setErrors?.repsMax ? fieldErrorCls : ""}`} />
                                </label>
                                {setErrors?.repsMax
                                    ? <p className={errorMsgCls} role="alert">{setErrors.repsMax.message}</p>
                                    : <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 1 to 1000.</p>}
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Duration seconds *</span>
                                <input {...register(f("durationSeconds"))} type="number" min={1} max={21600} disabled={isPending}
                                    className={`${fieldCls} ${setErrors?.durationSeconds ? fieldErrorCls : ""}`} />
                            </label>
                            {setErrors?.durationSeconds
                                ? <p className={errorMsgCls} role="alert">{setErrors.durationSeconds.message}</p>
                                : <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 1 to 21600.</p>}
                        </div>
                    )}

                    {/* Weight */}
                    <div>
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Weight kg</span>
                            <input {...register(f("weightKg"))} type="number" min={0} max={1000} step="0.01" disabled={isPending}
                                className={`${fieldCls} ${setErrors?.weightKg ? fieldErrorCls : ""}`} />
                        </label>
                        {setErrors?.weightKg
                            ? <p className={errorMsgCls} role="alert">{setErrors.weightKg.message}</p>
                            : <p className="mt-1 text-[11px] text-muted-foreground">Allowed range: 0 to 1000.</p>}
                    </div>

                    {/* Intensity type */}
                    <div>
                        <label className="block">
                            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                Intensity type <IntensityTypeTooltip />
                            </span>
                            <select {...register(f("intensityType"))} disabled={isPending}
                                className={`${fieldCls} ${setErrors?.intensityType ? fieldErrorCls : ""}`}>
                                {intensityTypeOptions.map((o) => (
                                    <option key={o.value || "none"} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </label>
                        {setErrors?.intensityType
                            ? <p className={errorMsgCls} role="alert">{setErrors.intensityType.message}</p>
                            : <p className="mt-1 text-[11px] text-muted-foreground">Optional. Allowed: rpe, rir, percent_1rm.</p>}
                    </div>

                    {/* Intensity value */}
                    <div>
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Intensity value</span>
                            <input {...register(f("intensityValue"))} type="number"
                                min={intensityRange?.min ?? 0} max={intensityRange?.max ?? 100} step="0.01"
                                disabled={isPending || !intensityType}
                                className={`${fieldCls} ${setErrors?.intensityValue ? fieldErrorCls : ""}`} />
                        </label>
                        {setErrors?.intensityValue
                            ? <p className={errorMsgCls} role="alert">{setErrors.intensityValue.message}</p>
                            : <p className="mt-1 text-[11px] text-muted-foreground">
                                {intensityRange
                                    ? `Allowed range: ${intensityRange.min} to ${intensityRange.max}.`
                                    : "Pick an intensity type to enter a value."}
                            </p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
