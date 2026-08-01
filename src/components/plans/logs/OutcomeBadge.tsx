export function OutcomeBadge({ outcome }: { outcome: string }) {
  const normalized = (outcome || "").toLowerCase();
  if (normalized === "completed") {
    return (
      <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
        Completed
      </span>
    );
  }
  if (normalized === "skipped") {
    return (
      <span className="inline-flex items-center rounded-full bg-warn/10 px-2 py-0.5 text-xs font-medium text-warn">
        Skipped
      </span>
    );
  }
  if (normalized === "failed") {
    return (
      <span className="inline-flex items-center rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
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