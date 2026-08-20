import { UsersRound } from "lucide-react";
import type { AnalyticsOverview } from "@/types/analytics";
import { cn } from "@/lib/utils";

const STATUS_META: { key: keyof RosterCounts; label: string; color: string }[] = [
  { key: "active", label: "Active", color: "var(--color-success)" },
  { key: "paused", label: "Paused", color: "var(--color-warn)" },
  { key: "invited", label: "Invited", color: "var(--color-info)" },
  { key: "requested", label: "Requested", color: "var(--color-violet)" },
  { key: "archived", label: "Archived", color: "var(--color-muted-foreground)" },
];

type RosterCounts = AnalyticsOverview["roster"];

const ATTENTION_BADGES: {
  key: "clientsAtRisk" | "checkinsAwaitingReview" | "programsEndingSoon";
  label: string;
  color: string;
  dot: string;
}[] = [
  {
    key: "clientsAtRisk",
    label: "Clients gone quiet",
    color: "var(--color-danger)",
    dot: "bg-danger",
  },
  {
    key: "checkinsAwaitingReview",
    label: "Check-ins awaiting you",
    color: "var(--color-warn)",
    dot: "bg-warn",
  },
  {
    key: "programsEndingSoon",
    label: "Programs ending soon",
    color: "var(--color-brand)",
    dot: "bg-brand",
  },
];

function formatMrr(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}

interface PracticeCardProps {
  roster: RosterCounts;
  attention: {
    clientsAtRisk: number;
    checkinsAwaitingReview: number;
    programsEndingSoon: number;
  };
  onShowAttention: () => void;
}

export function PracticeCard({ roster, attention, onShowAttention }: PracticeCardProps) {
  const total = STATUS_META.reduce((sum, meta) => sum + (roster[meta.key] as number), 0);
  const mrrEntries = Object.entries(roster.mrrByCurrency ?? {});

  return (
    <div className="flex h-full flex-col justify-between gap-5">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-6xl font-black tabular-nums font-display tracking-tight text-foreground">
            {total}
          </p>
          <p className="text-xs font-semibold text-muted-foreground">clients in your practice</p>
        </div>
        <span className="grid size-11 place-items-center rounded-2xl bg-chip-mint text-success">
          <UsersRound className="size-5" strokeWidth={2.25} />
        </span>
      </div>

      {/* Roster status bar — one bar = the whole roster */}
      <div>
        <div className="flex h-3 w-full gap-1 overflow-hidden rounded-full">
          {STATUS_META.map((meta) => {
            const count = roster[meta.key] as number;
            if (count === 0) return null;
            return (
              <div
                key={meta.key}
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(count / Math.max(1, total)) * 100}%`,
                  backgroundColor: meta.color,
                }}
                title={`${meta.label}: ${count}`}
              />
            );
          })}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1">
          {STATUS_META.map((meta) => (
            <span key={meta.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 rounded-full" style={{ backgroundColor: meta.color }} />
              <span className="font-semibold tabular-nums text-foreground">
                {roster[meta.key] as number}
              </span>
              {meta.label}
            </span>
          ))}
        </div>
      </div>

      {mrrEntries.length > 0 ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
          {mrrEntries.map(([currency, value]) => (
            <span key={currency} className="text-xs text-muted-foreground">
              <span className="font-black tabular-nums text-foreground">
                {formatMrr(value, currency)}
              </span>{" "}
              MRR / month
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No recurring revenue recorded for this window.</p>
      )}

      {/* Attention badge counts — tap to jump to the queue list */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Needs you now
        </p>
        {ATTENTION_BADGES.map((badge) => {
          const count = attention[badge.key];
          return (
            <button
              key={badge.key}
              type="button"
              onClick={onShowAttention}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition hover:translate-y-[-1px] cursor-pointer",
                count > 0
                  ? "border-border/70 bg-card hover:border-brand/40"
                  : "border-border/50 bg-muted/30 opacity-70",
              )}
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <span className={cn("size-2 rounded-full", badge.dot)} />
                {badge.label}
              </span>
              <span
                className="grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-xs font-black tabular-nums text-ink-foreground"
                style={{ backgroundColor: count > 0 ? badge.color : "var(--color-muted-foreground)" }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}