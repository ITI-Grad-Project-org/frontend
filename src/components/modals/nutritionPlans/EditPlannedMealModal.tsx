// src/components/modals/nutritionPlans/EditPlannedMealModal.tsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { X, Clock, FileText } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import {
  updatePlannedMeal,
  replacePlannedMealItems,
} from "@/services/nutritionPlans";
import type { NutritionPlanMeal, MealSlot } from "@/types/nutritionPlans";
import { MEAL_SLOTS } from "@/types/nutritionPlans";
import {
  editPlannedMealSchema,
  type EditPlannedMealFormData,
} from "@/schemas/nutritionPlans";

type Props = {
  open: boolean;
  planId: string | null;
  plannedMeal: NutritionPlanMeal | null;
  onClose: () => void;
  onUpdated: (updatedMeal: NutritionPlanMeal) => void;
};

const fieldCls =
  "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand disabled:cursor-not-allowed disabled:bg-muted/50";
const errorMsgCls = "mt-1.5 text-xs text-destructive";

function EditPlannedMealModalContent({
  planId,
  plannedMeal,
  onClose,
  onUpdated,
}: Omit<Props, "open">) {
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditPlannedMealFormData>({
    resolver: zodResolver(editPlannedMealSchema),
    defaultValues: {
      slot: "breakfast",
      position: 1,
      suggestedTime: "08:30",
      coachNotes: "",
      foods: [],
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "foods",
  });

  useEffect(() => {
    if (!plannedMeal) return;
    reset({
      slot: (plannedMeal.slot as MealSlot) || "breakfast",
      position: plannedMeal.position || 1,
      suggestedTime: plannedMeal.suggestedTime || "",
      coachNotes: plannedMeal.coachNotes || "",
      foods: (plannedMeal.foods || []).map((f) => ({
        plannedMealFoodId: f.id,
        foodName: f.foodName,
        servingUnit: f.servingUnit,
        amount: f.amount,
      })),
    });
  }, [plannedMeal, reset]);

  const isPending = isSubmitting || isSubmittingLocal;

  const onSubmit = async (values: EditPlannedMealFormData) => {
    if (!planId || !plannedMeal) return;

    setIsSubmittingLocal(true);
    try {
      // Step 1: Update metadata (slot, position, suggestedTime, coachNotes)
      let result = await updatePlannedMeal(planId, plannedMeal.id, {
        slot: values.slot as MealSlot,
        position: Number(values.position),
        suggestedTime: values.suggestedTime?.trim() || null,
        coachNotes: values.coachNotes?.trim() || null,
      });

      // Step 2: Replace food amounts if present
      if (values.foods && values.foods.length > 0) {
        result = await replacePlannedMealItems(planId, plannedMeal.id, {
          items: values.foods.map((f) => ({
            plannedMealFoodId: f.plannedMealFoodId,
            amount: Number(f.amount),
          })),
        });
      }

      toast.success(`Planned meal "${result.mealName}" updated.`);
      onUpdated(result);
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not update planned meal."));
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
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-6 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Edit Planned Meal
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {plannedMeal?.mealName ?? "Planned Meal"}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Slot */}
            <div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Meal Slot *
                </span>
                <select
                  {...register("slot")}
                  disabled={isPending}
                  className={fieldCls}
                >
                  {MEAL_SLOTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              {errors.slot && <p className={errorMsgCls}>{errors.slot.message}</p>}
            </div>

            {/* Position */}
            <div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Position (1–10) *
                </span>
                <input
                  {...register("position", { valueAsNumber: true })}
                  type="number"
                  min={1}
                  max={10}
                  disabled={isPending}
                  className={`${fieldCls} ${errors.position ? "border-destructive" : ""}`}
                />
              </label>
              {errors.position && <p className={errorMsgCls}>{errors.position.message}</p>}
            </div>

            {/* Suggested Time */}
            <div>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" /> Suggested Time
                </span>
                <input
                  {...register("suggestedTime")}
                  type="time"
                  disabled={isPending}
                  className={`${fieldCls} ${errors.suggestedTime ? "border-destructive" : ""}`}
                />
              </label>
              {errors.suggestedTime && <p className={errorMsgCls}>{errors.suggestedTime.message}</p>}
            </div>

            {/* Coach Notes */}
            <div className="sm:col-span-2">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <FileText className="w-3.5 h-3.5" /> Coach Notes
                </span>
                <textarea
                  {...register("coachNotes")}
                  rows={2}
                  placeholder="Coach notes for client"
                  disabled={isPending}
                  className={`${fieldCls} resize-y ${errors.coachNotes ? "border-destructive" : ""}`}
                />
              </label>
              {errors.coachNotes && <p className={errorMsgCls}>{errors.coachNotes.message}</p>}
            </div>
          </div>

          {/* Food items & amounts */}
          {fields.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Prescribed Food Amounts
              </h3>

              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {field.foodName}
                      </p>
                      <span className="text-xs text-muted-foreground">Unit: {field.servingUnit}</span>
                    </div>

                    <div className="w-32 shrink-0">
                      <input
                        {...register(`foods.${idx}.amount` as const, { valueAsNumber: true })}
                        type="number"
                        step="any"
                        min={0.01}
                        max={1500}
                        disabled={isPending}
                        className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-sm font-bold outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save Planned Meal"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditPlannedMealModal(props: Props) {
  if (!props.open || typeof document === "undefined") return null;

  return createPortal(
    <EditPlannedMealModalContent {...props} />,
    document.body
  );
}
