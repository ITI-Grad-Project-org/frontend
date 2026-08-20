import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  Clock,
  Dumbbell,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
  ThumbsDown,
  UtensilsCrossed,
} from "lucide-react";
import { AIPlanFlowModal } from "@/components/modals/ai/AIPlanFlowModal";
import { useAISuggestionsData } from "@/hooks/ai/useAISuggestionsData";
import { getApiErrorMessage } from "@/lib/api";
import { getPlanSuggestion } from "@/services/ai";
import type { ClientProgramTree } from "@/types/plans";
import type { NutritionPlanTree } from "@/types/nutritionPlans";
import type {
  AIPlanSuggestionDetail,
  AIPlanSuggestionKind,
  AIPlanSuggestionStatus,
  AIPlanSuggestionSummary,
} from "@/types/ai";

const kindOptions: { value: AIPlanSuggestionKind | "all"; label: string }[] = [
  { value: "all", label: "All kinds" },
  { value: "training", label: "Training" },
  { value: "nutrition", label: "Nutrition" },
];

const statusOptions: { value: AIPlanSuggestionStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending (generating)" },
  { value: "ready", label: "Ready to review" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "invalid", label: "Invalid" },
  { value: "failed", label: "Failed" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const statusStyles: Record<AIPlanSuggestionStatus, { className: string; label: string }> = {
  pending: { className: "bg-info/12 text-info", label: "Generating" },
  ready: { className: "bg-success/12 text-success", label: "Ready" },
  accepted: { className: "bg-success/12 text-success", label: "Accepted" },
  declined: { className: "bg-muted text-muted-foreground", label: "Declined" },
  invalid: { className: "bg-danger/12 text-danger", label: "Invalid" },
  failed: { className: "bg-danger/12 text-danger", label: "Failed" },
};

function SuggestionCard({
  suggestion,
  clientName,
  isOpening,
  onReview,
  onOpenCreated,
}: {
  suggestion: AIPlanSuggestionSummary;
  clientName: string;
  isOpening: boolean;
  onReview: (suggestion: AIPlanSuggestionSummary) => void;
  onOpenCreated: (suggestion: AIPlanSuggestionSummary) => void;
}) {
  const Icon = suggestion.kind === "training" ? Dumbbell : UtensilsCrossed;
  const status = statusStyles[suggestion.status];
  const createdPlanId =
    suggestion.kind === "training" ? suggestion.createdProgramId : suggestion.createdPlanId;

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-(--shadow-card)">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
              suggestion.kind === "training" ? "bg-brand/12 text-brand" : "bg-violet/12 text-violet"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {suggestion.kind === "training" ? "Training" : "Nutrition"}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>
            {suggestion.status === "pending" ? <Clock className="h-3 w-3 animate-pulse" /> : null}
            {status.label}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{formatDate(suggestion.createdAt)}</span>
      </div>

      <div className="mt-3">
        <p className="text-base font-bold text-foreground">{clientName}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatLabel(suggestion.constraints.goal ?? "general health")} ·{" "}
          {suggestion.constraints.durationWeeks} week{suggestion.constraints.durationWeeks === 1 ? "" : "s"}
          {suggestion.constraints.daysPerWeek ? ` · ${suggestion.constraints.daysPerWeek} days/week` : ""}
        </p>
      </div>

      {(suggestion.warningCounts.error > 0 || suggestion.warningCounts.warning > 0) && (
        <p className="mt-2 text-xs text-warn">
          {suggestion.warningCounts.error} issue{suggestion.warningCounts.error === 1 ? "" : "s"},{" "}
          {suggestion.warningCounts.warning} warning{suggestion.warningCounts.warning === 1 ? "" : "s"}
        </p>
      )}

      {suggestion.status === "declined" && suggestion.declineReason ? (
        <p className="mt-2 flex items-start gap-1.5 rounded-2xl bg-muted/60 p-3 text-xs text-muted-foreground">
          <ThumbsDown className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {suggestion.declineReason}
        </p>
      ) : null}

      {suggestion.error ? (
        <p className="mt-2 flex items-start gap-1.5 rounded-2xl bg-danger/10 p-3 text-xs text-danger">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {suggestion.error}
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-end gap-2">
        {suggestion.status === "ready" ? (
          <button
            type="button"
            onClick={() => onReview(suggestion)}
            disabled={isOpening}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {isOpening ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Review
          </button>
        ) : null}
        {suggestion.status === "accepted" && createdPlanId ? (
          <button
            type="button"
            onClick={() => onOpenCreated(suggestion)}
            className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <ExternalLink className="h-4 w-4" />
            Open plan
          </button>
        ) : null}
        {suggestion.status === "pending" ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Still generating…
          </p>
        ) : null}
      </div>
    </div>
  );
}

const fieldCls =
  "rounded-2xl border-2 border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand";

function AISuggestions() {
  const navigate = useNavigate();
  const {
    clients,
    suggestions,
    isLoading,
    loadError,
    filters,
    handleFiltersChange,
    clientNameMap,
    refreshSuggestions,
  } = useAISuggestionsData();

  const [reviewDetail, setReviewDetail] = useState<AIPlanSuggestionDetail | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const handleReview = async (suggestion: AIPlanSuggestionSummary) => {
    setOpeningId(suggestion.id);
    try {
      const detail = await getPlanSuggestion(suggestion.id);
      setReviewDetail(detail);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "This suggestion could not be loaded."));
    } finally {
      setOpeningId(null);
    }
  };

  const handleOpenCreated = (suggestion: AIPlanSuggestionSummary) => {
    const targetId = suggestion.kind === "training" ? suggestion.createdProgramId : suggestion.createdPlanId;
    if (!targetId) {
      toast.error("The plan could not be located.");
      return;
    }
    navigate(
      suggestion.kind === "training"
        ? `/dashboard/plans/${targetId}`
        : `/dashboard/nutrition-plans/${targetId}`,
      {
        state: { clientName: clientNameMap.get(suggestion.membershipId) ?? "Unknown client" },
      },
    );
  };

  const handleCreated = async (created: ClientProgramTree | NutritionPlanTree) => {
    const isTraining = "programType" in created && created.programType === "client";
    navigate(isTraining ? `/dashboard/plans/${created.id}` : `/dashboard/nutrition-plans/${created.id}`, {
      state: { clientName: clientNameMap.get(created.membershipId) ?? "Unknown client" },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-2xl">
          <h1 className="mt-2 text-4xl font-black text-foreground">AI plan suggestions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything the AI has generated for your clients, whether it's still cooking, ready to
            review, or already decided.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void refreshSuggestions()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          className={fieldCls}
          value={filters.kind}
          onChange={(e) => handleFiltersChange({ kind: e.target.value as AIPlanSuggestionKind | "all" })}
        >
          {kindOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className={fieldCls}
          value={filters.status}
          onChange={(e) => handleFiltersChange({ status: e.target.value as AIPlanSuggestionStatus | "all" })}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-brand" />
          Loading suggestions…
        </div>
      ) : loadError ? (
        <div className="rounded-3xl border border-danger/20 bg-danger/5 p-10 text-center text-sm text-danger">
          {loadError}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No suggestions match these filters. Generate a plan with AI from the plans page and it will
          show up here.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              clientName={clientNameMap.get(suggestion.membershipId) ?? "Unknown client"}
              isOpening={openingId === suggestion.id}
              onReview={(s) => void handleReview(s)}
              onOpenCreated={handleOpenCreated}
            />
          ))}
        </div>
      )}

      <AIPlanFlowModal
        open={reviewDetail !== null}
        clients={clients}
        defaultKind={reviewDetail?.kind ?? "training"}
        initialDetail={reviewDetail ?? undefined}
        onClose={() => {
          setReviewDetail(null);
          void refreshSuggestions();
        }}
        onCreated={handleCreated}
      />
    </div>
  );
}

export default AISuggestions;