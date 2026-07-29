import { Activity, ChevronDown, ChevronUp } from "lucide-react";
import type { WorkoutLog } from "@/types/plans";
import { LogStatusBadge } from "./LogStatusBadge";
import { OutcomeBadge } from "./OutcomeBadge";

function formatDate(isoStr: string | null | undefined): string {
  if (!isoStr) return "—";
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return isoStr;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(isoStr: string | null | undefined): string {
  if (!isoStr) return "—";
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return isoStr;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

interface PlanLogsTableProps {
  logs: WorkoutLog[];
  filteredLogs: WorkoutLog[];
  statusFilter: string;
  onFilterChange: (status: string) => void;
  expandedLogId: string | null;
  onToggleExpand: (logId: string) => void;
}

export function PlanLogsTable({
  logs,
  filteredLogs,
  statusFilter,
  onFilterChange,
  expandedLogId,
  onToggleExpand,
}: PlanLogsTableProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Workout Logs</h2>
          <p className="text-xs text-muted-foreground">
            Showing {filteredLogs.length} of {logs.length} logged sessions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Filter status:</span>
          <select
            value={statusFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="skipped">Skipped</option>
            <option value="in_progress">In Progress</option>
          </select>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Activity className="size-8 mb-2 opacity-50" />
          <p className="text-base font-semibold">No workout logs found</p>
          <p className="text-xs">There are no workout logs matching the current filter.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const exerciseCount = log.exercises?.length || 0;

            return (
              <div
                key={log.id}
                className="rounded-2xl border border-border bg-background transition hover:border-brand/30"
              >
                <div
                  className="flex flex-wrap items-center justify-between gap-4 p-4 cursor-pointer select-none"
                  onClick={() => onToggleExpand(log.id)}
                >
                  <div className="flex items-center gap-3">
                    <LogStatusBadge status={log.status} />
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        Scheduled: {formatDate(log.scheduledDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.startedAt ? `Started ${formatDateTime(log.startedAt)}` : "Not started"}{" "}
                        {log.completedAt ? `· Completed ${formatDateTime(log.completedAt)}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-muted-foreground">
                    <div>
                      <span className="block font-medium">Duration</span>
                      <span className="font-semibold text-foreground">
                        {log.durationMinutes ? `${log.durationMinutes} min` : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="block font-medium">Exercises</span>
                      <span className="font-semibold text-foreground">{exerciseCount}</span>
                    </div>
                    <div>
                      <span className="block font-medium">Overall RPE</span>
                      <span className="font-semibold text-foreground">{log.overallRpe ?? "—"}</span>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                      aria-label={isExpanded ? "Collapse details" : "Expand details"}
                    >
                      {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border/60 bg-muted/20 p-4 space-y-4">
                    {log.clientNotes && (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-900 dark:text-amber-300">
                        <span className="font-bold">Client Notes: </span>
                        {log.clientNotes}
                      </div>
                    )}

                    {log.exercises.map((exercise) => (
                      <div key={exercise.id} className="rounded-xl border border-border/80 bg-card p-3">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
                          <p className="font-bold text-sm text-foreground">
                            #{exercise.position} {exercise.exerciseName}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {exercise.sets.length} set{exercise.sets.length === 1 ? "" : "s"}
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                                <th className="py-1.5 px-2">Set #</th>
                                <th className="py-1.5 px-2">Prescribed Reps</th>
                                <th className="py-1.5 px-2">Prescribed Weight</th>
                                <th className="py-1.5 px-2">Prescribed Intensity</th>
                                <th className="py-1.5 px-2">Logged Reps</th>
                                <th className="py-1.5 px-2">Logged Weight</th>
                                <th className="py-1.5 px-2">Logged RPE</th>
                                <th className="py-1.5 px-2">Outcome</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                              {exercise.sets.map((set) => (
                                <tr key={set.id} className="hover:bg-muted/40">
                                  <td className="py-2 px-2 font-semibold text-foreground">
                                    Set {set.setNumber} {set.isExtra && <span className="text-[10px] text-amber-500">(Extra)</span>}
                                  </td>
                                  <td className="py-2 px-2 text-muted-foreground">
                                    {set.prescribedRepsMin != null && set.prescribedRepsMax != null
                                      ? `${set.prescribedRepsMin} - ${set.prescribedRepsMax}`
                                      : set.prescribedRepsMin ?? set.prescribedRepsMax ?? "—"}
                                  </td>
                                  <td className="py-2 px-2 text-muted-foreground">
                                    {set.prescribedWeightKg != null ? `${set.prescribedWeightKg} kg` : "—"}
                                  </td>
                                  <td className="py-2 px-2 text-muted-foreground uppercase">
                                    {set.prescribedIntensityType
                                      ? `${set.prescribedIntensityType} ${set.prescribedIntensityValue ?? ""}`
                                      : "—"}
                                  </td>
                                  <td className="py-2 px-2 font-semibold text-foreground">
                                    {set.reps != null ? set.reps : "—"}
                                  </td>
                                  <td className="py-2 px-2 font-semibold text-foreground">
                                    {set.weightKg != null ? `${set.weightKg} kg` : "—"}
                                  </td>
                                  <td className="py-2 px-2 font-semibold text-foreground">
                                    {set.rpe != null ? set.rpe : "—"}
                                  </td>
                                  <td className="py-2 px-2">
                                    <OutcomeBadge outcome={set.outcome} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
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
