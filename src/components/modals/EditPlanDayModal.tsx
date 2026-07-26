import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { updateProgramDay } from "@/services/plans";
import type { ClientProgramDay, UpdateProgramDayPayload } from "@/types/plans";
import {
    updateProgramDaySchema,
    type UpdateProgramDayFormData,
} from "@/schemas/plans";

type Props = {
    open: boolean;
    programId: string | null;
    day: ClientProgramDay | null;
    onClose: () => void;
    onUpdated: (day: Partial<ClientProgramDay> & { id: string }) => void;
};

const fieldCls =
    "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

const errorCls = "mt-1.5 text-xs text-destructive";

function EditPlanDayModalContent({ programId, day, onClose, onUpdated }: Omit<Props, "open">) {
    const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<UpdateProgramDayFormData>({
        resolver: zodResolver(updateProgramDaySchema),
        defaultValues: {
            name: "",
            notes: "",
            isRestDay: false,
        },
    });

    useEffect(() => {
        if (!day) return;

        reset({
            name: day.name ?? "",
            notes: day.notes ?? "",
            isRestDay: day.isRestDay ?? false,
        });
    }, [day, reset]);

    const isRestDay = useWatch({ control, name: "isRestDay" });

    const onSubmit = async (values: UpdateProgramDayFormData) => {
        if (!programId || !day) return;

        const payload: UpdateProgramDayPayload = {
            name: values.name?.trim() || null,
            notes: values.notes?.trim() || null,
            isRestDay: values.isRestDay,
        };

        setIsSubmittingLocal(true);

        try {
            const updated = await updateProgramDay(programId, day.id, payload);
            onUpdated({
                id: day.id,
                ...(updated as Partial<ClientProgramDay>),
            });
            toast.success("Day updated.");
            onClose();
        } catch (error) {
            toast.error(getApiErrorMessage(error, "We could not update this day."));
        } finally {
            setIsSubmittingLocal(false);
        }
    };

    const isPending = isSubmitting || isSubmittingLocal;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <form
                className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl"
                onClick={(event) => event.stopPropagation()}
                onSubmit={handleSubmit(onSubmit)}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-border p-6 pb-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Edit day
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-foreground">
                            Day {day?.dayNumber}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-border p-2 transition hover:bg-muted"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                    {/* Name */}
                    <div>
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                Name
                            </span>
                            <input
                                {...register("name")}
                                className={`${fieldCls} ${errors.name ? "border-destructive focus:border-destructive" : ""}`}
                                placeholder="Upper Body"
                                disabled={isPending}
                            />
                        </label>
                        {errors.name && (
                            <p className={errorCls} role="alert">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                Notes
                            </span>
                            <textarea
                                {...register("notes")}
                                rows={4}
                                className={`${fieldCls} min-h-28 resize-y ${errors.notes ? "border-destructive focus:border-destructive" : ""}`}
                                placeholder="Focus on controlled reps"
                                disabled={isPending}
                            />
                        </label>
                        {errors.notes && (
                            <p className={errorCls} role="alert">
                                {errors.notes.message}
                            </p>
                        )}
                    </div>

                    {/* Rest day toggle */}
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Rest day</p>
                            <p className="text-xs text-muted-foreground">
                                Mark this day as a rest day — no exercises will be prescribed.
                            </p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={isRestDay}
                            disabled={isPending}
                            onClick={() => {
                                const next = !isRestDay;
                                reset(
                                    (current) => ({ ...current, isRestDay: next }),
                                    { keepErrors: true, keepDirty: true },
                                );
                            }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50 ${isRestDay ? "bg-brand" : "bg-muted-foreground/30"
                                }`}
                        >
                            <span
                                className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isRestDay ? "translate-x-5" : "translate-x-0.5"
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-border p-6 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isPending ? "Saving…" : "Save day"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function EditPlanDayModal(props: Props) {
    if (!props.open || typeof document === "undefined") {
        return null;
    }

    return createPortal(<EditPlanDayModalContent {...props} />, document.body);
}
