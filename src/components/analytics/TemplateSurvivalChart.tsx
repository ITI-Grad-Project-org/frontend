import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import type { TemplateSurvival } from "@/types/analytics";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const survivalConfig = {
  retentionPct: {
    label: "Still training",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

interface TemplateSurvivalChartProps {
  survival: TemplateSurvival | null;
  loading: boolean;
  error: string;
  onRetry: () => void;
}

export function TemplateSurvivalChart({
  survival,
  loading,
  error,
  onRetry,
}: TemplateSurvivalChartProps) {
  if (loading) {
    return <div className="h-56 animate-pulse rounded-2xl bg-muted/40" />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm text-destructive">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-ink-foreground transition hover:opacity-90 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!survival || survival.weeks.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No survival data for this template yet.
      </div>
    );
  }

  const data = survival.weeks.map((week) => ({
    week: `W${week.week}`,
    retentionPct: Math.round(week.retentionPct * 10) / 10,
    clientsActive: week.clientsActive,
  }));

  return (
    <ChartContainer config={survivalConfig} className="h-56 w-full min-w-0">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="survivalFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-border)" />
        <XAxis
          dataKey="week"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={40}
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          tickFormatter={(v: number) => `${v}%`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => `${value}%`}
              labelFormatter={(label, payload) =>
                payload?.[0]?.payload?.clientsActive != null
                  ? `${label} · ${payload[0].payload.clientsActive} clients`
                  : label
              }
            />
          }
        />
        <Area
          dataKey="retentionPct"
          type="monotone"
          stroke="var(--color-info)"
          strokeWidth={2.5}
          fill="url(#survivalFill)"
          dot={{ r: 3, fill: "var(--color-info)", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}