import { useMemo, useState } from "react";
import { ChevronRight, Filter as FilterIcon, Scale } from "lucide-react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
} from "recharts";
import type { ClientMeasurement } from "@/types/client";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import CardMain from "@/components/cards/CardMain";
import { Pagination } from "@/components/ui/Pagination";
import { useClientMeasurements } from "@/hooks/clients/useClientMeasurements";
import MeasurementDetailsModal from "@/components/modals/clients/MeasurementDetailsModal";

const PAGE_SIZE = 10;

const weightConfig = {
  weight: { label: "Weight", color: "var(--chart-2)" },
} satisfies ChartConfig;

const bodyFatConfig = {
  bodyFat: { label: "Body fat", color: "var(--chart-3)" },
} satisfies ChartConfig;

function formatAxisDate(value: string): string {
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatLongDate(value: string): string {
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmt(value: number | null | undefined, suffix: string): string {
  return value == null ? "N/A" : `${value}${suffix}`;
}

interface StatTile {
  key: string;
  label: string;
  value: string;
}

function buildTiles(latest: ClientMeasurement | null): StatTile[] {
  if (!latest) return [];
  return [
    { key: "weight", label: "Weight", value: fmt(latest.weightKg, " kg") },
    { key: "body-fat", label: "Body fat", value: fmt(latest.bodyFatPct, "%") },
    { key: "chest", label: "Chest", value: fmt(latest.chestCm, " cm") },
    { key: "waist", label: "Waist", value: fmt(latest.waistCm, " cm") },
    { key: "hips", label: "Hips", value: fmt(latest.hipsCm, " cm") },
    { key: "arm", label: "Arm", value: fmt(latest.armCm, " cm") },
    { key: "thigh", label: "Thigh", value: fmt(latest.thighCm, " cm") },
  ];
}

interface MeasurementsPanelProps {
  clientId: string;
}

export function MeasurementsPanel({ clientId }: MeasurementsPanelProps) {
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { docs, meta, loading, error, refetch } = useClientMeasurements(clientId, {
    page,
    limit: PAGE_SIZE,
    from: from || undefined,
    to: to || undefined,
  });

  const sortedAsc = useMemo(
    () => [...docs].sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)),
    [docs],
  );
  const sortedDesc = useMemo(
    () => [...docs].sort((a, b) => b.measuredAt.localeCompare(a.measuredAt)),
    [docs],
  );

  const trendData = useMemo(
    () =>
      sortedAsc.map((m) => ({
        date: formatAxisDate(m.measuredAt),
        weight: m.weightKg,
        bodyFat: m.bodyFatPct,
      })),
    [sortedAsc],
  );

  const latest = sortedDesc[0] ?? null;
  const tiles = useMemo(() => buildTiles(latest), [latest]);

  const applyFilters = () => {
    setPage(1);
  };

  const clearFilters = () => {
    setFrom("");
    setTo("");
    setPage(1);
  };

  const hasFilters = from !== "" || to !== "";

  const inputCls =
    "h-10 rounded-xl border border-border bg-muted/40 px-3 text-sm text-foreground outline-none focus:border-brand transition-colors";

  return (
    <div className="flex flex-col gap-6">
      {/* Filter bar */}
      <CardMain className="gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Body measurements</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Track weight, body composition and circumference history.
            </p>
          </div>
          {docs.length > 0 && (
            <div className="flex flex-wrap items-end gap-2.5">
              <label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
                From
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
                To
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className={inputCls}
                />
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={applyFilters}
                  disabled={!hasFilters}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FilterIcon className="h-4 w-4" />
                  Apply
                </button>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex h-10 items-center rounded-xl border border-border bg-muted/40 px-4 text-sm font-semibold text-muted-foreground transition hover:bg-muted cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {docs.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
            {tiles.map((tile) => (
              <div
                key={tile.key}
                className="flex flex-col gap-1 rounded-2xl border border-border/50 bg-muted/40 p-3"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {tile.label}
                </span>
                <span className="text-base font-extrabold text-foreground">{tile.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardMain>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CardMain className="min-h-56"><div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading measurements…</div></CardMain>
          <CardMain className="min-h-56"><div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading measurements…</div></CardMain>
        </div>
      ) : error ? (
        <CardMain>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex h-10 items-center rounded-xl bg-ink px-4 text-sm font-semibold text-ink-foreground transition hover:opacity-90 cursor-pointer"
            >
              Retry
            </button>
          </CardContent>
        </CardMain>
      ) : docs.length === 0 ? (
        <CardMain className="items-center justify-center py-14 text-center">
          <Scale className="mb-3 h-8 w-8 text-muted-foreground/60" />
          <p className="text-lg font-medium text-muted-foreground">
            {hasFilters ? "No measurements in this range" : "No measurements recorded yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            {hasFilters
              ? "Try widening the date range or clearing the filters."
              : "Measurements clients log will appear here over time."}
          </p>
        </CardMain>
      ) : (
        <>
          {/* Trend charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CardMain className="min-w-0 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Weight trend</CardTitle>
                <CardDescription>Body weight across recorded sessions (kg)</CardDescription>
              </CardHeader>
              <CardContent className="min-w-0 overflow-hidden flex-1">
                {trendData.length < 2 ? (
                  <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
                    Log at least two measurements to see a trend.
                  </div>
                ) : (
                  <ChartContainer config={weightConfig} className="h-65 w-full min-w-0">
                    <RechartsLineChart accessibilityLayer data={trendData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                      <CartesianGrid vertical={false} stroke="var(--color-border)" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        interval="preserveStartEnd"
                        tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        width={40}
                        domain={["dataMin - 2", "dataMax + 2"]}
                        tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                      <Line
                        dataKey="weight"
                        type="monotone"
                        stroke="var(--color-weight)"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    </RechartsLineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </CardMain>

            <CardMain className="min-w-0 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Body fat trend</CardTitle>
                <CardDescription>Body fat percentage across recorded sessions</CardDescription>
              </CardHeader>
              <CardContent className="min-w-0 overflow-hidden flex-1">
                {trendData.filter((d) => d.bodyFat != null).length < 2 ? (
                  <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
                    Log at least two body-fat measurements to see a trend.
                  </div>
                ) : (
                  <ChartContainer config={bodyFatConfig} className="h-65 w-full min-w-0">
                    <RechartsBarChart accessibilityLayer data={trendData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                      <CartesianGrid vertical={false} stroke="var(--color-border)" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        interval="preserveStartEnd"
                        tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        width={40}
                        domain={["dataMin - 1", "dataMax + 1"]}
                        tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                      />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                      <Bar
                        dataKey="bodyFat"
                        fill="var(--color-bodyFat)"
                        radius={6}
                        maxBarSize={36}
                      />
                    </RechartsBarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </CardMain>
          </div>

          {/* Measurement list */}
          <CardMain className="gap-4">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">History</CardTitle>
              <CardDescription>
                {meta.total} measurement{meta.total === 1 ? "" : "s"} in the current range
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60">
                {sortedDesc.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedId(m.id)}
                    className="flex w-full items-center justify-between gap-3 bg-background/60 px-4 py-3 text-left transition hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="shrink-0">
                        <span className="block text-sm font-bold text-foreground">
                          {formatAxisDate(m.measuredAt)}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {m.measuredAt ? formatLongDate(m.measuredAt).split(",")[0] : ""}
                        </span>
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-bold text-foreground">
                          {fmt(m.weightKg, " kg")}
                        </span>
                        <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-bold text-foreground">
                          {fmt(m.bodyFatPct, "% fat")}
                        </span>
                        {m.photos.length > 0 && (
                          <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                            {m.photos.length} photo{m.photos.length === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                  </button>
                ))}
              </div>
            </CardContent>
          </CardMain>

          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <MeasurementDetailsModal
        clientId={clientId}
        measurementId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}