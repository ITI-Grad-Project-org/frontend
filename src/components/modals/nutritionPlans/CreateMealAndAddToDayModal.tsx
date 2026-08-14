// src/components/modals/nutritionPlans/CreateMealAndAddToDayModal.tsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-toastify";
import { X, Plus, Trash2, Search } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { createLibraryMealAndAddToDay } from "@/services/nutritionPlans";
import { getFoods } from "@/services/nutrition";
import type { Food } from "@/types/nutrition";
import type { Meal } from "@/types/nutrition";
import type { NutritionPlanMeal, MealSlot } from "@/types/nutritionPlans";
import { MEAL_SLOTS } from "@/types/nutritionPlans";

type Props = {
  open: boolean;
  planId: string | null;
  dayId: string | null;
  dayLabel: string;
  defaultPosition: number;
  onClose: () => void;
  onCreated: (data: { meal: Meal; plannedMeal: NutritionPlanMeal }) => void;
};

interface FormItem {
  foodId: string;
  foodName: string;
  servingUnit: string;
  amount: number;
}

interface FormValues {
  name: string;
  description: string;
  prepNotes: string;
  items: FormItem[];
  slot: MealSlot;
  position: number;
  suggestedTime: string;
  coachNotes: string;
}

function CreateMealAndAddToDayModalContent({
  planId,
  dayId,
  dayLabel,
  defaultPosition,
  onClose,
  onCreated,
}: Omit<Props, "open">) {
  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [foodSearch, setFoodSearch] = useState("");
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({

    defaultValues: {
      name: "",
      description: "",
      prepNotes: "",
      items: [],
      slot: "breakfast",
      position: defaultPosition,
      suggestedTime: "08:30",
      coachNotes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        setLoadingFoods(true);
        const data = await getFoods();
        if (active) setAvailableFoods(data.filter((f) => f.isActive));
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to load foods library."));
      } finally {
        if (active) setLoadingFoods(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const isPending = isSubmitting || isSubmittingLocal;

  const handleAddFood = (food: Food) => {
    if (fields.some((f) => f.foodId === food.id)) {
      toast.info(`"${food.name}" is already in this meal.`);
      return;
    }
    append({
      foodId: food.id,
      foodName: food.name,
      servingUnit: food.servingUnit,
      amount: food.servingSize || 100,
    });
  };

  const onSubmit = async (values: FormValues) => {
    if (!planId || !dayId) return;
    if (!values.name.trim()) {
      toast.error("Meal name is required.");
      return;
    }
    if (values.items.length === 0) {
      toast.error("Add at least 1 food ingredient to the meal.");
      return;
    }

    setIsSubmittingLocal(true);
    try {
      const result = await createLibraryMealAndAddToDay(planId, dayId, {
        meal: {
          name: values.name.trim(),
          description: values.description?.trim() || null,
          prepNotes: values.prepNotes?.trim() || null,
          items: values.items.map((it) => ({
            foodId: it.foodId,
            amount: Number(it.amount),
          })),
        },
        prescription: {
          slot: values.slot,
          position: Number(values.position),
          suggestedTime: values.suggestedTime?.trim() || null,
          coachNotes: values.coachNotes?.trim() || null,
        },
      });

      toast.success(`Meal "${result.meal.name}" created and added to ${dayLabel}.`);
      onCreated(result);
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not create and add meal."));
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  const filteredFoods = availableFoods.filter((f) =>
    f.name.toLowerCase().includes(foodSearch.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => {
        if (!isPending) onClose();
      }}
    >
      <form
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl modal-card"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-6 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Create New Meal
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              New Library Meal & Prescription
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {dayLabel} · Saves meal to library and adds snapshot to this day.
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

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              1. Meal Metadata
            </h3>
            <div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Meal Name *
                </span>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="e.g. Chicken & Rice Bowl"
                  disabled={isPending}
                  className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-brand"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    Slot *
                  </span>
                  <select
                    {...register("slot")}
                    disabled={isPending}
                    className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-brand"
                  >
                    {MEAL_SLOTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    Position (1–10)
                  </span>
                  <input
                    {...register("position", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    max={10}
                    disabled={isPending}
                    className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-brand"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Food Ingredients Picker */}
          <div className="space-y-4 pt-4 border-t border-border/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              2. Recipe Ingredients ({fields.length})
            </h3>

            {/* Selected items list */}
            {fields.length > 0 ? (
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

                    <div className="flex items-center gap-2">
                      <input
                        {...register(`items.${idx}.amount` as const, { valueAsNumber: true })}
                        type="number"
                        step="any"
                        min={0.01}
                        max={1500}
                        disabled={isPending}
                        className="w-24 rounded-xl border border-border bg-background px-3 py-1.5 text-sm font-bold outline-none focus:border-brand"
                      />
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        disabled={isPending}
                        className="p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2 text-center border border-dashed rounded-2xl border-border">
                No foods added yet. Search and select foods below.
              </p>
            )}

            {/* Food Selector */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search foods library…"
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  className="w-full rounded-2xl border-2 border-border bg-card pl-10 pr-4 py-2.5 text-xs text-foreground outline-none focus:border-brand"
                />
              </div>

              <div className="max-h-40 overflow-y-auto rounded-2xl border border-border/80 bg-muted/20 p-2 space-y-1">
                {loadingFoods ? (
                  <p className="text-xs text-muted-foreground p-2">Loading foods…</p>
                ) : filteredFoods.length > 0 ? (
                  filteredFoods.slice(0, 15).map((food) => (
                    <div
                      key={food.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-background transition text-xs"
                    >
                      <div>
                        <span className="font-semibold text-foreground">{food.name}</span>
                        <span className="ml-2 text-muted-foreground">
                          ({food.calories} kcal / {food.servingSize}{food.servingUnit})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddFood(food)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-brand/10 text-brand hover:bg-brand/20 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground p-2">No matching foods found.</p>
                )}
              </div>
            </div>
          </div>
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
            {isPending ? "Creating & Adding…" : "Create & Add to Day"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateMealAndAddToDayModal(props: Props) {
  if (!props.open || typeof document === "undefined") return null;

  return createPortal(
    <CreateMealAndAddToDayModalContent {...props} />,
    document.body
  );
}
