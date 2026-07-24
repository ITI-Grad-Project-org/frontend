import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { updateProgramDay } from "@/services/plans";
import type { ClientProgramDay, UpdateProgramDayPayload } from "@/types/plans";

type Props = {
    open: boolean;
    programId: string | null;
    day: ClientProgramDay | null;
    onClose: () => void;
    onUpdated: (day: Partial<ClientProgramDay> & { id: string }) => void;
};

type FormValues = {
    name: string;
    notes: string;
    isRestDay: boolean;
};

const fieldCls =
    "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

function EditPlanDayModalContent({ programId, day, onClose, onUpdated }: Omit<Props, "open">) {
    const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            name: "",
            notes: "",
            isRestDay: false,
        },
    });

    useEffect(() => {
        if (!day) {
            return;
        }

        reset({
            name: day.name ?? "",
            notes: day.notes ?? "",
            isRestDay: day.isRestDay,
        });
    }, [day, reset]);

    const onSubmit = async (values: FormValues) => {
        if (!programId || !day) {
            return;
        }

        const payload: UpdateProgramDayPayload = {
            name: values.name.trim() || null,
            notes: values.notes.trim() || null,
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
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                            Name
                        </span>
                        <input {...register("name")} className={fieldCls} placeholder="Upper Body" />
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                            Notes
                        </span>
                        <textarea
                            {...register("notes")}
                            rows={4}
                            className={`${fieldCls} min-h-28 resize-y`}
                            placeholder="Focus on controlled reps"
                        />
                    </label>

                    <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                        <input {...register("isRestDay")} type="checkbox" className="size-4" />
                        <div>
                            <p className="text-sm font-semibold text-foreground">Rest day</p>
                            <p className="text-xs text-muted-foreground">
                                Mark this day as rest when it should not contain exercises.
                            </p>
                        </div>
                    </label>
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
                        disabled={isSubmitting || isSubmittingLocal}
                        className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting || isSubmittingLocal ? "Saving…" : "Save day"}
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
