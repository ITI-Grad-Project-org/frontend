import { useDraggable } from "@dnd-kit/react";
import { GripVertical } from "lucide-react";
import type { Exercise } from "@/types/exercise";
import { getExerciseSummary } from "./builder-utils";

export function ExerciseLibraryCard({ exercise }: { exercise: Exercise }) {
    const { ref: dragRef, isDragging } = useDraggable({
        id: exercise.id,
        data: exercise,
    });

    return (
        <div
            className={`flex items-center gap-2 rounded-2xl border bg-background shadow-sm transition ${isDragging
                ? "border-primary bg-primary/5 opacity-40"
                : "border-border hover:border-foreground/20 hover:bg-muted/40"
                }`}
        >
            {/* Drag handle */}
            <button
                ref={dragRef}
                type="button"
                className="shrink-0 cursor-grab touch-none rounded-l-2xl px-2 py-3 text-muted-foreground/50 transition hover:text-muted-foreground active:cursor-grabbing"
                aria-label={`Drag ${exercise.name}`}
                tabIndex={-1}
            >
                <GripVertical className="size-4" />
            </button>

            {/* Content — not part of the drag sensor */}
            <div className="min-w-0 flex-1 select-none py-2.5 pr-3">
                <p className="font-semibold text-foreground">{exercise.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                    {getExerciseSummary(exercise)}
                </p>
            </div>
        </div>
    );
}