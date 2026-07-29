import ExerciseCard from "@/components/cards/ExerciseCard";
import ExerciseCardSkeleton from "@/components/skeletons/ExerciseCardSkeleton";
import { Plus, RefreshCw, Dumbbell } from "lucide-react";
import type { Exercise } from "@/types/exercise";

interface ExerciseGridProps {
    loading: boolean;
    error: string;
    exercises: Exercise[];
    hasActiveFilter: boolean;
    onRetry: () => void;
    onOpenAdd: () => void;
    onView: (exercise: Exercise) => void;
    onEdit: (exercise: Exercise) => void;
    onArchive: (exercise: Exercise) => void;
    onUnarchive?: (exercise: Exercise) => void;
}

export function ExerciseGrid({
    loading,
    error,
    exercises,
    hasActiveFilter,
    onRetry,
    onOpenAdd,
    onView,
    onEdit,
    onArchive,
    onUnarchive,
}: ExerciseGridProps) {
    if (loading) {
        return (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <ExerciseCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border border-destructive/25 rounded-3xl bg-destructive/5 text-center min-h-75">
                <p role="alert" className="text-lg font-medium text-destructive mb-2">
                    Error loading exercises
                </p>
                <p className="text-sm text-muted-foreground max-w-md mb-6">{error}</p>
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2.5 bg-ink text-ink-foreground font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
            </div>
        );
    }

    if (exercises.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-3xl bg-muted/20 min-h-75 animate-in fade-in">
                <Dumbbell className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.5} />
                <p className="text-lg font-medium text-muted-foreground">
                    {hasActiveFilter ? "No exercises match your filters" : "No exercises yet"}
                </p>
                <p className="text-sm text-muted-foreground/70">
                    {hasActiveFilter
                        ? "Try adjusting your search or category filter."
                        : "Start building your coaching library."}
                </p>
                {!hasActiveFilter && (
                    <button
                        onClick={onOpenAdd}
                        className="mt-2 flex items-center gap-2 px-4 py-2.5 bg-ink text-ink-foreground font-semibold rounded-xl hover:opacity-90 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Add first exercise
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 animate-in fade-in duration-200">
            {exercises.map((exercise) => (
                <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onClick={onView}
                    onEdit={onEdit}
                    onArchive={onArchive}
                    onUnarchive={onUnarchive}
                />
            ))}
        </div>
    );
}