import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api";
import type { ClientConnection } from "@/types/client";
import { createClientProgramDraft } from "@/services/plans";
import type { ClientProgramDraft } from "@/types/plans";
import {
    createClientProgramSchema,
    defaultCreateClientProgramValues,
    getLocalDateInputValue,
    planDifficultyOptions,
    planGoalOptions,
    type CreateClientProgramFormData,
} from "@/schemas/plans";

type Props = {
    open: boolean;
    clients: ClientConnection[];
    onClose: () => void;
    onCreated: (draft: ClientProgramDraft) => void | Promise<void>;
    selectedClientId?: string | null;
};

const fieldCls =
    "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

function formatClientLabel(connection: ClientConnection) {
    const client = connection.client;
    const name = `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Unknown Client";

    return `${name} · ${client.email}`;
}

function CreatePlanModalContent({
    clients,
    onClose,
    onCreated,
    selectedClientId,
}: Omit<Props, "open">) {
    const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateClientProgramFormData>({
        resolver: zodResolver(createClientProgramSchema),
        defaultValues: defaultCreateClientProgramValues,
    });

    useEffect(() => {
        reset({
            ...defaultCreateClientProgramValues,
            startDate: getLocalDateInputValue(),
            membershipId: selectedClientId ?? clients[0]?.id ?? "",
        });
    }, [clients, reset, selectedClientId]);

    const handleClose = () => {
        onClose();
    };

    const onSubmit = async (values: CreateClientProgramFormData) => {
        setIsSubmittingLocal(true);

        try {
            const draft = await createClientProgramDraft({
                membershipId: values.membershipId,
                name: values.name.trim(),
                description: values.description?.trim() || undefined,
                goal: values.goal,
                difficulty: values.difficulty,
                durationWeeks: Number(values.durationWeeks),
                startDate: values.startDate,
            });

            toast.success("Plan draft created successfully.");
            await onCreated(draft);
            handleClose();
        } catch (error) {
            toast.error(
                getApiErrorMessage(
                    error,
                    "We could not create this plan draft. Please try again.",
                ),
            );
        } finally {
            setIsSubmittingLocal(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onClick={handleClose}
        >
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl bg-background shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-border shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Create plan draft</h2>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                            Create a dated workout-program draft for one of your active clients.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-2 transition-colors border rounded-xl cursor-pointer hover:bg-muted border-border"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <label className="block sm:col-span-2">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Client *</span>
                            <select
                                {...register("membershipId")}
                                className={fieldCls}
                                disabled={clients.length === 0}
                            >
                                <option value="">{clients.length === 0 ? "No active clients" : "Select a client"}</option>
                                {clients.map((connection) => (
                                    <option key={connection.id} value={connection.id}>
                                        {formatClientLabel(connection)}
                                    </option>
                                ))}
                            </select>
                            {errors.membershipId && (
                                <p className="mt-1 text-xs text-destructive">{errors.membershipId.message}</p>
                            )}
                        </label>

                        <label className="block sm:col-span-2">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Plan name *</span>
                            <input
                                {...register("name")}
                                placeholder="Ahmed's Strength Plan"
                                className={fieldCls}
                            />
                            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                        </label>

                        <label className="block sm:col-span-2">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Description</span>
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
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Goal</span>
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
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Difficulty</span>
                            <select {...register("difficulty")} className={fieldCls}>
                                {planDifficultyOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.difficulty && <p className="mt-1 text-xs text-destructive">{errors.difficulty.message}</p>}
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Duration weeks *</span>
                            <input
                                {...register("durationWeeks")}
                                type="number"
                                min="1"
                                max="52"
                                placeholder="8"
                                className={fieldCls}
                            />
                            {errors.durationWeeks && (
                                <p className="mt-1 text-xs text-destructive">{errors.durationWeeks.message}</p>
                            )}
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Start date *</span>
                            <input {...register("startDate")} type="date" min={getLocalDateInputValue()} className={fieldCls} />
                            {errors.startDate && <p className="mt-1 text-xs text-destructive">{errors.startDate.message}</p>}
                        </label>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 p-6 pt-4 border-t border-border shrink-0">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting || isSubmittingLocal || clients.length === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Plus className="h-4 w-4" />
                        {isSubmitting || isSubmittingLocal ? "Creating…" : "Create draft"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export function CreatePlanModal(props: Props) {
    if (!props.open || typeof document === "undefined") {
        return null;
    }

    return createPortal(
        <CreatePlanModalContent {...props} />,
        document.body,
    );
}
