import { Search } from "lucide-react";

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
        <div className="flex flex-col gap-3 mb-8">
            {/* Search Bar */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-border bg-card shadow-sm">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search exercises…"
                    className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange("")}
                        className="text-lg leading-none text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        aria-label="Clear search"
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap gap-2">
                {EXERCISE_CATEGORIES.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => onCategoryChange(cat.value)}
                        className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${categoryFilter === cat.value
                                ? "bg-ink text-ink-foreground shadow-sm"
                                : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
}