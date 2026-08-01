import { Activity, Award, CheckCircle2, XCircle } from "lucide-react";

interface PlanLogsStatsProps {
  stats: {
    totalLogs: number;
    completedCount: number;
    skippedCount: number;
    avgRpe: string;
  };
}

export function PlanLogsStats({ stats }: PlanLogsStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Logs</span>
          <Activity className="size-4" />
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalLogs}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-success">
          <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
          <CheckCircle2 className="size-4" />
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">{stats.completedCount}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-warn">
          <span className="text-xs font-semibold uppercase tracking-wider">Skipped</span>
          <XCircle className="size-4" />
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">{stats.skippedCount}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-brand">
          <span className="text-xs font-semibold uppercase tracking-wider">Avg RPE</span>
          <Award className="size-4" />
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">{stats.avgRpe}</p>
      </div>
    </div>
  );
}