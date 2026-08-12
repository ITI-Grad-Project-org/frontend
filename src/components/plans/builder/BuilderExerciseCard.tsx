import { useDraggable, useDroppable } from "@dnd-kit/react";
import { Edit3, GripVertical, Trash2 } from "lucide-react";
import type { BuilderPlannedExercise } from "./builder-types";
import { getExerciseDragData } from "./builder-utils";

export function BuilderExerciseCard({
    exercise,
    dayId,
    onEdit,
    onDelete,
}: {
    exercise: BuilderPlannedExercise;
    dayId: string;
    onEdit: (exercise: BuilderPlannedExercise) => void;
    onDelete: (exercise: BuilderPlannedExercise) => void;
}) {
    const { ref: dragRef, isDragging } = useDraggable({
        id: exercise.id,
        data: getExerciseDragData(exercise, dayId),
    });
    const { ref: dropRef, isDropTarget } = useDroppable({
        id: exercise.id,
        data: getExerciseDragData(exercise, dayId),
    });

    return (
        <div
            ref={dropRef}
            className={`group flex items-start gap-2 rounded-2xl border bg-background px-2 py-2.5 shadow-sm transition ${isDragging
                ? "border-primary opacity-50"
                : isDropTarget
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
        >
            {/* Drag handle — only this element triggers the drag */}
            <button
                ref={dragRef}
                type="button"
                className="mt-0.5 shrink-0 cursor-grab touch-none rounded-lg p-1 text-muted-foreground/50 transition hover:text-muted-foreground active:cursor-grabbing"
                aria-label="Drag to reorder"
                tabIndex={-1}
            >
                <GripVertical className="size-4" />
            </button>

            {/* Position + content */}
            <button
                type="button"
                onClick={() => onEdit(exercise)}
                className="min-w-0 flex-1 text-left"
            >
                <p className="font-semibold text-foreground">
                    <span className="mr-1 text-xs font-bold text-muted-foreground">
                        #{exercise.position}
                    </span>
                    {exercise.exerciseName}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    {exercise.sets.length} set{exercise.sets.length === 1 ? "" : "s"} · {exercise.restSeconds}s rest
                    {exercise.coachNotes ? ` · ${exercise.coachNotes}` : ""}
                </p>
            </button>

            {/* Action buttons */}
            <div className="flex shrink-0 items-center gap-1">
                <button
                    type="button"
                    onClick={() => onEdit(exercise)}
                    className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label={`Edit ${exercise.exerciseName}`}
                >
                    <Edit3 className="size-3.5" />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(exercise)}
                    className="rounded-full p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove ${exercise.exerciseName}`}
                >
                    <Trash2 className="size-3.5" />
                </button>
            </div>
        </div>
    );
}