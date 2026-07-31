// src/components/modals/AddDayMealModal.tsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { X, Utensils, Clock, FileText } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { addMealFromLibraryToDay } from "@/services/nutritionPlans";
import type { Meal } from "@/types/nutrition";
import type { NutritionPlanMeal, MealSlot } from "@/types/nutritionPlans";
import { MEAL_SLOTS } from "@/types/nutritionPlans";
import {
  addMealFromLibrarySchema,
  type AddMealFromLibraryFormData,
} from "@/schemas/nutritionPlans";

const fieldCls =
  "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand disabled:cursor-not-allowed disabled:bg-muted/50";
const fieldErrorCls = "border-destructive focus:border-destructive";
const errorMsgCls = "mt-1.5 text-xs text-destructive";

type Props = {
  open: boolean;
  planId: string | null;
  dayId: string | null;
  dayLabel: string;
  meal: Meal | null;
  defaultPosition: number;
  onClose: () => void;
  onAdded: (plannedMeal: NutritionPlanMeal) => void;
};

function AddDayMealModalContent({
  planId,
  dayId,
  dayLabel,
  meal,
  defaultPosition,
  onClose,
  onAdded,
}: Omit<Props, "open">) {
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMealFromLibraryFormData>({
    resolver: zodResolver(addMealFromLibrarySchema),
    defaultValues: {
      mealId: meal?.id || "",
      slot: "breakfast",
      position: defaultPosition,
      suggestedTime: "08:30",
      coachNotes: "",
      itemOverrides: [],
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "itemOverrides",
  });

  useEffect(() => {
    if (!meal) return;
    reset({
      mealId: meal.id,
      slot: "breakfast",
      position: defaultPosition,
      suggestedTime: "08:30",
      coachNotes: "",
      itemOverrides: (meal.ingredients || []).map((ing) => ({
        mealIngredientId: ing.id,
        foodName: ing.food?.name || "Food",
        servingUnit: ing.servingUnit || ing.food?.servingUnit || "g",
        amount: ing.amount,
      })),
    });
  }, [meal, defaultPosition, reset]);

  const isPending = isSubmitting || isSubmittingLocal;

  const onSubmit = async (values: AddMealFromLibraryFormData) => {
    if (!planId || !dayId || !meal) return;

    setIsSubmittingLocal(true);
    try {
      const plannedMeal = await addMealFromLibraryToDay(planId, dayId, {
        mealId: meal.id,
        slot: values.slot as MealSlot,
        position: Number(values.position),
        suggestedTime: values.suggestedTime?.trim() || null,
        coachNotes: values.coachNotes?.trim() || null,
        itemOverrides: (values.itemOverrides || []).map((item) => ({
          mealIngredientId: item.mealIngredientId,
          amount: Number(item.amount),
        })),
      });

      toast.success(`"${meal.name}" added to ${dayLabel}.`);
      onAdded(plannedMeal);
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to add meal to day."));
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
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
              Add meal to plan
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {meal?.name ?? "Meal"}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {dayLabel} · Configure prescription and amounts.
            </p>
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
          {/* Meal Details Box */}
          <div className="rounded-2xl border border-border bg-muted/20 p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{meal?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {meal?.ingredientCount || meal?.ingredients?.length || 0} ingredients · {meal?.totals?.calories || 0} kcal
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <Utensils className="w-3.5 h-3.5" />
              <span>{meal?.totals?.proteinG || 0}g P</span>
              <span>{meal?.totals?.carbsG || 0}g C</span>
              <span>{meal?.totals?.fatG || 0}g F</span>
            </div>
          </div>

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
                  className={`${fieldCls} ${errors.position ? fieldErrorCls : ""}`}
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
                  className={`${fieldCls} ${errors.suggestedTime ? fieldErrorCls : ""}`}
                />
              </label>
              {errors.suggestedTime ? (
                <p className={errorMsgCls}>{errors.suggestedTime.message}</p>
              ) : (
                <p className="mt-1 text-[11px] text-muted-foreground">Select meal target time (HH:mm)</p>
              )}
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
                  placeholder="e.g. Eat 30 minutes before workout"
                  disabled={isPending}
                  className={`${fieldCls} resize-y ${errors.coachNotes ? fieldErrorCls : ""}`}
                />
              </label>
              {errors.coachNotes && <p className={errorMsgCls}>{errors.coachNotes.message}</p>}
            </div>
          </div>

          {/* Ingredient Overrides */}
          {fields.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ingredient Portion Overrides
              </h3>
              <p className="text-xs text-muted-foreground">
                Adjust portion amounts for this specific day snapshot (0 omits the ingredient).
              </p>

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
                        {...register(`itemOverrides.${idx}.amount` as const, { valueAsNumber: true })}
                        type="number"
                        step="any"
                        min={0}
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
            {isPending ? "Adding…" : "Add to Day"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AddDayMealModal(props: Props) {
  if (!props.open || typeof document === "undefined") return null;

  const resetKey = `${props.dayId ?? ""}::${props.meal?.id ?? ""}::${props.defaultPosition}`;

  return createPortal(
    <AddDayMealModalContent key={resetKey} {...props} />,
    document.body
  );
}
