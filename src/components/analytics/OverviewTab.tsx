import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { useAnalyticsOverview } from "@/hooks/analytics/useAnalyticsOverview";
import { useAttentionQueue } from "@/hooks/analytics/useAttentionQueue";
import { useActivityFeed } from "@/hooks/analytics/useActivityFeed";
import { useAdherence } from "@/hooks/analytics/useAdherence";
import { usePendingMeasurementReviews } from "@/hooks/clients/useMeasurementReviews";
import { ATTENTION_ENDING_HORIZON_DAYS, ATTENTION_RISK_THRESHOLD_DAYS } from "@/types/analytics";

import { AnalyticsSkeleton } from "@/components/analytics/AnalyticsSkeleton";
import { AdherenceDial } from "@/components/analytics/AdherenceDial";
import { TrainingWeekStrip } from "@/components/analytics/TrainingWeekStrip";
import { PracticeCard } from "@/components/analytics/PracticeCard";
import { AttentionBand } from "@/components/analytics/AttentionBand";
import { ActivityTimeline } from "@/components/analytics/ActivityTimeline";

function scrollToAttention() {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById("attention-band")
    ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

function HeroCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="card-surface flex flex-col gap-4 p-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {eyebrow}
        </p>
        <h3 className="mt-0.5 text-lg font-black font-display tracking-tight text-foreground">
          {title}
        </h3>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

interface OverviewTabProps {
  from: string;
  to: string;
}

export function OverviewTab({ from, to }: OverviewTabProps) {
  const [riskThresholdDays, setRiskThresholdDays] = useState(ATTENTION_RISK_THRESHOLD_DAYS);
  const [endingHorizonDays, setEndingHorizonDays] = useState(ATTENTION_ENDING_HORIZON_DAYS);
  const location = useLocation();

  const overview = useAnalyticsOverview(from, to);
  const attention = useAttentionQueue(to, riskThresholdDays, endingHorizonDays);
  const activity = useActivityFeed(from, to);
  const adherence = useAdherence(from, to);
  const pendingReviews = usePendingMeasurementReviews({ limit: 100 });

  useEffect(() => {
    if (location.hash !== "#attention-band" || attention.loading) return;
    requestAnimationFrame(() => {
      document
        .getElementById("attention-band")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.hash, attention.loading]);

  const heroPending = overview.loading && !overview.overview;
  const heroError = overview.error && !overview.overview;

  return (
    <div className="flex flex-col gap-8">
      {heroPending ? (
        <AnalyticsSkeleton />
      ) : heroError ? (
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6">
          <p className="text-sm text-destructive">{overview.error}</p>
          <button
            type="button"
            onClick={overview.refetch}
            className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-ink-foreground transition hover:opacity-90 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : overview.overview ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <HeroCard eyebrow="Score" title="Session completion">
            <AdherenceDial
              pct={overview.overview.sessionAdherencePct}
              completed={adherence.summary.completedSessions}
              scheduled={adherence.summary.scheduledSessions}
            />
          </HeroCard>
          <HeroCard eyebrow="Pulse" title="This week">
            <TrainingWeekStrip week={overview.overview.thisWeek} />
          </HeroCard>
          <HeroCard eyebrow="Clients" title="Practice">
            <PracticeCard
              roster={overview.overview.roster}
              attention={{
                clientsAtRisk: overview.overview.clientsAtRisk,
                checkinsAwaitingReview:
                  pendingReviews.loading && pendingReviews.docs.length === 0
                    ? overview.overview.checkinsAwaitingReview
                    : pendingReviews.docs.length,
                programsEndingSoon: overview.overview.programsEndingSoon,
              }}
              onShowAttention={scrollToAttention}
            />
          </HeroCard>
        </div>
      ) : null}

      <AttentionBand
        queue={attention.queue}
        pendingReviews={pendingReviews.docs}
        loading={attention.loading}
        error={attention.error}
        onRetry={attention.refetch}
        riskThresholdDays={riskThresholdDays}
        endingHorizonDays={endingHorizonDays}
        onRiskThresholdDaysChange={setRiskThresholdDays}
        onEndingHorizonDaysChange={setEndingHorizonDays}
      />

      <div className="card-surface p-6">
        <ActivityTimeline
          events={activity.events}
          loading={activity.loading}
          error={activity.error}
          onRetry={activity.refetch}
        />
      </div>
    </div>
  );
}