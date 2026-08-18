import { useNavigate } from "react-router";
import { CheckCircle2 } from "lucide-react";
import type { RosterReport } from "@/types/analytics";
import { adherenceColor } from "@/components/analytics/colors";
import { cn } from "@/lib/utils";

function rankColor(rank: number): string {
  if (rank === 1) return "bg-danger/10 text-danger";
  if (rank === 2) return "bg-warn/10 text-warn";
  if (rank === 3) return "bg-brand/10 text-brand";
  return "bg-muted text-muted-foreground";
}

interface RosterLeaderboardProps {
  report: RosterReport | null;
  loading: boolean;
  error: string;
  onRetry: () => void;
}

export function RosterLeaderboard({ report, loading, error, onRetry }: RosterLeaderboardProps) {
  const navigate = useNavigate();

  if (loading) {
    return <div className="h-72 animate-pulse rounded-3xl bg-muted/50" />;
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-border bg-card p-5">
        <p className="text-sm text-destructive">{error || "Roster report unavailable."}</p>
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

  const totalActive = report.summary.active;

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="text-xl font-black font-display tracking-tight text-foreground">
          Roster adherence
        </h2>
        <p className="text-sm text-muted-foreground">
          Every client, ranked worst-first — {totalActive} active. Ghost rows had nothing scheduled.
        </p>
      </div>

      {report.clients.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-border p-8 text-sm text-muted-foreground">
          No clients to rank yet.
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {report.clients.map((client, index) => {
            const hasSchedule = client.adherencePct != null;
            const pct = client.adherencePct ?? 0;
            return (
              <li key={client.membershipId}>
                <button
                  type="button"
                  onClick={() => void navigate(`/dashboard/clients/${client.membershipId}`)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card px-3 py-2.5 text-left transition hover:border-brand/40 hover:shadow-(--shadow-card) cursor-pointer"
                >
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full text-xs font-black tabular-nums",
                      rankColor(index + 1),
                    )}
                  >
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {client.clientName}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {client.completedSessions}/{client.scheduledSessions} sessions
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${hasSchedule ? pct : 0}%`,
                            backgroundColor: hasSchedule ? adherenceColor(pct) : "var(--color-muted)",
                          }}
                        />
                      </span>
                      {hasSchedule ? (
                        <span
                          className="shrink-0 text-xs font-bold tabular-nums"
                          style={{ color: adherenceColor(pct) }}
                        >
                          {Math.round(pct)}%
                        </span>
                      ) : (
                        <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                          <CheckCircle2 className="size-3.5" />
                          no schedule
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}