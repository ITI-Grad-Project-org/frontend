import { Utensils } from "lucide-react";
import type { NutritionPlanDay, NutritionLogComparisons } from "@/types/nutritionPlans";

interface Props {
  prescription: NutritionPlanDay;
  comparisons: NutritionLogComparisons | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(val: number | null | undefined, unit = "") {
  if (val == null) return "—";
  return `${val}${unit}`;
}

function diffColor(diff: number | null) {
  if (diff == null) return "text-muted-foreground";
  if (diff > 0) return "text-danger";
  if (diff < 0) return "text-info";
  return "text-success";
}

function pctBar(actual: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((actual / target) * 100));
}

function pctDiff(value: number | null | undefined) {
  if (value == null) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

const MACRO_ROWS: { key: keyof NutritionLogComparisons; label: string; unit: string; barColor: string }[] = [
  { key: "calories", label: "Calories", unit: " kcal", barColor: "bg-warn" },
  { key: "proteinG", label: "Protein", unit: "g", barColor: "bg-info" },
  { key: "carbsG", label: "Carbs", unit: "g", barColor: "bg-brand" },
  { key: "fatG", label: "Fat", unit: "g", barColor: "bg-danger" },
  { key: "fiberG", label: "Fiber", unit: "g", barColor: "bg-success" },
];

// ─── Macro Comparison Table ───────────────────────────────────────────────────

function MacroComparisonTable({ comparisons }: { comparisons: NutritionLogComparisons }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider">
            <th className="py-2 px-3">Nutrient</th>
            <th className="py-2 px-3 bg-muted/30">Target</th>
            <th className="py-2 px-3 bg-muted/30">Prescribed</th>
            <th className="py-2 px-3 bg-brand/5 text-brand">Actual</th>
            <th className="py-2 px-3 bg-brand/5 text-brand">vs Target</th>
            <th className="py-2 px-3 bg-brand/5 text-brand">vs Prescription</th>
            <th className="py-2 px-3">Progress</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {MACRO_ROWS.map(({ key, label, unit, barColor }) => {
            const c = comparisons[key];
            if (!c) return null;
            const pct = pctBar(c.actual, c.target);
            const vsTargetDiff = c.actualVsTarget.absoluteDifference;
            const vsPrescDiff = c.actualVsPrescription.absoluteDifference;
            return (
              <tr key={key} className="hover:bg-muted/20">
                <td className="py-2.5 px-3 font-bold text-foreground">{label}</td>
                <td className="py-2.5 px-3 bg-muted/10 text-muted-foreground">{fmt(c.target, unit)}</td>
                <td className="py-2.5 px-3 bg-muted/10 text-muted-foreground">{fmt(c.prescribed, unit)}</td>
                <td className="py-2.5 px-3 bg-brand/5 font-semibold text-foreground">{fmt(c.actual, unit)}</td>
                <td className={`py-2.5 px-3 bg-brand/5 font-semibold ${diffColor(vsTargetDiff)}`}>
                  {vsTargetDiff > 0 ? "+" : ""}{fmt(vsTargetDiff, unit)}
                  <span className="ml-1 text-[10px] opacity-70">({pctDiff(c.actualVsTarget.percentageDifference)})</span>
                </td>
                <td className={`py-2.5 px-3 bg-brand/5 font-semibold ${diffColor(vsPrescDiff)}`}>
                  {vsPrescDiff > 0 ? "+" : ""}{fmt(vsPrescDiff, unit)}
                  <span className="ml-1 text-[10px] opacity-70">({pctDiff(c.actualVsPrescription.percentageDifference)})</span>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2 min-w-20">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground w-8 text-right">{pct}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
      {/* Macro comparison table */}
      {hasComparisons && (
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-5">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Utensils className="size-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Nutrient Comparison</h2>
              <p className="text-xs text-muted-foreground">Target · Prescribed · Actual with variance</p>
            </div>
          </div>
          <MacroComparisonTable comparisons={comparisons!} />
        </section>
      )}

      {/* Prescribed meals */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-5">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-success/10 text-success">
            <Utensils className="size-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Prescribed Meals</h2>
            <p className="text-xs text-muted-foreground">
              {prescription.isFlexibleDay ? "Flexible day — no fixed meal plan" : `${prescription.meals?.length ?? 0} meal(s) prescribed`}
            </p>
          </div>
          {prescription.isFlexibleDay && (
            <span className="ml-auto px-2.5 py-1 text-[11px] font-bold rounded-full bg-violet/10 text-violet border border-violet/20">
              Flexible Day
            </span>
          )}
        </div>
        <PrescribedMealsSection prescription={prescription} />
      </section>
    </div>
  );
}