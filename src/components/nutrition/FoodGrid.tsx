// src/components/nutrition/FoodGrid.tsx
import { FoodCard } from "./FoodCard";
import { Plus, RefreshCw, Apple } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import type { Food } from "@/types/nutrition";

interface FoodGridProps {
  loading: boolean;
  error: string;
  foods: Food[];
  hasActiveFilter: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onRetry: () => void;
  onOpenAdd: () => void;
  onView: (food: Food) => void;
  onEdit: (food: Food) => void;
  onArchive: (food: Food) => void;
  onUnarchive?: (food: Food) => void;
}

export function FoodGrid({
  loading,
  error,
  foods,
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
}: FoodGridProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-2xl border border-border/60 bg-card p-4 animate-pulse flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 flex-1">
              <div className="w-10 h-10 rounded-xl bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-3 w-28 bg-muted rounded" />
              </div>
            </div>
            <div className="h-10 w-64 bg-muted rounded-xl hidden sm:block" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-destructive/25 rounded-3xl bg-destructive/5 text-center min-h-75">
        <p role="alert" className="text-lg font-medium text-destructive mb-2">
          Error loading food library
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

  if (foods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-3xl bg-muted/20 min-h-75 animate-in fade-in p-6 text-center">
        <Apple className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.5} />
        <p className="text-lg font-medium text-muted-foreground">
          {hasActiveFilter ? "No food items match your filters" : "No food items in library"}
        </p>
        <p className="text-sm text-muted-foreground/70 max-w-sm">
          {hasActiveFilter
            ? "Try adjusting your search, serving unit, or dietary tag filter."
            : "Start adding reusable ingredients to your coach food library."}
        </p>
        {!hasActiveFilter && (
          <button
            onClick={onOpenAdd}
            className="mt-2 flex items-center gap-2 px-4 py-2.5 bg-brand text-brand-foreground font-semibold rounded-xl hover:opacity-90 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add first food item
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2.5 animate-in fade-in duration-200">
        {foods.map((food) => (
          <FoodCard
            key={food.id}
            food={food}
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

