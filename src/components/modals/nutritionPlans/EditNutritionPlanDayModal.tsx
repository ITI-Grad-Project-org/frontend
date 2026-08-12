// src/components/modals/nutritionPlans/EditNutritionPlanDayModal.tsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { X, Flame, Droplets, Beef, Cookie, Wheat } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { updateNutritionPlanDay } from "@/services/nutritionPlans";
import type { NutritionPlanDay } from "@/types/nutritionPlans";
import {
  updateNutritionPlanDaySchema,
  type UpdateNutritionPlanDayFormData,
} from "@/schemas/nutritionPlans";

type Props = {
  open: boolean;
  planId: string | null;
  day: NutritionPlanDay | null;
  onClose: () => void;
  onUpdated: (updatedDay: NutritionPlanDay) => void;
};

const fieldCls =
  "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";
const errorCls = "mt-1.5 text-xs text-destructive";

function EditNutritionPlanDayModalContent({
  planId,
  day,
  onClose,
  onUpdated,
}: Omit<Props, "open">) {
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UpdateNutritionPlanDayFormData>({
    resolver: zodResolver(updateNutritionPlanDaySchema),
    defaultValues: {
      isFlexibleDay: false,
      notes: "",
      targetCaloriesOverride: "",
      targetProteinGOverride: "",
      targetCarbsGOverride: "",
      targetFatGOverride: "",
      targetFiberGOverride: "",
      targetWaterMlOverride: "",
    },
  });

  useEffect(() => {
    if (!day) return;
    reset({
      isFlexibleDay: day.isFlexibleDay ?? false,
      notes: day.notes ?? "",
      targetCaloriesOverride: day.targetOverrides?.calories ?? "",
      targetProteinGOverride: day.targetOverrides?.proteinG ?? "",
      targetCarbsGOverride: day.targetOverrides?.carbsG ?? "",
      targetFatGOverride: day.targetOverrides?.fatG ?? "",
      targetFiberGOverride: day.targetOverrides?.fiberG ?? "",
      targetWaterMlOverride: day.targetOverrides?.waterMl ?? "",
    });
  }, [day, reset]);

  const isFlexibleDay = useWatch({ control, name: "isFlexibleDay" });
  const isPending = isSubmitting || isSubmittingLocal;

  const onSubmit = async (values: UpdateNutritionPlanDayFormData) => {
    if (!planId || !day) return;

    setIsSubmittingLocal(true);
    try {
      const updated = await updateNutritionPlanDay(planId, day.id, {
        isFlexibleDay: values.isFlexibleDay,
        notes: values.notes?.trim() || null,
        targetCaloriesOverride:
          values.targetCaloriesOverride === "" || values.targetCaloriesOverride === null
            ? null
            : Number(values.targetCaloriesOverride),
        targetProteinGOverride:
          values.targetProteinGOverride === "" || values.targetProteinGOverride === null
            ? null
            : Number(values.targetProteinGOverride),
        targetCarbsGOverride:
          values.targetCarbsGOverride === "" || values.targetCarbsGOverride === null
            ? null
            : Number(values.targetCarbsGOverride),
        targetFatGOverride:
          values.targetFatGOverride === "" || values.targetFatGOverride === null
            ? null
            : Number(values.targetFatGOverride),
        targetFiberGOverride:
          values.targetFiberGOverride === "" || values.targetFiberGOverride === null
            ? null
            : Number(values.targetFiberGOverride),
        targetWaterMlOverride:
          values.targetWaterMlOverride === "" || values.targetWaterMlOverride === null
            ? null
            : Number(values.targetWaterMlOverride),
      });

      toast.success(`Day ${day.dayNumber} updated.`);
      onUpdated(updated);
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not update day."));
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={() => {
        if (!isPending) onClose();
      }}
    >
      <form
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border p-6 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Configure Day
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              Day {day?.dayNumber} · {day?.scheduledDate}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-border p-2 transition hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* Flexible Day Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Flexible Day</p>
              <p className="text-xs text-muted-foreground">
                Allows client free food-diary recording. Hybrid days can still include prescribed meals.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isFlexibleDay}
              disabled={isPending}
              onClick={() => {
                const next = !isFlexibleDay;
                reset((curr) => ({ ...curr, isFlexibleDay: next }), {
                  keepErrors: true,
                  keepDirty: true,
                });
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 ${isFlexibleDay ? "bg-brand" : "bg-muted-foreground/30"
                }`}
            >
              <span
                className={`pointer-events-none h-4 w-4 rounded-full bg-card shadow-sm transition-transform ${isFlexibleDay ? "translate-x-5" : "translate-x-0.5"
                  }`}
              />
            </button>
          </div>

          {/* Day Notes */}
          <div>
            <label className="block">
              <span className="mb-1.5 text-xs font-semibold text-muted-foreground">
                Coach Day Notes
              </span>
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="e.g. Higher-calorie training day or refeed day"
                disabled={isPending}
                className={`${fieldCls} resize-y ${errors.notes ? "border-destructive" : ""}`}
              />
            </label>
            {errors.notes && <p className={errorCls}>{errors.notes.message}</p>}
          </div>

          {/* Daily Target Overrides */}
          <div className="space-y-3 pt-3 border-t border-border/60">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Daily Target Overrides
              </h3>
              <p className="text-xs text-muted-foreground">
                Leave empty to fallback to plan-level default targets.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Calories */}
              <div>
                <label className="block">
                  <span className="mb-1 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-warn" /> Calories
                  </span>
                  <input
                    {...register("targetCaloriesOverride")}
                    type="number"
                    placeholder="Plan default"
                    disabled={isPending}
                    className={fieldCls}
                  />
                </label>
                {errors.targetCaloriesOverride && (
                  <p className={errorCls}>{errors.targetCaloriesOverride.message}</p>
                )}
              </div>

              {/* Protein */}
              <div>
                <label className="block">
                  <span className="mb-1 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Beef className="w-3.5 h-3.5 text-success" /> Protein (g)
                  </span>
                  <input
                    {...register("targetProteinGOverride")}
                    type="number"
                    placeholder="Plan default"
                    disabled={isPending}
                    className={fieldCls}
                  />
                </label>
                {errors.targetProteinGOverride && (
                  <p className={errorCls}>{errors.targetProteinGOverride.message}</p>
                )}
              </div>

              {/* Carbs */}
              <div>
                <label className="block">
                  <span className="mb-1 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Cookie className="w-3.5 h-3.5 text-violet" /> Carbs (g)
                  </span>
                  <input
                    {...register("targetCarbsGOverride")}
                    type="number"
                    placeholder="Plan default"
                    disabled={isPending}
                    className={fieldCls}
                  />
                </label>
                {errors.targetCarbsGOverride && (
                  <p className={errorCls}>{errors.targetCarbsGOverride.message}</p>
                )}
              </div>

              {/* Fat */}
              <div>
                <label className="block">
                  <span className="mb-1 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    Fat (g)
                  </span>
                  <input
                    {...register("targetFatGOverride")}
                    type="number"
                    placeholder="Plan default"
                    disabled={isPending}
                    className={fieldCls}
                  />
                </label>
                {errors.targetFatGOverride && (
                  <p className={errorCls}>{errors.targetFatGOverride.message}</p>
                )}
              </div>

              {/* Fiber */}
              <div>
                <label className="block">
                  <span className="mb-1 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Wheat className="w-3.5 h-3.5 text-brand" /> Fiber (g)
                  </span>
                  <input
                    {...register("targetFiberGOverride")}
                    type="number"
                    placeholder="Plan default"
                    disabled={isPending}
                    className={fieldCls}
                  />
                </label>
                {errors.targetFiberGOverride && (
                  <p className={errorCls}>{errors.targetFiberGOverride.message}</p>
                )}
              </div>

              {/* Water */}
              <div>
                <label className="block">
                  <span className="mb-1 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-info" /> Water (ml)
                  </span>
                  <input
                    {...register("targetWaterMlOverride")}
                    type="number"
                    placeholder="Plan default"
                    disabled={isPending}
                    className={fieldCls}
                  />
                </label>
                {errors.targetWaterMlOverride && (
                  <p className={errorCls}>{errors.targetWaterMlOverride.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border p-6 pt-4">
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
            className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save Day Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditNutritionPlanDayModal(props: Props) {
  if (!props.open || typeof document === "undefined") return null;

  return createPortal(
    <EditNutritionPlanDayModalContent {...props} />,
    document.body
  );
}