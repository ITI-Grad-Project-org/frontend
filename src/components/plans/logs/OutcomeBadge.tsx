export function OutcomeBadge({ outcome }: { outcome: string }) {
  const normalized = (outcome || "").toLowerCase();
  if (normalized === "completed") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        Completed
      </span>
    );
  }
  if (normalized === "skipped") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        Skipped
      </span>
    );
  }
  if (normalized === "failed") {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
      {outcome || "—"}
    </span>
  );
}
