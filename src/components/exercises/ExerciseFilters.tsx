import { Search, X, RotateCcw } from "lucide-react";
import type { ExercisesFilters } from "@/hooks/useExercisesData";
import { formatFilterLabel } from "@/hooks/usePlansData";

// ─── Option lists ─────────────────────────────────────────────────────────────

export const EXERCISE_CATEGORIES = [
    { value: "", label: "All categories" },
    { value: "strength", label: "Strength" },
    { value: "cardio", label: "Cardio" },
    { value: "mobility", label: "Mobility" },
    { value: "plyometric", label: "Plyometric" },
    { value: "core", label: "Core" },
] as const;

export const MUSCLE_GROUPS = [
    { value: "", label: "All muscles" },
    { value: "chest", label: "Chest" },
    { value: "back", label: "Back" },
    { value: "shoulders", label: "Shoulders" },
    { value: "biceps", label: "Biceps" },
    { value: "triceps", label: "Triceps" },
    { value: "forearms", label: "Forearms" },
    { value: "quads", label: "Quads" },
    { value: "hamstrings", label: "Hamstrings" },
    { value: "glutes", label: "Glutes" },
    { value: "calves", label: "Calves" },
    { value: "core", label: "Core" },
    { value: "full_body", label: "Full Body" },
] as const;

// ─── Shared select style ──────────────────────────────────────────────────────

const selectCls =
    "h-10 w-full rounded-2xl border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-brand/40 focus:outline-none cursor-pointer appearance-none pr-8";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ExerciseFiltersProps {
    filters: ExercisesFilters;
    onFiltersChange: (next: Partial<ExercisesFilters>) => void;
    onResetFilters: () => void;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    totalExercises: number;
    filteredCount: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExerciseFilters({
    filters,
    onFiltersChange,
    onResetFilters,
    onRefresh,
    isRefreshing,
    totalExercises,
    filteredCount,
}: ExerciseFiltersProps) {
    const hasActiveFilter =
        !!filters.search ||
        !!filters.category ||
        !!filters.primaryMuscle ||
        filters.includeInactive ||
        filters.showArchivedOnly;

    return (
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 shadow-(--shadow-card) sm:p-5">
            {/* ── Row 1: search + refresh ── */}
            <div className="flex items-center gap-3">
                <div
                    role="search"
                    className="flex flex-1 items-center gap-2.5 rounded-2xl border border-border/60 bg-background px-4 py-3 transition-colors focus-within:border-brand/40"
                >
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => onFiltersChange({ search: e.target.value })}
                        placeholder="Search exercises…"
                        aria-label="Search exercises"
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    {filters.search && (
                        <button
                            type="button"
                            onClick={() => onFiltersChange({ search: "" })}
                            className="shrink-0 cursor-pointer rounded-lg p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {onRefresh && (
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        aria-label="Refresh exercises"
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                    >
                        <RotateCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    </button>
                )}
            </div>

            <div className="h-px bg-border" />

            {/* ── Row 2: dropdowns + archived checkbox ── */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Category */}
                <div className="relative min-w-[160px] flex-1">
                    <select
                        id="exercise-category-filter"
                        value={filters.category}
                        onChange={(e) =>
                            onFiltersChange({ category: e.target.value as ExercisesFilters["category"] })
                        }
                        aria-label="Filter by category"
                        className={selectCls}
                    >
                        {EXERCISE_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ▾
                    </span>
                </div>

                {/* Primary muscle */}
                <div className="relative min-w-[160px] flex-1">
                    <select
                        id="exercise-muscle-filter"
                        value={filters.primaryMuscle}
                        onChange={(e) =>
                            onFiltersChange({ primaryMuscle: e.target.value as ExercisesFilters["primaryMuscle"] })
                        }
                        aria-label="Filter by primary muscle"
                        className={selectCls}
                    >
                        {MUSCLE_GROUPS.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ▾
                    </span>
                </div>

                {/* Include archived (includeInactive) */}
                <label
                    htmlFor="exercise-include-inactive"
                    className="flex cursor-pointer select-none items-center gap-2.5 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                    <input
                        id="exercise-include-inactive"
                        type="checkbox"
                        checked={filters.includeInactive}
                        onChange={(e) => onFiltersChange({ includeInactive: e.target.checked })}
                        className="h-4 w-4 cursor-pointer accent-brand"
                    />
                    Include archived exercises
                </label>

                {/* Show archived only */}
                <label
                    htmlFor="exercise-archived-only"
                    className="flex cursor-pointer select-none items-center gap-2.5 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                    <input
                        id="exercise-archived-only"
                        type="checkbox"
                        checked={filters.showArchivedOnly}
                        onChange={(e) => onFiltersChange({ showArchivedOnly: e.target.checked })}
                        className="h-4 w-4 cursor-pointer accent-brand"
                    />
                    Show archived only
                </label>

                {/* Result count */}
                <span className="ml-auto shrink-0 text-xs font-semibold text-muted-foreground">
                    {hasActiveFilter
                        ? `${filteredCount} of ${totalExercises}`
                        : `${totalExercises} exercises`}
                </span>

                {/* Reset */}
                {hasActiveFilter && (
                    <button
                        type="button"
                        onClick={onResetFilters}
                        className="shrink-0 rounded-2xl border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        Clear filters
                    </button>
                )}
            </div>

        </div>
    );
}