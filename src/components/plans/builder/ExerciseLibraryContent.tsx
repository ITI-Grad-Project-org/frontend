import { useEffect } from "react";
import { Search, X } from "lucide-react";
import { useExercisesData } from "@/hooks/exercises/useExercisesData";
import type { ExerciseCategory, MuscleGroup } from "@/types/exercise";
import { ExerciseLibraryCard } from "./ExerciseLibraryCard";

export function ExerciseLibraryContent({ refreshVersion }: { refreshVersion: number }) {
    const {
        filteredExercises,
        loading: exercisesLoading,
        error: exercisesError,
        filters: exerciseFilters,
        handleFiltersChange: handleExerciseFiltersChange,
        actions: { handleRetry: refetchExercises },
    } = useExercisesData();

    useEffect(() => {
        if (refreshVersion > 0) void refetchExercises();
    }, [refreshVersion, refetchExercises]);

    return (
        <>
            {/* Search */}
            <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search exercises…"
                    value={exerciseFilters.search}
                    onChange={(e) => handleExerciseFiltersChange({ search: e.target.value })}
                    className="w-full rounded-2xl border border-border bg-background py-2 pl-8 pr-8 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
                />
                {exerciseFilters.search && (
                    <button
                        type="button"
                        onClick={() => handleExerciseFiltersChange({ search: "" })}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="size-3.5" />
                    </button>
                )}
            </div>

            {/* Category chips */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
                {(["strength", "cardio", "mobility", "plyometric", "core"] as ExerciseCategory[]).map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => handleExerciseFiltersChange({ category: exerciseFilters.category === cat ? "" : cat })}
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ${exerciseFilters.category === cat
                            ? "border-brand bg-brand/10 text-brand"
                            : "border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Muscle group select */}
            <div className="mt-2">
                <select
                    value={exerciseFilters.primaryMuscle}
                    onChange={(e) => handleExerciseFiltersChange({ primaryMuscle: e.target.value as MuscleGroup | "" })}
                    className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
                >
                    <option value="">All muscles</option>
                    {(["chest", "back", "shoulders", "biceps", "triceps", "forearms", "quads", "hamstrings", "glutes", "calves", "core", "full_body"] as MuscleGroup[]).map((m) => (
                        <option key={m} value={m}>{m.replace("_", " ")}</option>
                    ))}
                </select>
            </div>

            {/* Clear filters */}
            {(exerciseFilters.search || exerciseFilters.category || exerciseFilters.primaryMuscle) && (
                <button
                    type="button"
                    onClick={() => handleExerciseFiltersChange({ search: "", category: "", primaryMuscle: "" })}
                    className="mt-1.5 self-start text-[10px] font-semibold text-muted-foreground hover:text-foreground underline underline-offset-2 transition"
                >
                    Clear filters
                </button>
            )}

            <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
                {exercisesLoading ? (
                    <p className="rounded-2xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                        Loading exercises...
                    </p>
                ) : exercisesError ? (
                    <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-6 text-center text-sm text-destructive">
                        {exercisesError}
                    </p>
                ) : filteredExercises.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                        No exercises found.
                    </p>
                ) : (
                    filteredExercises.map((exercise) => (
                        <ExerciseLibraryCard key={exercise.id} exercise={exercise} />
                    ))
                )}
            </div>
        </>
    );
}