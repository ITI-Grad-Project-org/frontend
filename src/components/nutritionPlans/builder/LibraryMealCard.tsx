import { useDraggable } from "@dnd-kit/react";
import { GripVertical } from "lucide-react";
import type { Meal } from "@/types/nutrition";

export function LibraryMealCard({ meal }: { meal: Meal }) {
  const { ref: dragRef, isDragging } = useDraggable({
    id: `library-meal-${meal.id}`,
    data: { kind: "library-meal" as const, meal },
  });

  return (
    <div
      className={`group flex items-center gap-2 rounded-2xl border bg-card p-3 shadow-xs transition hover:border-success/40 ${isDragging ? "border-brand bg-brand/5 opacity-40" : "border-border"
        }`}
    >
      <button
        ref={dragRef}
        type="button"
        className="shrink-0 cursor-grab touch-none p-1 text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
        aria-label={`Drag ${meal.name}`}
      >
        <GripVertical className="size-4" />
      </button>

      <div className="min-w-0 flex-1 select-none">
        <p className="font-semibold text-xs text-foreground truncate">{meal.name}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {meal.ingredientCount || meal.ingredients?.length || 0} items · {meal.totals?.calories || 0} kcal
        </p>
      </div>
    </div>
  );
}