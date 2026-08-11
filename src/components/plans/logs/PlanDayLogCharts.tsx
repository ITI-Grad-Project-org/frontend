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
import type {
  PrescribedDayInfo,
  PrescribedDayExercise,
  WorkoutLog,
  WorkoutLogExercise,
} from "@/types/plans";
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

const OUTCOME_ORDER = ["completed", "skipped", "failed", "partial"] as const;

const outcomeFill: Record<string, string> = {
  completed: "var(--chart-2)",
  skipped: "var(--chart-5)",
  failed: "var(--chart-4)",
  partial: "var(--chart-3)",
};

const adherenceConfig = {
  prescribed: { label: "Prescribed (avg)", color: "var(--chart-1)" },
  actual: { label: "Actual (avg)", color: "var(--chart-2)" },
} satisfies ChartConfig;

const volumeConfig = {
  volume: { label: "Volume (kg)", color: "var(--chart-3)" },
} satisfies ChartConfig;

const outcomeConfig = {
  completed: { label: "Completed", color: "var(--chart-2)" },
  skipped: { label: "Skipped", color: "var(--chart-5)" },
  failed: { label: "Failed", color: "var(--chart-4)" },
  partial: { label: "Partial", color: "var(--chart-3)" },
} satisfies ChartConfig;

function midpoint(
  min: number | null | undefined,
  max: number | null | undefined
): number | null {
  if (min != null && max != null) return (min + max) / 2;
  return min ?? max ?? null;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function truncateLabel(value: string, max = 18): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

interface DayExerciseInsight {
  name: string;
  prescribedAvg: number | null;
  actualAvg: number | null;
  volume: number;
}

function findLoggedExercise(
  loggedExercises: WorkoutLogExercise[],
  pEx: PrescribedDayExercise
): WorkoutLogExercise | undefined {
  return loggedExercises.find(
    (e) => e.plannedExerciseId === pEx.id || e.exerciseId === pEx.exerciseId
  );
}

interface PlanDayLogChartsProps {
  prescription: PrescribedDayInfo | null;
  workoutLog: WorkoutLog | null;
}

export function PlanDayLogCharts({ prescription, workoutLog }: PlanDayLogChartsProps) {
  const insights = useMemo<DayExerciseInsight[]>(() => {
    const prescribedExercises = prescription?.exercises || [];
    const loggedExercises = workoutLog?.exercises || [];

    return prescribedExercises.map((pEx) => {
      const loggedEx = findLoggedExercise(loggedExercises, pEx);

      let prescribedSum = 0;
      let prescribedCount = 0;
      for (const pSet of pEx.sets) {
        const mid = midpoint(pSet.repsMin, pSet.repsMax);
        if (mid != null) {
          prescribedSum += mid;
          prescribedCount += 1;
        }
      }

      let actualSum = 0;
      let actualCount = 0;
      let volume = 0;
      if (loggedEx) {
        for (const lSet of loggedEx.sets) {
          if (typeof lSet.reps === "number") {
            actualSum += lSet.reps;
            actualCount += 1;
          }
          if (lSet.weightKg && lSet.reps) {
            volume += lSet.weightKg * lSet.reps;
          }
        }
      }

      return {
        name: pEx.exerciseName,
        prescribedAvg: prescribedCount > 0 ? prescribedSum / prescribedCount : null,
        actualAvg: actualCount > 0 ? actualSum / actualCount : null,
        volume,
      };
    });
  }, [prescription, workoutLog]);

  const adherenceData = useMemo(
    () =>
      insights
        .map((i) => ({
          name: i.name,
          prescribed: i.prescribedAvg != null ? round1(i.prescribedAvg) : 0,
          actual: i.actualAvg != null ? round1(i.actualAvg) : 0,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [insights]
  );

  const volumeData = useMemo(
    () =>
      insights
        .filter((i) => i.volume > 0)
        .map((i) => ({ name: i.name, volume: Math.round(i.volume) }))
        .sort((a, b) => b.volume - a.volume),
    [insights]
  );

  const outcomeData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const exercise of workoutLog?.exercises || []) {
      for (const set of exercise.sets) {
        const key = (set.outcome || "unknown").toLowerCase();
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([outcome, count]) => ({
        outcome,
        count,
        fill: outcomeFill[outcome] || "var(--color-muted)",
      }))
      .sort(
        (a, b) =>
          OUTCOME_ORDER.indexOf(a.outcome as (typeof OUTCOME_ORDER)[number]) -
          OUTCOME_ORDER.indexOf(b.outcome as (typeof OUTCOME_ORDER)[number])
      );
  }, [workoutLog]);

  const totalSets = outcomeData.reduce((sum, d) => sum + d.count, 0);
  const completedSets = outcomeData.find((d) => d.outcome === "completed")?.count || 0;
  const setCompletionRate = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  const hasLog = Boolean(workoutLog);

  return (
    <div className="space-y-6">
      {/* Adherence */}
      <CardMain>
        <CardHeader>
          <CardTitle className="text-lg">Program Adherence — Prescribed vs Actual Reps</CardTitle>
          <CardDescription>
            Average prescribed rep target vs average reps actually performed, per exercise
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {adherenceData.length === 0 ? (
            <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
              No prescribed exercises yet
            </div>
          ) : (
            <>
              <ChartContainer config={adherenceConfig} className="h-[260px] w-full min-w-0">
                <BarChart accessibilityLayer data={adherenceData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={0}
                    tickFormatter={(value) => truncateLabel(value)}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="prescribed" fill="var(--color-prescribed)" radius={6} />
                  <Bar dataKey="actual" fill="var(--color-actual)" radius={6} />
                </BarChart>
              </ChartContainer>
              <ChartLegend content={<ChartLegendContent />} />
            </>
          )}
        </CardContent>
      </CardMain>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Volume by Exercise */}
        <CardMain className="min-w-0 overflow-hidden lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Volume by Exercise</CardTitle>
            <CardDescription>Total weight lifted (kg × reps) in this session</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 overflow-hidden flex-1 p-2 sm:p-6">
            {volumeData.length === 0 ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No volume data yet
              </div>
            ) : (
              <ChartContainer config={volumeConfig} className="h-[280px] w-full min-w-0">
                <BarChart
                  accessibilityLayer
                  data={volumeData}
                  layout="vertical"
                  margin={{ top: 5, right: 16, left: 0, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => truncateLabel(value, 18)}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="volume" fill="var(--color-volume)" radius={4} barSize={16} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </CardMain>

        {/* Set Outcomes */}
        <CardMain className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Set Outcomes</CardTitle>
            <CardDescription>Results of this session's performed sets</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 flex-1">
            {!hasLog || outcomeData.length === 0 ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No workout log recorded for this day
              </div>
            ) : (
              <>
                <div className="relative mx-auto h-[200px] max-w-[240px]">
                  <ChartContainer config={outcomeConfig} className="h-full w-full">
                    <PieChart accessibilityLayer>
                      <ChartTooltip content={<ChartTooltipContent nameKey="outcome" />} />
                      <Pie
                        data={outcomeData}
                        dataKey="count"
                        nameKey="outcome"
                        innerRadius={56}
                        outerRadius={82}
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
                    <span className="text-3xl font-bold text-foreground">{setCompletionRate}%</span>
                    <span className="text-xs text-muted-foreground">Sets Completed</span>
                  </div>
                </div>
                <ChartLegend content={<ChartLegendContent nameKey="outcome" />} />
              </>
            )}
          </CardContent>
        </CardMain>
      </div>
    </div>
  );
}
