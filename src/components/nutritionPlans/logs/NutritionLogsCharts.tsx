import { useMemo } from "react";
import type { NutritionDayLog } from "@/types/nutritionPlans";
import CardMain from "@/components/cards/CardMain";
import {
  AdherenceRows,
  DayStrip,
  LogCardHeader,
  OutcomeRing,
  StatHero,
  type AdherenceRow,
  type DayStripRow,
  type OutcomeRingEntry,
} from "@/components/logs/LogVisuals";

const OUTCOME_ORDER = ["completed", "partial", "non_compliant", "pending"] as const;
const MEAL_OUTCOME_ORDER = ["completed", "partial", "skipped"] as const;

const DAY_OUTCOME_META: Record<string, { label: string; color: string }> = {
  completed: { label: "Completed", color: "var(--color-success)" },
  partial: { label: "Partial", color: "var(--color-info)" },
  non_compliant: { label: "Non-compliant", color: "var(--color-danger)" },
  pending: { label: "Pending", color: "var(--color-warn)" },
};

const MEAL_OUTCOME_META: Record<string, { label: string; color: string }> = {
  completed: { label: "Completed", color: "var(--color-success)" },
  partial: { label: "Partial", color: "var(--color-info)" },
  skipped: { label: "Skipped", color: "var(--color-warn)" },
};

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function normalizeOutcome(value: string | undefined): string {
  const v = (value || "").toLowerCase();
  if (v === "completed" || v === "compliant") return "completed";
  if (v === "partial") return "partial";
  if (v === "non_compliant" || v === "noncompliant") return "non_compliant";
  return "pending";
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

const MACRO_KEYS = [
  { key: "proteinG", label: "Protein", unit: "g" },
  { key: "carbsG", label: "Carbs", unit: "g" },
  { key: "fatG", label: "Fat", unit: "g" },
  { key: "fiberG", label: "Fiber", unit: "g" },
] as const;

interface NutritionLogsChartsProps {
  logs: NutritionDayLog[];
}

export function NutritionLogsCharts({ logs }: NutritionLogsChartsProps) {
  const outcomeData = useMemo<OutcomeRingEntry[]>(() => {
    const counts = new Map<string, number>();
    for (const log of logs) {
      const key = normalizeOutcome(log.adherenceOutcome);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return OUTCOME_ORDER.map((outcome) => ({
      outcome,
      count: counts.get(outcome) ?? 0,
      label: DAY_OUTCOME_META[outcome].label,
      color: DAY_OUTCOME_META[outcome].color,
    })).filter((entry) => entry.count > 0);
  }, [logs]);

  const totalDays = logs.length;

  const mealOutcomeData = useMemo<OutcomeRingEntry[]>(() => {
    const counts = new Map<string, number>();
    for (const log of logs) {
      for (const meal of log.mealOutcomes ?? []) {
        const key = (meal.outcome || "skipped").toLowerCase();
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return MEAL_OUTCOME_ORDER.map((outcome) => ({
      outcome,
      count: counts.get(outcome) ?? 0,
      label: MEAL_OUTCOME_META[outcome].label,
      color: MEAL_OUTCOME_META[outcome].color,
    })).filter((entry) => entry.count > 0);
  }, [logs]);

  const macroData = useMemo<AdherenceRow[]>(() => {
    const sums = new Map<string, { target: number; actual: number; count: number }>();
    for (const log of logs) {
      for (const { key } of MACRO_KEYS) {
        const comparison = log.comparisons?.[key];
        if (!comparison || typeof comparison.actual !== "number") continue;
        const agg = sums.get(key) ?? { target: 0, actual: 0, count: 0 };
        agg.target += comparison.target ?? 0;
        agg.actual += comparison.actual;
        agg.count += 1;
        sums.set(key, agg);
      }
    }
    return MACRO_KEYS.map(({ key, label }) => {
      const agg = sums.get(key);
      return {
        name: label,
        prescribed: agg && agg.count > 0 ? round1(agg.target / agg.count) : 0,
        actual: agg && agg.count > 0 ? round1(agg.actual / agg.count) : 0,
      };
    }).filter((entry) => entry.prescribed > 0 || entry.actual > 0);
  }, [logs]);

  const macroOverall = useMemo(() => {
    const targetSum = macroData.reduce((sum, d) => sum + d.prescribed, 0);
    const actualSum = macroData.reduce((sum, d) => sum + d.actual, 0);
    return targetSum > 0 ? Math.round((actualSum / targetSum) * 100) : null;
  }, [macroData]);

  const calorieData = useMemo<DayStripRow[]>(
    () =>
      logs
        .filter((log) => typeof log.comparisons?.calories?.actual === "number")
        .map((log) => ({
          label: shortDate(log.scheduledDate),
          target: log.comparisons!.calories!.target ?? 0,
          actual: log.comparisons!.calories!.actual as number,
        })),
    [logs],
  );

  const calorieOverall = useMemo(() => {
    const targetSum = calorieData.reduce((sum, d) => sum + d.target, 0);
    const actualSum = calorieData.reduce((sum, d) => sum + d.actual, 0);
    return targetSum > 0 ? Math.round((actualSum / targetSum) * 100) : null;
  }, [calorieData]);

  const waterData = useMemo<DayStripRow[]>(
    () =>
      logs
        .filter((log) => typeof log.waterMlConsumed === "number")
        .map((log) => ({
          label: shortDate(log.scheduledDate),
          target: log.effectiveTargets?.waterMl ?? 0,
          actual: log.waterMlConsumed as number,
        })),
    [logs],
  );

  const waterOverall = useMemo(() => {
    const targetSum = waterData.reduce((sum, d) => sum + d.target, 0);
    const actualSum = waterData.reduce((sum, d) => sum + d.actual, 0);
    return targetSum > 0 ? Math.round((actualSum / targetSum) * 100) : null;
  }, [waterData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Day outcomes */}
        <CardMain className="min-w-0 overflow-hidden">
          <LogCardHeader
            eyebrow="Adherence"
            title="Day outcomes"
            description="Adherence of each logged day"
          />
          <div className="flex flex-1 flex-col gap-6">
            {outcomeData.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                No logged days yet
              </div>
            ) : (
              <OutcomeRing data={outcomeData} centerLabel="days completed" />
            )}
          </div>
        </CardMain>

        {/* Meal outcomes */}
        <CardMain className="min-w-0 overflow-hidden">
          <LogCardHeader
            eyebrow="Meals"
            title="Meal outcomes"
            description="Results of meals logged across all days"
          />
          <div className="flex flex-1 flex-col gap-6">
            {mealOutcomeData.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                No meals logged yet
              </div>
            ) : (
              <OutcomeRing data={mealOutcomeData} centerLabel="meals completed" />
            )}
          </div>
        </CardMain>
      </div>

      {/* Macro adherence — full width */}
      <CardMain className="min-w-0 overflow-hidden">
        <LogCardHeader
          eyebrow="Macros"
          title="Macro adherence"
          description="Average daily intake vs plan target, per macro"
        />
        <div className="flex flex-1 flex-col gap-6">
          {macroData.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
              No macro data yet
            </div>
          ) : (
            <>
              <StatHero
                value={macroOverall == null ? "—" : `${macroOverall}%`}
                caption={
                  macroOverall == null
                    ? "No macro targets to compare"
                    : `of daily macro targets hit across ${totalDays} logged day${totalDays === 1 ? "" : "s"}`
                }
              />
              <AdherenceRows data={macroData} />
            </>
          )}
        </div>
      </CardMain>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily calorie adherence */}
        <CardMain className="min-w-0 overflow-hidden">
          <LogCardHeader
            eyebrow="Energy"
            title="Daily calories"
            description="Target vs actual calories per logged day"
          />
          <div className="flex flex-1 flex-col gap-6">
            {calorieData.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                No calorie data yet
              </div>
            ) : (
              <>
                <StatHero
                  value={calorieOverall == null ? "—" : `${calorieOverall}%`}
                  caption={
                    calorieOverall == null
                      ? "No calorie targets to compare"
                      : `of daily calorie targets hit across ${calorieData.length} logged day${calorieData.length === 1 ? "" : "s"}`
                  }
                />
                <DayStrip data={calorieData} />
              </>
            )}
          </div>
        </CardMain>

        {/* Water intake */}
        <CardMain className="min-w-0 overflow-hidden">
          <LogCardHeader
            eyebrow="Hydration"
            title="Water intake"
            description="Target vs consumed water per logged day"
          />
          <div className="flex flex-1 flex-col gap-6">
            {waterData.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                No water data yet
              </div>
            ) : (
              <>
                <StatHero
                  value={waterOverall == null ? "—" : `${waterOverall}%`}
                  caption={
                    waterOverall == null
                      ? "No water targets to compare"
                      : `of daily water targets hit across ${waterData.length} logged day${waterData.length === 1 ? "" : "s"}`
                  }
                />
                <DayStrip data={waterData} />
              </>
            )}
          </div>
        </CardMain>
      </div>
    </div>
  );
}