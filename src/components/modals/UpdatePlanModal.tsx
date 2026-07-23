import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Pencil, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api";
import { updateClientProgramDraft } from "@/services/plans";
import type { ClientProgramDraft } from "@/types/plans";
import {
    getLocalDateInputValue,
    planDifficultyOptions,
    planGoalOptions,
    type UpdateClientProgramFormData,
    updateClientProgramSchema,
} from "@/schemas/plans";

type Props = {
    open: boolean;
    program: ClientProgramDraft | null;
    onClose: () => void;
    onUpdated: (draft: ClientProgramDraft) => void | Promise<void>;
};

const fieldCls =
    "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

function UpdatePlanModalContent({ program, onClose, onUpdated }: Omit<Props, "open">) {
    const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UpdateClientProgramFormData>({
        resolver: zodResolver(updateClientProgramSchema),
        defaultValues: {
            name: "",
            description: "",
            goal: "general_health",
            difficulty: "beginner",
            startDate: getLocalDateInputValue(),
        },
    });

    useEffect(() => {
        if (!program) {
            return;
        }

        reset({
            name: program.name,
            description: program.description ?? "",
            goal: program.goal,
            difficulty: program.difficulty,
            startDate: program.startDate,
        });
    }, [program, reset]);

    const handleClose = () => {
        onClose();
    };

    const onSubmit = async (values: UpdateClientProgramFormData) => {
        if (!program) {
            return;
        }

        setIsSubmittingLocal(true);

        try {
            const draft = await updateClientProgramDraft(program.id, {
                name: values.name.trim(),
                description: values.description?.trim() ?? "",
                goal: values.goal,
                difficulty: values.difficulty,
                startDate: values.startDate,
            });

            toast.success("Plan draft updated successfully.");
            await onUpdated(draft);
            handleClose();
        } catch (error) {
            toast.error(
                getApiErrorMessage(
                    error,
                    "We could not update this plan draft. Please try again.",
                ),
            );
        } finally {
            setIsSubmittingLocal(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onClick={handleClose}
        >
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-6 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            Update plan draft
                        </h2>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                            Edit the draft metadata and start date before publishing.
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

                <div className="flex-1 space-y-5 overflow-y-auto p-6">
                    <div className="rounded-2xl border border-border bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Draft program
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">{program?.name}</p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <label className="block sm:col-span-2">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                Plan name *
                            </span>
                            <input
                                {...register("name")}
                                placeholder="Ahmed's Strength Plan"
                                className={fieldCls}
                            />
                            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                        </label>

                        <label className="block sm:col-span-2">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                Description
                            </span>
                            <textarea
                                {...register("description")}
                                placeholder="Eight-week strength phase focused on progressive overload."
                                rows={4}
                                className={`${fieldCls} min-h-28 resize-y`}
                            />
                            {errors.description && (
                                <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
                            )}
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                Goal
                            </span>
                            <select {...register("goal")} className={fieldCls}>
                                {planGoalOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.goal && <p className="mt-1 text-xs text-destructive">{errors.goal.message}</p>}
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                Difficulty
                            </span>
                            <select {...register("difficulty")} className={fieldCls}>
                                {planDifficultyOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.difficulty && (
                                <p className="mt-1 text-xs text-destructive">{errors.difficulty.message}</p>
                            )}
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                Start date *
                            </span>
                            <input {...register("startDate")} type="date" className={fieldCls} />
                            {errors.startDate && (
                                <p className="mt-1 text-xs text-destructive">{errors.startDate.message}</p>
                            )}
                        </label>
                    </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border p-6 pt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting || isSubmittingLocal || !program}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Pencil className="h-4 w-4" />
                        {isSubmitting || isSubmittingLocal ? "Saving…" : "Save changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export function UpdatePlanModal(props: Props) {
    if (!props.open || typeof document === "undefined") {
        return null;
    }

    return createPortal(<UpdatePlanModalContent {...props} />, document.body);
}
