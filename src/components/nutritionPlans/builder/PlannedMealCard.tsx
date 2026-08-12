import { useDraggable, useDroppable } from "@dnd-kit/react";
import { Clock, Edit3, GripVertical, Trash2 } from "lucide-react";
import type { NutritionPlanMeal } from "@/types/nutritionPlans";
import { formatTo12Hour } from "./builder-utils";

export function PlannedMealCard({
  meal,
  dayId,
  onEdit,
  onDelete,
}: {
  meal: NutritionPlanMeal;
  dayId: string;
  onEdit: (meal: NutritionPlanMeal) => void;
  onDelete: (meal: NutritionPlanMeal) => void;
}) {
  const { ref: dragRef, isDragging } = useDraggable({
    id: `planned-meal-${meal.id}`,
    data: { kind: "planned-meal" as const, meal, dayId },
  });
  const { ref: dropRef, isDropTarget } = useDroppable({
    id: `planned-meal-target-${meal.id}`,
    data: { kind: "planned-meal" as const, meal, dayId },
  });

  return (
    <div
      ref={dropRef}
      className={`flex flex-col gap-2 rounded-2xl border p-3 bg-card shadow-xs transition ${isDragging
        ? "border-brand opacity-50"
        : isDropTarget
          ? "border-brand bg-brand/5"
          : "border-border/80 hover:border-border"
        }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            ref={dragRef}
            type="button"
            className="cursor-grab touch-none p-1 text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="size-3.5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                {meal.slot || "Meal"}
              </span>
              {meal.suggestedTime && (
                <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatTo12Hour(meal.suggestedTime)}
                </span>
              )}
            </div>
            <h4 className="mt-1 text-xs font-bold text-foreground truncate">{meal.mealName}</h4>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(meal)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            aria-label={`Edit ${meal.mealName}`}
          >
            <Edit3 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(meal)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
            aria-label={`Delete ${meal.mealName}`}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Foods summary */}
      {meal.foods && meal.foods.length > 0 && (
        <div className="mt-1 space-y-1 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
          {meal.foods.map((food) => (
            <div key={food.id} className="flex items-center justify-between gap-1">
              <span className="truncate">• {food.foodName}</span>
              <span className="font-semibold text-foreground/90 shrink-0">
                {food.amount}{food.servingUnit}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Meal totals */}
      {meal.totals && (
        <div className="mt-1 pt-1.5 flex items-center justify-between text-[11px] font-bold text-muted-foreground border-t border-border/30">
          <span className="text-brand">{meal.totals.calories} kcal</span>
          <span>P: {meal.totals.proteinG}g</span>
          <span>C: {meal.totals.carbsG}g</span>
          <span>F: {meal.totals.fatG}g</span>
        </div>
      )}

      {meal.coachNotes && (
        <p className="mt-1 text-[11px] italic text-muted-foreground/80 bg-muted/30 p-1.5 rounded-lg">
          "{meal.coachNotes}"
        </p>
      )}
    </div>
  );
}