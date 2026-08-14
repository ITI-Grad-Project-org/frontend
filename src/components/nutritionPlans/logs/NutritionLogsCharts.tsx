import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import type { NutritionDayLog } from "@/types/nutritionPlans";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import CardMain from "@/components/cards/CardMain";

const OUTCOME_ORDER = ["completed", "partial", "non_compliant", "pending"] as const;

const outcomeFill: Record<string, string> = {
  completed: "var(--chart-2)",
  partial: "var(--chart-5)",
  non_compliant: "var(--chart-4)",
  pending: "var(--chart-3)",
};

const outcomeConfig = {
  completed: { label: "Completed", color: "var(--chart-2)" },
  partial: { label: "Partial", color: "var(--chart-5)" },
  non_compliant: { label: "Non-compliant", color: "var(--chart-4)" },
  pending: { label: "Pending", color: "var(--chart-3)" },
} satisfies ChartConfig;

const calorieConfig = {
  target: { label: "Target", color: "var(--chart-1)" },
  actual: { label: "Actual", color: "var(--chart-2)" },
} satisfies ChartConfig;

const macroConfig = {
  target: { label: "Avg target", color: "var(--chart-1)" },
  actual: { label: "Avg actual", color: "var(--chart-2)" },
} satisfies ChartConfig;

const mealOutcomeConfig = {
  completed: { label: "Completed", color: "var(--chart-2)" },
  partial: { label: "Partial", color: "var(--chart-5)" },
  skipped: { label: "Skipped", color: "var(--chart-4)" },
} satisfies ChartConfig;

const waterConfig = {
  target: { label: "Target", color: "var(--chart-1)" },
  consumed: { label: "Consumed", color: "var(--chart-3)" },
} satisfies ChartConfig;

