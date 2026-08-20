import { useState } from "react";
import { useNavigate } from "react-router";
import { CalendarClock, ClipboardCheck, UserX, type LucideIcon } from "lucide-react";
import type { AttentionQueue } from "@/types/analytics";
import {
  ATTENTION_ENDING_HORIZON_DAYS,
  ATTENTION_RISK_THRESHOLD_DAYS,
} from "@/types/analytics";
import type { PendingMeasurementReview } from "@/types/client";
import MeasurementsReviewModal from "@/components/modals/clients/MeasurementsReviewModal";
import { cn } from "@/lib/utils";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDays(days: number | undefined | null): string {
  if (days == null) return "—";
  return `${days}d`;
}

function daysSince(dateStr: string | undefined | null): number {
  if (!dateStr) return 0;
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return 0;
  return Math.max(0, Math.round((Date.now() - d.getTime()) / 86_400_000));
}

const RISK_MIN = 1;
const RISK_MAX = 30;
const HORIZON_MIN = 1;
const HORIZON_MAX = 60;

interface AttentionRowMeta {
  label: string;
  pct: number;
}

interface AttentionRow {
  id: string;
  to: string;
  title: string;
  meta: Array<string | AttentionRowMeta>;
  onOpen?: () => void;
  action?: { label: string; onClick: () => void };
}

