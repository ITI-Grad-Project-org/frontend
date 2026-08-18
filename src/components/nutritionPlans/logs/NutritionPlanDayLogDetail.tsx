import { Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NutritionPlanDay, NutritionLogComparisons } from "@/types/nutritionPlans";
import CardMain from "@/components/cards/CardMain";
import { LogCardHeader, StatHero } from "@/components/logs/LogVisuals";

interface Props {
  prescription: NutritionPlanDay;
  comparisons: NutritionLogComparisons | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(val: number | null | undefined, unit = "") {
  if (val == null) return "—";
  return `${val}${unit}`;
}

function pctBar(actual: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((actual / target) * 100));
}

function pctDiff(value: number | null | undefined) {
  if (value == null) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function diffChip(diff: number | null): { bg: string; text: string } {
  if (diff == null) return { bg: "bg-muted", text: "text-muted-foreground" };
  if (diff > 0) return { bg: "bg-danger/10", text: "text-danger" };
  if (diff < 0) return { bg: "bg-info/10", text: "text-info" };
  return { bg: "bg-success/10", text: "text-success" };
}

const MACRO_ROWS: { key: keyof NutritionLogComparisons; label: string; unit: string; barColor: string }[] = [
  { key: "calories", label: "Calories", unit: " kcal", barColor: "bg-warn" },
  { key: "proteinG", label: "Protein", unit: "g", barColor: "bg-info" },
  { key: "carbsG", label: "Carbs", unit: "g", barColor: "bg-brand" },
  { key: "fatG", label: "Fat", unit: "g", barColor: "bg-danger" },
  { key: "fiberG", label: "Fiber", unit: "g", barColor: "bg-success" },
];

// ─── Macro Comparison List ───────────────────────────────────────────────────

function MacroComparisonList({ comparisons }: { comparisons: NutritionLogComparisons }) {
  const present = MACRO_ROWS.filter((row) => comparisons[row.key]).map((row) => {
    const c = comparisons[row.key]!;
    return {
      ...row,
      c,
      pct: pctBar(c.actual, c.target),
      chip: diffChip(c.actualVsTarget.absoluteDifference),
      vsPresc: c.actualVsPrescription.absoluteDifference,
    };
  });

  let targetSum = 0;
  let actualSum = 0;
  for (const { c } of present) {
    if (typeof c.actual !== "number") continue;
    if ((c.target ?? 0) > 0) {
      targetSum += c.target;
      actualSum += c.actual;
    }
  }
  const overall = targetSum > 0 ? Math.round((actualSum / targetSum) * 100) : null;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <StatHero
        value={overall == null ? "—" : `${overall}%`}
        caption={
          overall == null
            ? "No nutrient targets to compare"
            : "of daily nutrient targets met this day"
        }
      />
      <ul className="max-h-80 space-y-4 overflow-x-hidden overflow-y-auto overscroll-y-contain pr-1">
        {present.map((row) => (
          <li key={row.key} className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2.5">
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                {row.label}
              </span>
              <span className="text-lg font-black tabular-nums text-foreground">
                {fmt(row.c.actual)}
              </span>
              <span className="text-xs text-muted-foreground">/ {fmt(row.c.target, row.unit)}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
                  row.chip.bg,
                  row.chip.text,
                )}
              >
                {pctDiff(row.c.actualVsTarget.percentageDifference)}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", row.barColor)}
                  style={{ width: `${row.pct}%` }}
                />
              </div>
              <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
                Prescribed {fmt(row.c.prescribed, row.unit)}
                <span className="ml-1.5 opacity-70">
                  · vs prescription {row.vsPresc > 0 ? "+" : ""}
                  {fmt(row.vsPresc, row.unit)}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Prescribed Meals Table ───────────────────────────────────────────────────

function PrescribedMealsSection({ prescription }: { prescription: NutritionPlanDay }) {
  const meals = prescription.meals ?? [];
  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-center">
        <Utensils className="size-6 mb-2 opacity-40" />
        <p className="text-sm font-semibold">No meals prescribed for this day</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meals
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((meal) => (
          <div key={meal.id} className="rounded-2xl border border-border bg-background p-4 space-y-3">
            {/* Meal header */}
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 border-b border-border/40 pb-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {meal.slot && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                      {meal.slot}
                    </span>
                  )}
                  {meal.suggestedTime && (
                    <span className="text-[10px] text-muted-foreground">@ {meal.suggestedTime}</span>
                  )}
                </div>
                <h4 className="mt-1 font-bold text-sm text-foreground">{meal.mealName}</h4>
                {meal.coachNotes && (
                  <p className="mt-0.5 text-xs italic text-muted-foreground">"{meal.coachNotes}"</p>
                )}
              </div>
              {meal.totals && (
                <div className="text-right text-xs shrink-0">
                  <span className="block font-extrabold text-warn">{meal.totals.calories} kcal</span>
                  <span className="text-muted-foreground">
                    P:{meal.totals.proteinG}g C:{meal.totals.carbsG}g F:{meal.totals.fatG}g
                  </span>
                </div>
              )}
            </div>

            {/* Foods */}
            {meal.foods && meal.foods.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground font-semibold border-b border-border/30">
                    <th className="py-1 text-left">Food</th>
                    <th className="py-1 text-right">Amount</th>
                    <th className="py-1 text-right">Calories</th>
                    <th className="py-1 text-right">P</th>
                    <th className="py-1 text-right">C</th>
                    <th className="py-1 text-right">F</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {meal.foods
                    .slice()
                    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                    .map((food) => (
                      <tr key={food.id} className="hover:bg-muted/20">
                        <td className="py-1.5 text-foreground font-medium">{food.foodName}</td>
                        <td className="py-1.5 text-right text-muted-foreground">{food.amount}{food.servingUnit}</td>
                        <td className="py-1.5 text-right font-semibold text-warn">
                          {food.nutrients?.calories ?? food.nutrientsPerServing?.calories ?? "—"}
                        </td>
                        <td className="py-1.5 text-right text-muted-foreground">
                          {fmt(food.nutrients?.proteinG ?? food.nutrientsPerServing?.proteinG, "g")}
                        </td>
                        <td className="py-1.5 text-right text-muted-foreground">
                          {fmt(food.nutrients?.carbsG ?? food.nutrientsPerServing?.carbsG, "g")}
                        </td>
                        <td className="py-1.5 text-right text-muted-foreground">
                          {fmt(food.nutrients?.fatG ?? food.nutrientsPerServing?.fatG, "g")}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function NutritionPlanDayLogDetail({ prescription, comparisons }: Props) {
  const hasComparisons = comparisons && Object.keys(comparisons).length > 0;

  return (
    <div className="space-y-6">
      {hasComparisons && (
        <CardMain className="min-w-0 overflow-hidden">
          <LogCardHeader
            eyebrow="Adherence"
            title="Nutrient comparison"
            description="Target · prescribed · actual with variance"
          />
          <MacroComparisonList comparisons={comparisons!} />
        </CardMain>
      )}

      <CardMain className="min-w-0 overflow-hidden">
        <LogCardHeader
          eyebrow="Meals"
          title="Prescribed meals"
          description={
            prescription.isFlexibleDay
              ? "Flexible day — no fixed meal plan"
              : `${prescription.meals?.length ?? 0} meal(s) prescribed`
          }
          action={
            prescription.isFlexibleDay ? (
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-violet/10 text-violet border border-violet/20">
                Flexible Day
              </span>
            ) : undefined
          }
        />
        <PrescribedMealsSection prescription={prescription} />
      </CardMain>
    </div>
  );
}