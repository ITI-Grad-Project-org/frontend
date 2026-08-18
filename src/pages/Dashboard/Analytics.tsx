import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { BarChart3 } from "lucide-react";
import { addDays, formatDateLabel, getLocalDateInputValue } from "@/lib/dates";
import { useAnalyticsOverview } from "@/hooks/analytics/useAnalyticsOverview";
import { useAttentionQueue } from "@/hooks/analytics/useAttentionQueue";
import { useActivityFeed } from "@/hooks/analytics/useActivityFeed";
import { useRosterReport } from "@/hooks/analytics/useRosterReport";
import { useAdherence } from "@/hooks/analytics/useAdherence";
import { useProgramEffectiveness } from "@/hooks/analytics/useProgramEffectiveness";

import { WindowControl } from "@/components/analytics/WindowControl";
import { AnalyticsSkeleton } from "@/components/analytics/AnalyticsSkeleton";
import { AdherenceDial } from "@/components/analytics/AdherenceDial";
import { TrainingWeekStrip } from "@/components/analytics/TrainingWeekStrip";
import { PracticeCard } from "@/components/analytics/PracticeCard";
import { AttentionBand } from "@/components/analytics/AttentionBand";
import { RosterLeaderboard } from "@/components/analytics/RosterLeaderboard";
import { AdherencePanel } from "@/components/analytics/AdherencePanel";
import { ActivityTimeline } from "@/components/analytics/ActivityTimeline";
import { ProgramEffectiveness } from "@/components/analytics/ProgramEffectiveness";
import { ClientOutcomesPanel } from "@/components/analytics/ClientOutcomesPanel";

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

export default function Analytics() {
  const today = getLocalDateInputValue();
  const [from, setFrom] = useState(addDays(today, -(30 - 1)));
  const [to, setTo] = useState(today);

  const handleWindowChange = useCallback((nextFrom: string, nextTo: string) => {
    setFrom(nextFrom);
    setTo(nextTo);
  }, []);

  const overview = useAnalyticsOverview(from, to);
  const attention = useAttentionQueue(to);
  const activity = useActivityFeed(from, to);
  const roster = useRosterReport(from, to);
  const adherence = useAdherence(from, to);
  const effectiveness = useProgramEffectiveness();

  const heroPending = overview.loading && !overview.overview;
  const heroError = overview.error && !overview.overview;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-400">
      {/* Header + window control */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand">
            <BarChart3 className="size-3.5" />
            {formatDateLabel(from)} → {formatDateLabel(to)}
          </p>
          <h1 className="mt-1 text-4xl font-black font-display tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            The state of your practice at a glance — and the first thing you should handle today.
          </p>
        </div>
        <WindowControl from={from} to={to} onChange={handleWindowChange} />
      </div>

      {heroPending ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          {heroError ? (
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
            <>
              {/* Hero scoreboard */}
              <div className="grid gap-4 lg:grid-cols-3">
                <HeroCard eyebrow="Score" title="Session adherence">
                  <AdherenceDial
                    pct={overview.overview.sessionAdherencePct}
                    completed={adherence.summary.completedSessions}
                    scheduled={adherence.summary.scheduledSessions}
                  />
                </HeroCard>
                <HeroCard eyebrow="Pulse" title="This week">
                  <TrainingWeekStrip week={overview.overview.thisWeek} />
                </HeroCard>
                <HeroCard eyebrow="Roster" title="Practice">
                  <PracticeCard
                    roster={overview.overview.roster}
                    attention={{
                      clientsAtRisk: overview.overview.clientsAtRisk,
                      checkinsAwaitingReview: overview.overview.checkinsAwaitingReview,
                      programsEndingSoon: overview.overview.programsEndingSoon,
                    }}
                    onShowAttention={scrollToAttention}
                  />
                </HeroCard>
              </div>
            </>
          ) : null}

          {/* Attention queues */}
          <AttentionBand
            queue={attention.queue}
            loading={attention.loading}
            error={attention.error}
            onRetry={attention.refetch}
          />

          {/* Roster health row */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="card-surface p-6 lg:col-span-2">
              <RosterLeaderboard
                report={roster.report}
                loading={roster.loading}
                error={roster.error}
                onRetry={roster.refetch}
              />
            </div>
            <div className="card-surface p-6">
              <AdherencePanel
                summary={adherence.summary}
                loading={adherence.loading}
                error={adherence.error}
                onRetry={adherence.refetch}
              />
            </div>
          </div>

          {/* Activity + programs row */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="card-surface p-6">
              <ActivityTimeline
                events={activity.events}
                loading={activity.loading}
                error={activity.error}
                onRetry={activity.refetch}
              />
            </div>
            <div className="card-surface p-6 lg:col-span-2">
              <ProgramEffectiveness
                templates={effectiveness.templates}
                loading={effectiveness.loading}
                error={effectiveness.error}
                onRetry={effectiveness.refetch}
              />
            </div>
          </div>

          {/* Client outcomes drill-down */}
          <ClientOutcomesPanel from={from} to={to} />
        </>
      )}
    </div>
  );
}