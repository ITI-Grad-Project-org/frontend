import { Activity, CheckCircle2, Clock, ThumbsUp, XCircle } from "lucide-react";

interface Props {
  stats: {
    total: number;
    completed: number;
    skipped: number;
    inProgress: number;
    compliant: number;
  };
}

export function NutritionLogsStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Logs</span>
          <Activity className="size-4" />
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">{stats.total}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
          <CheckCircle2 className="size-4" />
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">{stats.completed}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Skipped</span>
          <XCircle className="size-4" />
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">{stats.skipped}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
          <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
          <Clock className="size-4" />
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">{stats.inProgress}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-brand">
          <span className="text-xs font-semibold uppercase tracking-wider">Compliant</span>
          <ThumbsUp className="size-4" />
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">{stats.compliant}</p>
      </div>
    </div>
  );
}
