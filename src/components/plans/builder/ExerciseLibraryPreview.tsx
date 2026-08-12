import { GripVertical } from "lucide-react";
import type { Exercise } from "@/types/exercise";
import { getExerciseSummary } from "./builder-utils";

export function ExerciseLibraryPreview({ exercise }: { exercise: Exercise }) {
    return (
        <div className="flex cursor-grabbing select-none items-center gap-2 rounded-2xl border border-primary bg-background shadow-lg">
            <div className="shrink-0 px-2 py-3 text-muted-foreground/50">
                <GripVertical className="size-4" />
            </div>
            <div className="min-w-0 flex-1 py-2.5 pr-3 text-sm">
                <p className="font-semibold text-foreground">{exercise.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                    {getExerciseSummary(exercise)}
                </p>
            </div>
        </div>
    );
}