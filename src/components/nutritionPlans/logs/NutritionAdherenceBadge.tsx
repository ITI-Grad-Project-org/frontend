export function NutritionAdherenceBadge({ outcome }: { outcome: string }) {
  const n = (outcome ?? "").toLowerCase();
  if (n === "compliant")
    return <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">Compliant</span>;
  if (n === "partial")
    return <span className="inline-flex items-center rounded-full bg-warn/10 px-2.5 py-0.5 text-xs font-semibold text-warn">Partial</span>;
  if (n === "non_compliant")
    return <span className="inline-flex items-center rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-semibold text-danger">Non-Compliant</span>;
  if (n === "pending")
    return <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">Pending</span>;
  return <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground capitalize">{outcome || "—"}</span>;
}