export function NutritionAdherenceBadge({ outcome }: { outcome: string }) {
  const n = (outcome ?? "").toLowerCase();
  if (n === "compliant")
    return <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Compliant</span>;
  if (n === "partial")
    return <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">Partial</span>;
  if (n === "non_compliant")
    return <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">Non-Compliant</span>;
  if (n === "pending")
    return <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">Pending</span>;
  return <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground capitalize">{outcome || "—"}</span>;
}
