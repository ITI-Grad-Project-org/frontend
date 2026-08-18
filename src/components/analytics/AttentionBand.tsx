import { useNavigate } from "react-router";
import {
  CalendarClock,
  ClipboardCheck,
  UserX,
} from "lucide-react";
import type { AttentionQueue } from "@/types/analytics";
import { cn } from "@/lib/utils";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatHours(hours: number | undefined): string {
  if (hours == null) return "—";
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${(hours / 24).toFixed(hours % 24 >= 12 ? 1 : 0)}d`;
}

function formatDays(days: number | undefined | null): string {
  if (days == null) return "—";
  return `${days}d`;
}

interface AttentionBandProps {
  queue: AttentionQueue | null | undefined;
  loading: boolean;
  error: string;
  onRetry: () => void;
}

export function AttentionBand({ queue, loading, error, onRetry }: AttentionBandProps) {
  const navigate = useNavigate();

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

  const columns = [
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
        meta: [
          `${formatDays(row.daysSilent)} silent`,
          `last active ${formatDate(row.lastActivityOn)}`,
        ],
      })),
      empty: "No client has gone quiet. Everyone still shows signs of life.",
    },
    {
      id: "checkins",
      title: "Check-ins awaiting you",
      hint: "Submitted and unanswered",
      color: "var(--color-warn)",
      chip: "bg-warn/10 text-warn",
      icon: ClipboardCheck,
      rows: queue.checkinsAwaitingReview.map((row) => ({
        id: row.membershipId,
        to: `/dashboard/clients/${row.membershipId}`,
        title: row.clientName,
        meta: [`submitted ${formatDate(row.submittedAt)}`, `waiting ${formatHours(row.hoursWaiting)}`],
      })),
      empty: "No unanswered check-ins right now.",
    },
    {
      id: "programs",
      title: "Programs ending soon",
      hint: "Within the next 14 days",
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
      <div className="mb-4">
        <h2 className="text-xl font-black font-display tracking-tight text-foreground">
          Needs you now
        </h2>
        <p className="text-sm text-muted-foreground">
          The three queues that decay without a coach — most urgent first.
        </p>
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
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => void navigate(row.to)}
                        className="flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-muted/50 cursor-pointer"
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
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}