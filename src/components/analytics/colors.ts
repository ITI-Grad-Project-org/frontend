/** Semantic color for an adherence percentage, using design-system tokens. */
export function adherenceColor(pct: number | null): string {
  if (pct == null) return "var(--color-muted-foreground)";
  if (pct >= 80) return "var(--color-success)";
  if (pct >= 50) return "var(--color-brand)";
  return "var(--color-danger)";
}