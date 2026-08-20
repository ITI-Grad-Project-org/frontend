// src/components/nutritionPlans/NutritionPlansHeader.tsx
import { ListChecks, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { SpecularButton } from "@/components/ui/specular-button/SpecularButton";

interface NutritionPlansHeaderProps {
  onCreateClick: () => void;
  onAICreateClick: () => void;
  onAIUpgradeClick: () => void;
  aiEnabled: boolean;
  aiLoading?: boolean;
  disabled?: boolean;
}

export function NutritionPlansHeader({
  onCreateClick,
  onAICreateClick,
  onAIUpgradeClick,
  aiEnabled,
  aiLoading = false,
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

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/dashboard/ai-suggestions"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          <ListChecks className="h-4 w-4" />
          AI suggestions
        </Link>

        <SpecularButton
          size="md"
          radius={18}
          disabled={disabled || aiLoading}
          onClick={aiEnabled ? onAICreateClick : onAIUpgradeClick}
          speed={0.45}
          intensity={1.9}
          thickness={3.5}
          shineSize={14}
          lineColor="#ad5fff"
          baseColor="#000000"
          textColor="var(--color-ink-foreground)"
          background="var(--color-ink)"
        >
          <span className="inline-flex items-center gap-2">
            <Sparkles className="specular-icon h-4 w-4 text-[#ad5fff]" />
            {aiEnabled ? "Create with AI" : "Unlock AI"}
          </span>
        </SpecularButton>

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
    </div>
  );
}