function ThresholdControls({
  riskThresholdDays,
  endingHorizonDays,
  onRiskChange,
  onHorizonChange,
}: {
  riskThresholdDays: number;
  endingHorizonDays: number;
  onRiskChange: (next: number) => void;
  onHorizonChange: (next: number) => void;
}) {
  const [riskDraft, setRiskDraft] = useState(riskThresholdDays);
  const [horizonDraft, setHorizonDraft] = useState(endingHorizonDays);

  const risk = riskDraft;
  const horizon = horizonDraft;

  const atDefaults =
    riskDraft === ATTENTION_RISK_THRESHOLD_DAYS &&
    horizonDraft === ATTENTION_ENDING_HORIZON_DAYS;

  const commitRisk = () => {
    if (risk !== riskThresholdDays) onRiskChange(risk);
  };
  const commitHorizon = () => {
    if (horizon !== endingHorizonDays) onHorizonChange(horizon);
  };

  const reset = () => {
    setRiskDraft(ATTENTION_RISK_THRESHOLD_DAYS);
    setHorizonDraft(ATTENTION_ENDING_HORIZON_DAYS);
    onRiskChange(ATTENTION_RISK_THRESHOLD_DAYS);
    onHorizonChange(ATTENTION_ENDING_HORIZON_DAYS);
  };

  const sliderCls =
    "h-1.5 w-40 cursor-pointer accent-brand";

  const valueBadge =
    "min-w-[4.5rem] rounded-md border border-border bg-muted/40 px-2 py-1 text-center text-xs font-bold tabular-nums text-foreground";

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Attention thresholds
      </span>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <label className="flex flex-col gap-1.5 text-[11px] font-semibold text-muted-foreground">
          Gone quiet after
          <span className="flex items-center gap-2.5">
            <input
              type="range"
              min={RISK_MIN}
              max={RISK_MAX}
              step={1}
              value={riskDraft}
              onChange={(e) => setRiskDraft(Number(e.target.value))}
              onMouseUp={commitRisk}
              onTouchEnd={commitRisk}
              onKeyUp={commitRisk}
              onBlur={commitRisk}
              className={sliderCls}
              aria-label="Days of silence before an active client is listed"
            />
            <span className={valueBadge}>{risk} days</span>
          </span>
        </label>
        <label className="flex flex-col gap-1.5 text-[11px] font-semibold text-muted-foreground">
          Programs ending within
          <span className="flex items-center gap-2.5">
            <input
              type="range"
              min={HORIZON_MIN}
              max={HORIZON_MAX}
              step={1}
              value={horizonDraft}
              onChange={(e) => setHorizonDraft(Number(e.target.value))}
              onMouseUp={commitHorizon}
              onTouchEnd={commitHorizon}
              onKeyUp={commitHorizon}
              onBlur={commitHorizon}
              className={sliderCls}
              aria-label="Days ahead to report programs that are ending"
            />
            <span className={valueBadge}>{horizon} days</span>
          </span>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={atDefaults}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-muted/40 px-3 text-xs font-semibold text-muted-foreground transition hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

interface AttentionBandProps {
  queue: AttentionQueue | null | undefined;
  pendingReviews: PendingMeasurementReview[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  riskThresholdDays: number;
  endingHorizonDays: number;
  onRiskThresholdDaysChange: (next: number) => void;
  onEndingHorizonDaysChange: (next: number) => void;
}

export function AttentionBand({
  queue,
  pendingReviews,
  loading,
  error,
  onRetry,
  riskThresholdDays,
  endingHorizonDays,
  onRiskThresholdDaysChange,
  onEndingHorizonDaysChange,
}: AttentionBandProps) {
  const navigate = useNavigate();
  const [reviewTarget, setReviewTarget] = useState<PendingMeasurementReview | null>(null);

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-3xl bg-muted/50" />
        ))}
      </div>
    );
  }

  if (error || !queue) {
    return (
      <div className="flex items-center justify-between rounded-3xl border border-border bg-card p-5">
        <p className="text-sm text-destructive">{error || "Attention queue unavailable."}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-ink px-3.5 py-2 text-sm font-semibold text-ink-foreground transition hover:opacity-90 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const columns: Array<{
    id: string;
    title: string;
    hint: string;
    color: string;
    chip: string;
    icon: LucideIcon;
    rows: AttentionRow[];
    empty: string;
  }> = [
    {
      id: "at-risk",
      title: "Gone quiet",
      hint: "No activity past the silence threshold",
      color: "var(--color-danger)",
      chip: "bg-danger/10 text-danger",
      icon: UserX,
      rows: queue.atRisk.map((row) => ({
        id: row.membershipId,
        to: `/dashboard/clients/${row.membershipId}`,
        title: row.clientName,
meta: row.neverActive
          ? [`no activity for ${formatDays(row.daysSinceActivity)}`]
          : [
            `${formatDays(row.daysSinceActivity)} silent`,
            `last active ${formatDate(row.lastActivityOn)}`,
          ],
      })),
      empty: "No client has gone quiet. Everyone still shows signs of life.",
    },
    {
      id: "checkins",
      title: "Measurements awaiting review",
      hint: "Client measurements that need your review",
      color: "var(--color-warn)",
      chip: "bg-warn/10 text-warn",
      icon: ClipboardCheck,
      rows: pendingReviews.map((row) => {
        const fullName = `${row.client.firstName} ${row.client.lastName}`.trim() || "Unknown client";
        return {
          id: row.id,
          to: `/dashboard/clients/${row.client.id}`,
          title: fullName,
          meta: [`awaiting review for ${formatDays(daysSince(row.measuredAt))}`],
          onOpen: () => setReviewTarget(row),
          action: {
            label: "Review",
            onClick: () => setReviewTarget(row),
          },
        };
      }),
      empty: "No measurements awaiting review.",
    },
    {
      id: "programs",
      title: "Programs ending soon",
      hint: `Within the next ${endingHorizonDays} days`,
      color: "var(--color-brand)",
      chip: "bg-brand/10 text-brand",
      icon: CalendarClock,
      rows: queue.programsEndingSoon.map((row) => ({
        id: row.programId,
        to: `/dashboard/plans/${row.programId}`,
        title: row.programName,
        meta: [
          row.clientName,
          `ends in ${formatDays(row.daysRemaining)}`,
          { label: `${Math.round(row.completionPct)}% complete`, pct: row.completionPct },
        ],
      })),
      empty: "No programmes run out inside the horizon.",
    },
  ];

  return (
    <section id="attention-band" className="scroll-mt-6">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-black font-display tracking-tight text-foreground">
            Needs you now
          </h2>
          <p className="text-sm text-muted-foreground">
            The three queues that decay without a coach — most urgent first.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ThresholdControls
            riskThresholdDays={riskThresholdDays}
            endingHorizonDays={endingHorizonDays}
            onRiskChange={onRiskThresholdDaysChange}
            onHorizonChange={onEndingHorizonDaysChange}
          />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <div
              key={column.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-(--shadow-card)"
            >
              <div
                className="flex items-center justify-between gap-2 border-b border-border/50 px-4 py-3"
                style={{ borderLeftColor: column.color, borderLeftWidth: 3 }}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("grid size-8 place-items-center rounded-xl", column.chip)}>
                    <Icon className="size-4" strokeWidth={2.25} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{column.title}</p>
                    <p className="text-[11px] text-muted-foreground">{column.hint}</p>
                  </div>
                </div>
                <span
                  className="grid size-6 place-items-center rounded-full text-xs font-black tabular-nums text-ink-foreground"
                  style={{ backgroundColor: column.color }}
                >
                  {column.rows.length}
                </span>
              </div>

              {column.rows.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">{column.empty}</p>
              ) : (
                <ul className="divide-y divide-border/50">
                  {column.rows.map((row) => (
                    <li key={row.id} className="flex items-stretch">
                      <button
                        type="button"
                        onClick={row.onOpen ?? (() => void navigate(row.to))}
                        className="flex min-w-0 flex-1 flex-col gap-1 px-4 py-3 text-left transition hover:bg-muted/50 cursor-pointer"
                      >
                        <span className="truncate text-sm font-semibold text-foreground">
                          {row.title}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          {row.meta.map((m, i) =>
                            typeof m === "string" ? (
                              <span key={i} className="truncate">
                                {m}
                              </span>
                            ) : (
                              <span key={i} className="flex items-center gap-1.5">
                                <span className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
                                  <span
                                    className="block h-full rounded-full"
                                    style={{
                                      width: `${Math.min(100, Math.max(0, m.pct))}%`,
                                      backgroundColor: column.color,
                                    }}
                                  />
                                </span>
                                {m.label}
                              </span>
                            ),
                          )}
                        </span>
                      </button>
                      {row.action && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            row.action!.onClick();
                          }}
                          className="m-2 inline-flex shrink-0 items-center gap-1.5 self-center rounded-lg bg-brand px-3 py-2 text-xs font-bold text-brand-foreground transition hover:opacity-90 cursor-pointer"
                        >
                          <ClipboardCheck className="h-3.5 w-3.5" strokeWidth={2.25} />
                          {row.action.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {reviewTarget && (
        <MeasurementsReviewModal
          measurement={reviewTarget}
          clientName={`${reviewTarget.client.firstName} ${reviewTarget.client.lastName}`.trim()}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </section>
  );
}