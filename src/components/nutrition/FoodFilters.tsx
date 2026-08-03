// src/components/nutrition/FoodFilters.tsx
import { Search, X, RotateCcw } from "lucide-react";
import type { FoodsFilters } from "@/hooks/useFoodsData";
import { SERVING_UNITS, DIETARY_TAGS } from "@/types/nutrition";

const selectCls =
  "h-10 w-full rounded-2xl border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-brand/40 focus:outline-none cursor-pointer appearance-none pr-8";

interface FoodFiltersProps {
  filters: FoodsFilters;
  onFiltersChange: (next: Partial<FoodsFilters>) => void;
  onResetFilters: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  totalFoods: number;
  filteredCount: number;
}

export function FoodFilters({
  filters,
  onFiltersChange,
  onResetFilters,
  onRefresh,
  isRefreshing,
  totalFoods,
  filteredCount,
}: FoodFiltersProps) {
  const hasActiveFilter =
    !!filters.search ||
    !!filters.servingUnit ||
    !!filters.dietaryTag ||
    !!filters.allergen ||
    filters.includeInactive ||
    filters.showArchivedOnly;

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 shadow-(--shadow-card) sm:p-5">
      {/* Search + Refresh Row */}
      <div className="flex items-center gap-3">
        <div
          role="search"
          className="flex flex-1 items-center gap-2.5 rounded-2xl border border-border/60 bg-background px-4 py-2.5 transition-colors focus-within:border-brand/40"
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            placeholder="Search food items by name or brand…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFiltersChange({ search: "" })}
              className="shrink-0 rounded-lg p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
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
            aria-label="Refresh foods"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Serving Unit */}
        <div className="relative min-w-37.5 flex-1">
          <select
            value={filters.servingUnit}
            onChange={(e) =>
              onFiltersChange({ servingUnit: e.target.value as FoodsFilters["servingUnit"] })
            }
            className={selectCls}
          >
            <option value="">All units</option>
            {SERVING_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            ▾
          </span>
        </div>

        {/* Dietary Tag */}
        <div className="relative min-w-37.5 flex-1">
          <select
            value={filters.dietaryTag}
            onChange={(e) =>
              onFiltersChange({ dietaryTag: e.target.value as FoodsFilters["dietaryTag"] })
            }
            className={selectCls}
          >
            <option value="">All dietary tags</option>
            {DIETARY_TAGS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            ▾
          </span>
        </div>

        {/* Allergen */}
        <div className="relative min-w-37.5 flex-1">
          <input
            type="text"
            value={filters.allergen}
            onChange={(e) => onFiltersChange({ allergen: e.target.value })}
            placeholder="Filter allergen…"
            className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-brand/40"
          />
        </div>

        {/* Include archived */}
        <label className="flex cursor-pointer select-none items-center gap-2 rounded-2xl border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          <input
            type="checkbox"
            checked={filters.includeInactive}
            onChange={(e) => onFiltersChange({ includeInactive: e.target.checked })}
            className="h-4 w-4 accent-brand cursor-pointer"
          />
          Include archived foods
        </label>

        {/* Show archived only */}
        <label className="flex cursor-pointer select-none items-center gap-2 rounded-2xl border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          <input
            type="checkbox"
            checked={filters.showArchivedOnly}
            onChange={(e) => onFiltersChange({ showArchivedOnly: e.target.checked })}
            className="h-4 w-4 accent-brand cursor-pointer"
          />
          Show archived only
        </label>

        {/* Counter */}
        <span className="ml-auto shrink-0 text-xs font-semibold text-muted-foreground">
          {hasActiveFilter
            ? `${filteredCount} of ${totalFoods}`
            : `${totalFoods} food items`}
        </span>

        {/* Reset */}
        {hasActiveFilter && (
          <button
            type="button"
            onClick={onResetFilters}
            className="shrink-0 rounded-2xl border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
