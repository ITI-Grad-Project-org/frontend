import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import type { NutritionPlanSummary } from "@/types/nutritionPlans";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import CardMain from "@/components/cards/CardMain";

const PLAN_STATUS_ORDER = ["published", "draft", "cancelled"] as const;

const statusFill: Record<string, string> = {
  published: "var(--chart-2)",
  draft: "var(--chart-5)",
  cancelled: "var(--chart-4)",
};

const statusConfig = {
  published: { label: "Published", color: "var(--chart-2)" },
  draft: { label: "Draft", color: "var(--chart-5)" },
  cancelled: { label: "Cancelled", color: "var(--chart-4)" },
} satisfies ChartConfig;

const createdConfig = {
  created: { label: "Plans created", color: "var(--chart-1)" },
} satisfies ChartConfig;

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function lastMonths(count: number): { key: string; label: string }[] {
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: monthKey(date),
      label: date.toLocaleDateString(undefined, { month: "short" }),
    });
  }
  return months;
}

interface NutritionPlansChartsProps {
  plans: NutritionPlanSummary[];
}

export function NutritionPlansCharts({ plans }: NutritionPlansChartsProps) {
  const statusData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const plan of plans) {
      counts.set(plan.status, (counts.get(plan.status) ?? 0) + 1);
    }
    return PLAN_STATUS_ORDER.map((status) => ({
      status,
      count: counts.get(status) ?? 0,
      fill: statusFill[status],
    })).filter((entry) => entry.count > 0);
  }, [plans]);

  const monthData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const plan of plans) {
      const key = monthKey(new Date(plan.createdAt));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return lastMonths(6).map((month) => ({
      month: month.label,
      count: counts.get(month.key) ?? 0,
    }));
  }, [plans]);

  const total = plans.length;
  const published = statusData.find((entry) => entry.status === "published")?.count ?? 0;
  const publishedPct = total > 0 ? Math.round((published / total) * 100) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Status distribution */}
      <CardMain className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Nutrition plans by status</CardTitle>
          <CardDescription>Distribution of your nutrition plans across statuses</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {statusData.length === 0 ? (
            <div className="flex h-[190px] items-center justify-center text-sm text-muted-foreground">
              No plans yet
            </div>
          ) : (
            <>
              <div className="relative mx-auto h-[160px] max-w-[200px]">
                <ChartContainer config={statusConfig} className="h-full w-full">
                  <PieChart accessibilityLayer>
                    <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
                    <Pie
                      data={statusData}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={48}
                      outerRadius={70}
                      paddingAngle={4}
                      strokeWidth={4}
                      stroke="var(--color-card)"
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.status} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">{publishedPct}%</span>
                  <span className="text-xs text-muted-foreground">Published</span>
                </div>
              </div>
              <ChartLegend content={<ChartLegendContent nameKey="status" />} />
            </>
          )}
        </CardContent>
      </CardMain>

      {/* Created by month */}
      <CardMain className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Nutrition plans created</CardTitle>
          <CardDescription>Plans created per month over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {total === 0 ? (
            <div className="flex h-[190px] items-center justify-center text-sm text-muted-foreground">
              No plans yet
            </div>
          ) : (
            <>
              <ChartContainer config={createdConfig} className="h-[190px] w-full min-w-0">
                <BarChart accessibilityLayer data={monthData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} allowDecimals={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="count" fill="var(--color-created)" radius={6} />
                </BarChart>
              </ChartContainer>
              <ChartLegend content={<ChartLegendContent />} />
            </>
          )}
        </CardContent>
      </CardMain>
    </div>
  );
}