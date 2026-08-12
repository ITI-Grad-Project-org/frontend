// src/components/modals/nutritionPlans/CreateNutritionPlanModal.tsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Flame, Target } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api";
import type { ClientConnection } from "@/types/client";
import { createNutritionPlanDraft } from "@/services/nutritionPlans";
import type { NutritionPlanSummary } from "@/types/nutritionPlans";
import {
  createNutritionPlanSchema,
  defaultCreateNutritionPlanValues,
  getLocalDateInputValue,
  nutritionGoalOptions,
  type CreateNutritionPlanFormData,
  type CreateNutritionPlanParsedData,
} from "@/schemas/nutritionPlans";

type Props = {
  open: boolean;
  clients: ClientConnection[];
  onClose: () => void;
  onCreated: (draft: NutritionPlanSummary) => void | Promise<void>;
  selectedClientId?: string | null;
};

const fieldCls =
  "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

function formatClientLabel(connection: ClientConnection) {
  const client = connection.client;
  const name = `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Unknown Client";
  return `${name} · ${client.email}`;
}

function CreateNutritionPlanModalContent({
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
  } = useForm<CreateNutritionPlanFormData, unknown, CreateNutritionPlanParsedData>({
    resolver: zodResolver(createNutritionPlanSchema),
    defaultValues: defaultCreateNutritionPlanValues,
  });

  useEffect(() => {
    reset({
      ...defaultCreateNutritionPlanValues,
      startDate: getLocalDateInputValue(),
      membershipId: selectedClientId ?? clients[0]?.id ?? "",
    });
  }, [clients, reset, selectedClientId]);

  const handleClose = () => {
    onClose();
  };

  const onSubmit = async (values: CreateNutritionPlanParsedData) => {
    setIsSubmittingLocal(true);

    try {
      const draft = await createNutritionPlanDraft({
        membershipId: values.membershipId,
        name: values.name.trim(),
        description: values.description?.trim() || null,
        goal: values.goal || null,
        durationWeeks: Number(values.durationWeeks),
        startDate: values.startDate,
        targetCalories: values.targetCalories,
        targetProteinG: values.targetProteinG,
        targetCarbsG: values.targetCarbsG,
        targetFatG: values.targetFatG,
        targetFiberG: values.targetFiberG,
        targetWaterMl: values.targetWaterMl,
      });

      toast.success("Nutrition plan draft created successfully.");
      await onCreated(draft);
      handleClose();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "We could not create this nutrition plan draft. Please try again.",
        ),
      );
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl bg-background shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Create nutrition plan draft</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Create a dated nutrition plan draft with target macros for an active client.
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

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Client */}
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

            {/* Plan name */}
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Plan name *</span>
              <input
                {...register("name")}
                placeholder="Ahmed's Fat-Loss Plan"
                className={fieldCls}
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </label>

            {/* Description */}
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Description / Notes</span>
              <textarea
                {...register("description")}
                placeholder="Two-week introductory nutrition plan for steady fat loss."
                rows={3}
                className={`${fieldCls} min-h-24 resize-y`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
              )}
            </label>

            {/* Goal */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Goal</span>
              <select {...register("goal")} className={fieldCls}>
                {nutritionGoalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.goal && <p className="mt-1 text-xs text-destructive">{errors.goal.message}</p>}
            </label>

            {/* Duration weeks */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Duration (weeks) *</span>
              <input
                {...register("durationWeeks")}
                type="number"
                min="1"
                max="52"
                placeholder="4"
                className={fieldCls}
              />
              {errors.durationWeeks && (
                <p className="mt-1 text-xs text-destructive">{errors.durationWeeks.message}</p>
              )}
            </label>

            {/* Start date */}
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Start date *</span>
              <input
                {...register("startDate")}
                type="date"
                min={getLocalDateInputValue()}
                className={fieldCls}
              />
              {errors.startDate && <p className="mt-1 text-xs text-destructive">{errors.startDate.message}</p>}
            </label>
          </div>

          {/* Daily Nutrient & Calorie Targets Header */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-bold text-foreground">Daily Nutritional Targets (Optional)</h3>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Define daily caloric and macronutrient targets for this plan. You can update or clear them later.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Calories */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Calories (800 – 6000 kcal)</span>
                <div className="relative flex items-center">
                  <Flame className="absolute left-3 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("targetCalories")}
                    type="number"
                    placeholder="2200"
                    className={`${fieldCls} pl-9`}
                  />
                </div>
                {errors.targetCalories && (
                  <p className="mt-1 text-xs text-destructive">{errors.targetCalories.message}</p>
                )}
              </label>

              {/* Protein */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Protein (1 – 350 g)</span>
                <input
                  {...register("targetProteinG")}
                  type="number"
                  placeholder="170"
                  className={fieldCls}
                />
                {errors.targetProteinG && (
                  <p className="mt-1 text-xs text-destructive">{errors.targetProteinG.message}</p>
                )}
              </label>

              {/* Carbs */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Carbs (0 – 800 g)</span>
                <input
                  {...register("targetCarbsG")}
                  type="number"
                  placeholder="230"
                  className={fieldCls}
                />
                {errors.targetCarbsG && (
                  <p className="mt-1 text-xs text-destructive">{errors.targetCarbsG.message}</p>
                )}
              </label>

              {/* Fat */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Fat (1 – 200 g)</span>
                <input
                  {...register("targetFatG")}
                  type="number"
                  placeholder="65"
                  className={fieldCls}
                />
                {errors.targetFatG && (
                  <p className="mt-1 text-xs text-destructive">{errors.targetFatG.message}</p>
                )}
              </label>

              {/* Fiber */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Fiber (0 – 100 g)</span>
                <input
                  {...register("targetFiberG")}
                  type="number"
                  placeholder="30"
                  className={fieldCls}
                />
                {errors.targetFiberG && (
                  <p className="mt-1 text-xs text-destructive">{errors.targetFiberG.message}</p>
                )}
              </label>

              {/* Water */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Water (250 – 6000 ml)</span>
                <input
                  {...register("targetWaterMl")}
                  type="number"
                  placeholder="3000"
                  className={fieldCls}
                />
                {errors.targetWaterMl && (
                  <p className="mt-1 text-xs text-destructive">{errors.targetWaterMl.message}</p>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
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

export function CreateNutritionPlanModal(props: Props) {
  if (!props.open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <CreateNutritionPlanModalContent {...props} />,
    document.body,
  );
}