function truncateLabel(value: string, max = 14): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

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
  const outcomeData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of logs) {
      const key = normalizeOutcome(log.adherenceOutcome);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return OUTCOME_ORDER.map((outcome) => ({
      outcome,
      count: counts.get(outcome) ?? 0,
      fill: outcomeFill[outcome],
    })).filter((entry) => entry.count > 0);
  }, [logs]);

  const totalDays = logs.length;
  const completedDays = outcomeData.find((d) => d.outcome === "completed")?.count ?? 0;
  const completedPct = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const calorieData = useMemo(
    () =>
      logs
        .filter((log) => typeof log.comparisons?.calories?.actual === "number")
        .map((log) => ({
          day: shortDate(log.scheduledDate),
          target: log.comparisons!.calories!.target ?? 0,
          actual: log.comparisons!.calories!.actual as number,
        })),
    [logs],
  );

  const macroData = useMemo(() => {
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
        target: agg && agg.count > 0 ? round1(agg.target / agg.count) : 0,
        actual: agg && agg.count > 0 ? round1(agg.actual / agg.count) : 0,
      };
    }).filter((entry) => entry.target > 0 || entry.actual > 0);
  }, [logs]);

  const mealOutcomeData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of logs) {
      for (const meal of log.mealOutcomes ?? []) {
        const key = (meal.outcome || "skipped").toLowerCase();
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return (["completed", "partial", "skipped"] as const)
      .map((outcome) => ({ outcome, count: counts.get(outcome) ?? 0 }))
      .filter((entry) => entry.count > 0);
  }, [logs]);

  const waterData = useMemo(
    () =>
      logs
        .filter((log) => typeof log.waterMlConsumed === "number")
        .map((log) => ({
          day: shortDate(log.scheduledDate),
          target: log.effectiveTargets?.waterMl ?? 0,
          consumed: log.waterMlConsumed as number,
        })),
    [logs],
  );

  const hasMealData = mealOutcomeData.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Day outcomes doughnut */}
      <CardMain className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Day Outcomes</CardTitle>
          <CardDescription>Adherence of each logged day</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {outcomeData.length === 0 ? (
            <div className="flex h-[190px] items-center justify-center text-sm text-muted-foreground">
              No logged days yet
            </div>
          ) : (
            <>
              <div className="relative mx-auto h-[160px] max-w-[200px]">
                <ChartContainer config={outcomeConfig} className="h-full w-full">
                  <PieChart accessibilityLayer>
                    <ChartTooltip content={<ChartTooltipContent nameKey="outcome" />} />
                    <Pie
                      data={outcomeData}
                      dataKey="count"
                      nameKey="outcome"
                      innerRadius={48}
                      outerRadius={70}
                      paddingAngle={4}
                      strokeWidth={4}
                      stroke="var(--color-card)"
                    >
                      {outcomeData.map((entry) => (
                        <Cell key={entry.outcome} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">{completedPct}%</span>
                  <span className="text-xs text-muted-foreground">Completed</span>
                </div>
              </div>
              <ChartLegend content={<ChartLegendContent nameKey="outcome" />} />
            </>
          )}
        </CardContent>
      </CardMain>

      {/* Meal outcomes */}
      <CardMain className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Meal Outcomes</CardTitle>
          <CardDescription>Results of meals logged across all days</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {!hasMealData ? (
            <div className="flex h-[190px] items-center justify-center text-sm text-muted-foreground">
              No meals logged yet
            </div>
          ) : (
            <ChartContainer config={mealOutcomeConfig} className="h-[190px] w-full min-w-0">
              <BarChart accessibilityLayer data={mealOutcomeData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="outcome"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => truncateLabel(value)}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="count" radius={6} barSize={26}>
                  {mealOutcomeData.map((entry) => (
                    <Cell
                      key={entry.outcome}
                      fill={
                        mealOutcomeConfig[entry.outcome as keyof typeof mealOutcomeConfig]?.color ??
                        "var(--color-muted)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </CardMain>

      {/* Calorie adherence — full width */}
      <CardMain className="min-w-0 overflow-hidden lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Daily Calorie Adherence</CardTitle>
          <CardDescription>Target vs actual calories per logged day</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {calorieData.length === 0 ? (
            <div className="flex h-[190px] items-center justify-center text-sm text-muted-foreground">
              No calorie data yet
            </div>
          ) : (
            <>
              <ChartContainer config={calorieConfig} className="h-[190px] w-full min-w-0">
                <BarChart accessibilityLayer data={calorieData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="target" fill="var(--color-target)" radius={4} barSize={14} />
                  <Bar dataKey="actual" fill="var(--color-actual)" radius={4} barSize={14} />
                </BarChart>
              </ChartContainer>
              <ChartLegend content={<ChartLegendContent />} />
            </>
          )}
        </CardContent>
      </CardMain>

      {/* Macro adherence */}
      <CardMain className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Macro Adherence</CardTitle>
          <CardDescription>Average target vs actual intake per macro</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {macroData.length === 0 ? (
            <div className="flex h-[190px] items-center justify-center text-sm text-muted-foreground">
              No macro data yet
            </div>
          ) : (
            <ChartContainer config={macroConfig} className="h-[190px] w-full min-w-0">
              <BarChart
                accessibilityLayer
                data={macroData}
                layout="vertical"
                margin={{ top: 5, right: 16, left: 0, bottom: 5 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={70}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="target" fill="var(--color-target)" radius={4} barSize={10} />
                <Bar dataKey="actual" fill="var(--color-actual)" radius={4} barSize={10} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </CardMain>

      {/* Water intake */}
      <CardMain className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Water Intake</CardTitle>
          <CardDescription>Target vs consumed water per logged day</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {waterData.length === 0 ? (
            <div className="flex h-[190px] items-center justify-center text-sm text-muted-foreground">
              No water data yet
            </div>
          ) : (
            <ChartContainer config={waterConfig} className="h-[190px] w-full min-w-0">
              <BarChart accessibilityLayer data={waterData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="target" fill="var(--color-target)" radius={4} barSize={14} />
                <Bar dataKey="consumed" fill="var(--color-consumed)" radius={4} barSize={14} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </CardMain>
    </div>
  );
}