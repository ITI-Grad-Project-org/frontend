// src/components/nutrition/MealGrid.tsx
import { MealCard } from "./MealCard";
import { Plus, RefreshCw, Utensils } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import type { Meal } from "@/types/nutrition";

interface MealGridProps {
  loading: boolean;
  error: string;
  meals: Meal[];
  hasActiveFilter: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onRetry: () => void;
  onOpenAdd: () => void;
  onView: (meal: Meal) => void;
  onEdit: (meal: Meal) => void;
  onArchive: (meal: Meal) => void;
  onUnarchive?: (meal: Meal) => void;
}

export function MealGrid({
  loading,
  error,
  meals,
  hasActiveFilter,
  currentPage,
  totalPages,
  onPageChange,
  onRetry,
  onOpenAdd,
  onView,
  onEdit,
  onArchive,
  onUnarchive,
}: MealGridProps) {
  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-60 rounded-3xl border border-border/60 bg-card p-5 animate-pulse flex flex-col justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-border">
              <div className="h-10 bg-muted rounded-xl" />
              <div className="h-10 bg-muted rounded-xl" />
              <div className="h-10 bg-muted rounded-xl" />
              <div className="h-10 bg-muted rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-destructive/25 rounded-3xl bg-destructive/5 text-center min-h-75">
        <p role="alert" className="text-lg font-medium text-destructive mb-2">
          Error loading meal library
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

  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-3xl bg-muted/20 min-h-75 animate-in fade-in p-6 text-center">
        <Utensils className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.5} />
        <p className="text-lg font-medium text-muted-foreground">
          {hasActiveFilter ? "No meals match your filters" : "No meals in library yet"}
        </p>
        <p className="text-sm text-muted-foreground/70 max-w-sm">
          {hasActiveFilter
            ? "Try adjusting your search or dietary tag filter."
            : "Create reusable recipes combining foods from your food library."}
        </p>
        {!hasActiveFilter && (
          <button
            onClick={onOpenAdd}
            className="mt-2 flex items-center gap-2 px-4 py-2.5 bg-ink text-ink-foreground font-semibold rounded-xl hover:opacity-90 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create first meal recipe
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 animate-in fade-in duration-200">
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onView={onView}
            onEdit={onEdit}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
          />
        ))}
      </div>

      {currentPage != null && totalPages != null && totalPages > 1 && onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

