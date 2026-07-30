// src/components/nutritionPlans/NutritionPlansHeader.tsx
import { Plus } from "lucide-react";

interface NutritionPlansHeaderProps {
  onCreateClick: () => void;
  disabled?: boolean;
}

export function NutritionPlansHeader({
  onCreateClick,
  disabled = false,
}: NutritionPlansHeaderProps) {
  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div className="max-w-2xl">
        <h1 className="mt-2 text-4xl font-black text-foreground">Client nutrition plans</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create, manage, and filter nutrition plan drafts and daily macro targets for your clients.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreateClick}
        disabled={disabled}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        Create nutrition plan draft
      </button>
    </div>
  );
}
