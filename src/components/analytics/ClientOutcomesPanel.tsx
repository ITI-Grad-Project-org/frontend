import { useMemo, useState } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { UserRound } from "lucide-react";
import { useClientsData } from "@/hooks/clients/useClientsData";
import { useClientProgress } from "@/hooks/analytics/useClientProgress";
import { StrengthProgressionList } from "@/components/analytics/StrengthProgressionList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const weightConfig = {
  weightKg: { label: "Weight", color: "var(--chart-1)" },
} satisfies ChartConfig;

const bodyFatConfig = {
  bodyFatPct: { label: "Body fat", color: "var(--chart-4)" },
} satisfies ChartConfig;

function clientName(conn: { client: { firstName?: string; lastName?: string; email?: string } }): string {
  const full = `${conn.client.firstName || ""} ${conn.client.lastName || ""}`.trim();
  return full || conn.client.email || "Unknown client";
}

interface ClientOutcomesPanelProps {
  from: string;
  to: string;
}

export function ClientOutcomesPanel({ from, to }: ClientOutcomesPanelProps) {
  const { clients } = useClientsData();
  const connections = clients.data;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const membershipId = selectedId ?? connections[0]?.id ?? "";
  const progress = useClientProgress(membershipId, from, to);

  const measurementData = useMemo(
    () =>
      (progress.progress?.measurements ?? []).map((m) => ({
        date: new Date(`${m.measuredOn}T00:00:00`).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        weightKg: m.weightKg,
        bodyFatPct: m.bodyFatPct,
      })),
    [progress.progress],
  );

  const strengthRows = useMemo(() => {
    const rows = (progress.progress?.strength ?? []).map((exercise) => ({
      name: exercise.exerciseName,
      latest: exercise.latestE1rmKg,
      gain: +(exercise.latestE1rmKg - exercise.firstE1rmKg).toFixed(2),
    }));
    return rows.sort((a, b) => b.gain - a.gain || b.latest - a.latest);
  }, [progress.progress]);

  const hasMeasurements = measurementData.length > 0;
  const hasStrength = strengthRows.length > 0;

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-(--shadow-card) sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black font-display tracking-tight text-foreground">
            Client outcomes
          </h2>
          <p className="text-sm text-muted-foreground">
            The rest of these pages measure whether the work got done. This measures whether it
            worked.
          </p>
        </div>
        {connections.length > 0 && (
          <Select value={membershipId || undefined} onValueChange={setSelectedId}>
            <SelectTrigger className="w-full sm:w-64">
              <UserRound className="size-4 text-muted-foreground" />
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {connections.map((conn) => (
                <SelectItem key={conn.id} value={conn.id}>
                  {clientName(conn)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {connections.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-10 text-center">
          <UserRound className="mb-3 size-8 text-muted-foreground/60" />
          <p className="text-lg font-medium text-foreground">No clients to measure yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Once clients log workouts and measurements, their outcomes show up here.
          </p>
        </div>
      ) : progress.loading ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="h-56 animate-pulse rounded-2xl bg-muted/40" />
          <div className="h-56 animate-pulse rounded-2xl bg-muted/40" />
        </div>
      ) : progress.error ? (
        <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-muted/30 p-4">
          <p className="text-sm text-destructive">{progress.error}</p>
          <button
            type="button"
            onClick={progress.refetch}
            className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-ink-foreground transition hover:opacity-90 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : !hasMeasurements && !hasStrength ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-lg font-medium text-foreground">Nothing to chart yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {clientName(connections.find((c) => c.id === membershipId) ?? connections[0])} has no
            logged measurements or strength data in this window.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {/* Measurements */}
          <div className="flex flex-col gap-4">
            {hasMeasurements ? (
              <>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Measurements
                  </p>
                  <ChartContainer config={weightConfig} className="h-48 w-full min-w-0">
                    <LineChart accessibilityLayer data={measurementData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="var(--color-border)" />
                      <XAxis
                        dataKey="date"
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
                        tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                        domain={["dataMin - 1", "dataMax + 1"]}
                      />
                      <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                      <Line
                        dataKey="weightKg"
                        name="Weight (kg)"
                        type="monotone"
                        stroke="var(--color-weightKg)"
                        strokeWidth={2.5}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 5 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ChartContainer>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Gaps are real gaps — a flat line means a flat client, not a missing entry.
                  </p>
                </div>
                <div>
                  <ChartContainer config={bodyFatConfig} className="h-44 w-full min-w-0">
                    <LineChart accessibilityLayer data={measurementData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="var(--color-border)" />
                      <XAxis
                        dataKey="date"
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
                        tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      />
                      <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                      <Line
                        dataKey="bodyFatPct"
                        name="Body fat (%)"
                        type="monotone"
                        stroke="var(--color-bodyFatPct)"
                        strokeWidth={2.5}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 5 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                No measurements in this window
              </div>
            )}
          </div>

          {/* Strength */}
          <div className="min-w-0">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Strength · Epley estimate (kg)
            </p>
            <StrengthProgressionList exercises={progress.progress?.strength ?? []} />
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Estimated 1-rep max from logged sets, capped at 12 reps — above that the Epley formula
              inflates enough to invent personal bests.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}