// src/components/nutritionPlans/NutritionPlansList.tsx
import type { NutritionPlanSummary } from "@/types/nutritionPlans";
import { NutritionPlanCard } from "./NutritionPlanCard";
import { ListShell } from "@/components/cards/ListShell";
import { AlertCircle, RotateCcw, SearchX } from "lucide-react";

interface NutritionPlansListProps {
  plans: NutritionPlanSummary[];
  clientNameMap: Map<string, string>;
  loading: boolean;
  error?: string | null;
  hasActiveFilters?: boolean;
  onEditDraft: (plan: NutritionPlanSummary) => void;
  onPublish: (plan: NutritionPlanSummary) => void;
  onReschedule: (plan: NutritionPlanSummary) => void;
  onCancel: (plan: NutritionPlanSummary) => void;
  onArchive: (plan: NutritionPlanSummary) => void;
  onUnarchive: (plan: NutritionPlanSummary) => void;
  onRetry?: () => void;
}

const SKELETON_COUNT = 4;

export function NutritionPlansList({
  plans,
  clientNameMap,
  loading,
  error,
  hasActiveFilters,
  onEditDraft,
  onPublish,
  onReschedule,
  onCancel,
  onArchive,
  onUnarchive,
  onRetry,
}: NutritionPlansListProps) {
  if (loading) {
    return (
      <ListShell>
        <div
          className="grid gap-4 xl:grid-cols-2"
          role="status"
          aria-busy="true"
          aria-live="polite"
        >
          <span className="sr-only">Loading nutrition plans…</span>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      </ListShell>
    );
  }

  if (error) {
    return (
      <ListShell>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <p className="text-sm font-medium text-destructive">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-1 inline-flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
            >
              <RotateCcw className="h-4 w-4" />
              Try again
            </button>
          )}
        </div>
      </ListShell>
    );
  }

  if (plans.length === 0) {
    return (
      <ListShell>
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <SearchX className="h-6 w-6 text-muted-foreground/70" />
          <p className="text-lg font-medium text-muted-foreground">
            {hasActiveFilters ? "No nutrition plans match your filters" : "No nutrition plans yet"}
          </p>
          <p className="text-sm text-muted-foreground/70">
            {hasActiveFilters
              ? "Try clearing search or adjusting the filters."
              : "Nutrition plans you create for your clients will show up here."}
          </p>
        </div>
      </ListShell>
    );
  }

  return (
    <ListShell>
      <div className="grid gap-4 xl:grid-cols-2">
        {plans.map((plan) => (
          <NutritionPlanCard
            key={plan.id}
            plan={plan}
            clientName={clientNameMap.get(plan.membershipId) ?? "Unknown client"}
            onEditDraft={onEditDraft}
            onPublish={onPublish}
            onReschedule={onReschedule}
            onCancel={onCancel}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
          />
        ))}
      </div>
    </ListShell>
  );
}
