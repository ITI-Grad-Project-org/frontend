import { CheckCircle2, Clock, XCircle } from "lucide-react";

export function LogStatusBadge({ status }: { status: string }) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-3" />
        Completed
      </span>
    );
  }
  if (normalized === "skipped") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
        <XCircle className="size-3" />
        Skipped
      </span>
    );
  }
  if (normalized === "in_progress" || normalized === "in-progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
        <Clock className="size-3" />
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground capitalize">
      {status || "Not Logged"}
    </span>
  );
}
