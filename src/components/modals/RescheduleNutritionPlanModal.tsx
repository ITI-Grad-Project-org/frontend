// src/components/modals/RescheduleNutritionPlanModal.tsx
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CalendarClock, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api";
import { rescheduleNutritionPlan } from "@/services/nutritionPlans";
import { rescheduleSchema, getLocalDateInputValue } from "@/schemas/plans";
import type { RescheduleFormData } from "@/schemas/plans";
import type { NutritionPlanSummary } from "@/types/nutritionPlans";

type Props = {
  open: boolean;
  plan: NutritionPlanSummary | null;
  onClose: () => void;
  onRescheduled: () => void | Promise<void>;
};

const fieldCls =
  "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";
const errorMsgCls = "mt-1 text-xs text-destructive";

function RescheduleNutritionPlanModalContent({ plan, onClose, onRescheduled }: Omit<Props, "open">) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: { startDate: getLocalDateInputValue() },
  });

  useEffect(() => {
    if (!plan) return;
    reset({ startDate: plan.startDate ? plan.startDate.slice(0, 10) : getLocalDateInputValue() });
  }, [plan, reset]);

  const onSubmit = async (values: RescheduleFormData) => {
    if (!plan) return;
    try {
      await rescheduleNutritionPlan(plan.id, values.startDate);
      toast.success("Nutrition plan rescheduled successfully.");
      await onRescheduled();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not reschedule this nutrition plan. Please try again."));
    }
  };

  const isPending = isSubmitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-6 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Reschedule nutrition plan
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Move the plan to a new start date. Duration and targets stay the same.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-xl border border-border p-2 transition-colors hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-6">
          {/* Plan context */}
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Plan</p>
            <p className="mt-1 text-sm font-medium text-foreground">{plan?.name}</p>
            {plan && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Current start:{" "}
                {new Date(plan.startDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {" · "}
                {plan.durationWeeks} week{plan.durationWeeks !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Start date field */}
          <div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                New start date *
              </span>
              <input
                {...register("startDate")}
                type="date"
                min={getLocalDateInputValue()}
                disabled={isPending}
                className={`${fieldCls} ${errors.startDate ? "border-destructive focus:border-destructive" : ""}`}
              />
            </label>
            {errors.startDate && (
              <p className={errorMsgCls} role="alert">{errors.startDate.message}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border p-6 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !plan}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CalendarClock className="h-4 w-4" />
            {isPending ? "Rescheduling…" : "Reschedule"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function RescheduleNutritionPlanModal(props: Props) {
  if (!props.open || typeof document === "undefined") return null;
  return createPortal(<RescheduleNutritionPlanModalContent {...props} />, document.body);
}
