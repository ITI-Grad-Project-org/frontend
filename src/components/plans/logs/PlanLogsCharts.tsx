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
import type { WorkoutLog, WorkoutLogSet } from "@/types/plans";
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

function prescribedMidpoint(set: WorkoutLogSet): number | null {
  if (set.prescribedRepsMin != null && set.prescribedRepsMax != null) {
    return (set.prescribedRepsMin + set.prescribedRepsMax) / 2;
  }
  return set.prescribedRepsMin ?? set.prescribedRepsMax;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function truncateLabel(value: string, max = 18): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

interface ExerciseAgg {
  id: string;
  name: string;
  repsSum: number;
  repsCount: number;
  prescribedMidSum: number;
  prescribedCount: number;
  volume: number;
}

interface PlanLogsChartsProps {
  logs: WorkoutLog[];
}

export function PlanLogsCharts({ logs }: PlanLogsChartsProps) {
  const exerciseData = useMemo(() => {
    const map = new Map<string, ExerciseAgg>();
    for (const log of logs) {
      for (const exercise of log.exercises) {
        const agg = map.get(exercise.exerciseId) ?? {
          id: exercise.exerciseId,
          name: exercise.exerciseName,
          repsSum: 0,
          repsCount: 0,
          prescribedMidSum: 0,
          prescribedCount: 0,
          volume: 0,
        };
        for (const set of exercise.sets) {
          if (typeof set.reps === "number") {
            agg.repsSum += set.reps;
            agg.repsCount += 1;
            const mid = prescribedMidpoint(set);
            if (mid != null) {
              agg.prescribedMidSum += mid;
              agg.prescribedCount += 1;
            }
          }
          if (set.weightKg && set.reps) {
            agg.volume += set.weightKg * set.reps;
          }
        }
        map.set(exercise.exerciseId, agg);
      }
    }
    return [...map.values()];
  }, [logs]);

  const adherenceData = useMemo(
    () =>
      exerciseData
        .filter((e) => e.repsCount > 0)
        .map((e) => ({
          name: e.name,
          prescribed:
            e.prescribedCount > 0 ? round1(e.prescribedMidSum / e.prescribedCount) : 0,
          actual: round1(e.repsSum / e.repsCount),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [exerciseData]
  );

  const volumeData = useMemo(
    () =>
      exerciseData
        .filter((e) => e.volume > 0)
        .map((e) => ({ name: e.name, volume: Math.round(e.volume) }))
        .sort((a, b) => b.volume - a.volume),
    [exerciseData]
  );

  const outcomeData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of logs) {
      for (const exercise of log.exercises) {
        for (const set of exercise.sets) {
          const key = (set.outcome || "unknown").toLowerCase();
          counts.set(key, (counts.get(key) || 0) + 1);
        }
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
  }, [logs]);

  const totalSets = outcomeData.reduce((sum, d) => sum + d.count, 0);
  const completedSets = outcomeData.find((d) => d.outcome === "completed")?.count || 0;
  const setCompletionRate = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

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
              No performed sets with rep data yet
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

      {/* <div className="grid gap-6 md:grid-cols-3">
        <CardMain className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Volume by Exercise</CardTitle>
            <CardDescription>Total weight lifted (kg × reps) across all sessions</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
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
                  margin={{ left: 4, right: 8 }}
                >
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fill: "var(--color-muted-foreground)" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={170}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => truncateLabel(value, 22)}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="volume" fill="var(--color-volume)" radius={6} barSize={18} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </CardMain>

        <CardMain>
          <CardHeader>
            <CardTitle className="text-lg">Set Outcomes</CardTitle>
            <CardDescription>Results of all performed sets</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {outcomeData.length === 0 ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No sets logged yet
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
      </div> */}


      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Volume by Exercise */}
        <CardMain className="min-w-0 overflow-hidden lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Volume by Exercise</CardTitle>
            <CardDescription>Total weight lifted (kg × reps) across all sessions</CardDescription>
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
            <CardDescription>Results of all performed sets</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 flex-1">
            {outcomeData.length === 0 ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No sets logged yet
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
