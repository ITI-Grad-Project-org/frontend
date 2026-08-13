import { Link } from "react-router";
import { Activity, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { NutritionDayLog } from "@/types/nutritionPlans";
import { LogStatusBadge } from "@/components/plans/logs/LogStatusBadge";
import { NutritionAdherenceBadge } from "./NutritionAdherenceBadge";

function fmt(isoStr: string | null | undefined): string {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

function fmtDateTime(isoStr: string | null | undefined): string {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(d);
}

function MacroBar({ label, actual, target, color }: { label: string; actual: number; target: number; color: string }) {
  const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-muted-foreground">
        <span className="truncate">{label}</span>
        <span className="shrink-0 text-foreground">{actual}g / {target > 0 ? `${target}g` : "—"}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface Props {
  planId: string;
  logs: NutritionDayLog[];
  filteredLogs: NutritionDayLog[];
  statusFilter: string;
  onFilterChange: (s: string) => void;
  expandedLogId: string | null;
  onToggleExpand: (id: string) => void;
}

export function NutritionLogsTable({ planId, logs, filteredLogs, statusFilter, onFilterChange, expandedLogId, onToggleExpand }: Props) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Nutrition Logs</h2>
          <p className="text-xs text-muted-foreground">
            Showing {filteredLogs.length} of {logs.length} logged days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Activity className="size-8 mb-2 opacity-50" />
          <p className="text-base font-semibold">No nutrition logs found</p>
          <p className="text-xs">No logs match the current filter, or the client hasn't started logging yet.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const targets = log.effectiveTargets;
            const actual = log.actualTotals;

            return (
              <div key={log.id} className="rounded-2xl border border-border bg-background transition hover:border-brand/30">
                {/* Row header */}
                <div
                  className="flex flex-wrap items-center justify-between gap-4 p-4 cursor-pointer select-none"
                  onClick={() => onToggleExpand(log.id)}
                >
                  <div className="flex items-center gap-3">
                    <LogStatusBadge status={log.status} />
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {fmt(log.scheduledDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.startedAt ? `Started ${fmtDateTime(log.startedAt)}` : "Not started"}
                        {log.completedAt ? ` · Completed ${fmtDateTime(log.completedAt)}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-xs text-muted-foreground">
                    <div className="text-center">
                      <span className="block font-medium">Adherence</span>
                      <NutritionAdherenceBadge outcome={log.adherenceOutcome} />
                    </div>
                    <div className="text-center">
                      <span className="block font-medium">Calories</span>
                      <span className="font-bold text-warn">{actual?.calories ?? "—"}</span>
                      <span className="text-muted-foreground"> / {targets?.calories ?? "—"}</span>
                    </div>
                    <div className="text-center">
                      <span className="block font-medium">Foods Logged</span>
                      <span className="font-bold text-foreground">{log.actualFoodCount ?? "—"}</span>
                    </div>
                    <Link
                      to={`/dashboard/nutrition-plans/${planId}/days/${log.nutritionPlanDayId}/log`}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-brand transition"
                      title="View full day log"
                    >
                      <ExternalLink className="size-4" />
                    </Link>
                    <button
                      type="button"
                      className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-border/60 bg-muted/20 p-5 space-y-4">
                    {log.clientNotes && (
                      <div className="rounded-xl border border-info/20 bg-info/5 p-3 text-xs text-info">
                        <span className="font-bold">Client Notes: </span>{log.clientNotes}
                      </div>
                    )}

                    {/* Macro progress bars */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="min-w-0 rounded-2xl border border-border bg-card p-4 space-y-2.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Actual vs Target</p>
                        <MacroBar label="Protein" actual={actual?.proteinG ?? 0} target={targets?.proteinG ?? 0} color="bg-info" />
                        <MacroBar label="Carbs" actual={actual?.carbsG ?? 0} target={targets?.carbsG ?? 0} color="bg-warn" />
                        <MacroBar label="Fat" actual={actual?.fatG ?? 0} target={targets?.fatG ?? 0} color="bg-danger" />
                        {(actual?.fiberG != null || (targets?.fiberG ?? 0) > 0) && (
                          <MacroBar label="Fiber" actual={actual?.fiberG ?? 0} target={targets?.fiberG ?? 0} color="bg-success" />
                        )}
                      </div>

                      {/* Meal outcomes */}
                      {log.mealOutcomes && log.mealOutcomes.length > 0 && (
                        <div className="min-w-0 rounded-2xl border border-border bg-card p-4 space-y-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Meal Outcomes</p>
                          {log.mealOutcomes.map((mo) => (
                            <div key={mo.loggedMealId} className="flex items-center justify-between gap-2 text-xs min-w-0">
                              <span className="min-w-0 truncate text-foreground font-medium">{mo.mealName}</span>
                              <NutritionAdherenceBadge outcome={mo.outcome} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Water */}
                    {log.waterMlConsumed != null && (
                      <p className="text-xs text-muted-foreground">
                        💧 Water consumed: <span className="font-bold text-foreground">{log.waterMlConsumed} ml</span>
                        {targets?.waterMl ? ` / ${targets.waterMl} ml target` : ""}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}