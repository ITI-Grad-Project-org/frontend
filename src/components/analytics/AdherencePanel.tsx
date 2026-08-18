import type { AdherenceSummary } from "@/types/analytics";
import { adherenceColor } from "@/components/analytics/colors";

const SEGMENTS: {
  key: "completedSessions" | "partialSessions" | "skippedSessions" | "inProgressSessions";
  label: string;
  color: string;
}[] = [
  { key: "completedSessions", label: "Completed", color: "var(--color-success)" },
  { key: "partialSessions", label: "Partial", color: "var(--color-warn)" },
  { key: "skippedSessions", label: "Skipped", color: "var(--color-danger)" },
  { key: "inProgressSessions", label: "In progress", color: "var(--color-info)" },
];

interface AdherencePanelProps {
  summary: AdherenceSummary;
  loading: boolean;
  error: string;
  onRetry: () => void;
}

export function AdherencePanel({ summary, loading, error, onRetry }: AdherencePanelProps) {
  if (loading) {
    return <div className="h-72 animate-pulse rounded-3xl bg-muted/50" />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-border bg-card p-5">
        <p className="text-sm text-destructive">{error}</p>
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

  const scheduled = summary.scheduledSessions;
  const accounted =
    summary.completedSessions +
    summary.partialSessions +
    summary.skippedSessions +
    summary.inProgressSessions;
  const missed = Math.max(0, scheduled - accounted);
  const hasSchedule = scheduled > 0;

  const pct = hasSchedule ? summary.sessionCompletionPct : null;

  return (
    <div className="flex h-full flex-col gap-5">
      <div>
        <h2 className="text-xl font-black font-display tracking-tight text-foreground">
          Against the prescription
        </h2>
        <p className="text-sm text-muted-foreground">
          Logged sessions vs scheduled — days never opened still count against a client.
        </p>
      </div>

      <div className="flex items-baseline gap-2">
        <span
          className="text-6xl font-black tabular-nums font-display tracking-tight"
          style={{ color: adherenceColor(pct) }}
        >
          {hasSchedule && pct != null ? Math.round(pct) : "—"}
          {hasSchedule && pct != null ? <span className="text-2xl font-bold text-muted-foreground">%</span> : null}
        </span>
        <span className="text-xs font-semibold text-muted-foreground">
          of {scheduled} scheduled session{scheduled === 1 ? "" : "s"}
        </span>
      </div>

      {/* Session funnel */}
      <div>
        <div className="flex h-3 w-full gap-1 overflow-hidden rounded-full">
          {SEGMENTS.map((segment) => {
            const count = summary[segment.key];
            if (count === 0) return null;
            return (
              <div
                key={segment.key}
                className="h-full rounded-full"
                style={{
                  width: `${(count / Math.max(1, scheduled)) * 100}%`,
                  backgroundColor: segment.color,
                }}
                title={`${segment.label}: ${count}`}
              />
            );
          })}
          {missed > 0 && (
            <div
              className="h-full rounded-full bg-muted"
              style={{ width: `${(missed / Math.max(1, scheduled)) * 100}%` }}
              title={`Never started: ${missed}`}
            />
          )}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1">
          {SEGMENTS.map((segment) => (
            <span key={segment.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="font-semibold tabular-nums text-foreground">{summary[segment.key]}</span>
              {segment.label}
            </span>
          ))}
          {missed > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-muted" />
              <span className="font-semibold tabular-nums text-foreground">{missed}</span>
              Never started
            </span>
          )}
        </div>
      </div>

      {/* Volume adherence */}
      <div className="mt-auto rounded-2xl border border-border/60 bg-muted/30 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Volume adherence
          </p>
          <p className="text-lg font-black tabular-nums text-foreground">
            {summary.volumeAdherencePct != null ? (
              <>
                {Math.round(summary.volumeAdherencePct)}%
              </>
            ) : (
              "—"
            )}
          </p>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Actual reps × weight vs the prescription stored on each logged set. Sets prescribed by
          RPE or %1RM have no absolute target and are excluded — read this next to{" "}
          <span className="font-semibold text-foreground">{summary.comparableSets} comparable sets</span>
          {summary.comparableSets > 0 && summary.volumeAdherencePct == null
            ? " (targets not yet comparable)"
            : summary.comparableSets === 0
              ? " (nothing comparable in this window yet)"
              : ""}
          .
        </p>
      </div>
    </div>
  );
}