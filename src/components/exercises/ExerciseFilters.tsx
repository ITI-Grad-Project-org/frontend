import { Search, X } from "lucide-react";

export const EXERCISE_CATEGORIES = [
    { value: "", label: "All" },
    { value: "strength", label: "Strength" },
    { value: "cardio", label: "Cardio" },
    { value: "mobility", label: "Mobility" },
    { value: "plyometric", label: "Plyometric" },
    { value: "core", label: "Core" },
];

interface ExerciseFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    categoryFilter: string;
    onCategoryChange: (value: string) => void;
}

export function ExerciseFilters({
    searchQuery,
    onSearchChange,
    categoryFilter,
    onCategoryChange,
}: ExerciseFiltersProps) {
    return (
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 shadow-(--shadow-card) sm:p-5">
            {/* Search Bar — inset field within the panel */}
            <div
                role="search"
                className="flex items-center gap-2.5 rounded-2xl border border-border/60 bg-background px-4 py-3 transition-colors focus-within:border-brand/40"
            >
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search exercises…"
                    aria-label="Search exercises"
                    className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => onSearchChange("")}
                        className="shrink-0 rounded-lg p-0.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="h-px bg-border" />

            {/* Category Chips */}
            <div
                role="group"
                aria-label="Filter by category"
                className="flex flex-wrap gap-2"
            >
                {EXERCISE_CATEGORIES.map((cat) => {
                    const isActive = categoryFilter === cat.value;
                    return (
                        <button
                            key={cat.value}
                            type="button"
                            onClick={() => onCategoryChange(cat.value)}
                            aria-pressed={isActive}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all cursor-pointer active:scale-95 ${isActive
                                ? "bg-ink text-ink-foreground shadow-sm"
                                : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                        >
                            {cat.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}