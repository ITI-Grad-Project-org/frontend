import { useMemo } from "react";
import type { WorkoutLog, WorkoutLogSet } from "@/types/plans";
import CardMain from "@/components/cards/CardMain";
import {
  AdherenceRows,
  LogCardHeader,
  OutcomeRing,
  StatHero,
  VolumeRows,
  type OutcomeRingEntry,
} from "@/components/logs/LogVisuals";

const OUTCOME_ORDER = ["completed", "skipped", "failed", "partial"] as const;

const OUTCOME_META: Record<string, { label: string; color: string }> = {
  completed: { label: "Completed", color: "var(--color-success)" },
  skipped: { label: "Skipped", color: "var(--color-warn)" },
  failed: { label: "Failed", color: "var(--color-danger)" },
  partial: { label: "Partial", color: "var(--color-info)" },
};

function prescribedMidpoint(set: WorkoutLogSet): number | null {
  if (set.prescribedRepsMin != null && set.prescribedRepsMax != null) {
    return (set.prescribedRepsMin + set.prescribedRepsMax) / 2;
  }
  return set.prescribedRepsMin ?? set.prescribedRepsMax;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
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

  const adherenceOverall = useMemo(() => {
    const prescribedSum = adherenceData.reduce((sum, d) => sum + d.prescribed, 0);
    const actualSum = adherenceData.reduce((sum, d) => sum + d.actual, 0);
    return prescribedSum > 0 ? Math.round((actualSum / prescribedSum) * 100) : null;
  }, [adherenceData]);

  const volumeData = useMemo(
    () =>
      exerciseData
        .filter((e) => e.volume > 0)
        .map((e) => ({ name: e.name, volume: Math.round(e.volume) }))
        .sort((a, b) => b.volume - a.volume),
    [exerciseData]
  );

  const totalVolume = useMemo(
    () => volumeData.reduce((sum, d) => sum + d.volume, 0),
    [volumeData]
  );

  const outcomeData = useMemo<OutcomeRingEntry[]>(() => {
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
        label: OUTCOME_META[outcome]?.label ?? outcome,
        color: OUTCOME_META[outcome]?.color ?? "var(--color-muted)",
      }))
      .sort(
        (a, b) =>
          OUTCOME_ORDER.indexOf(a.outcome as (typeof OUTCOME_ORDER)[number]) -
          OUTCOME_ORDER.indexOf(b.outcome as (typeof OUTCOME_ORDER)[number])
      );
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Adherence */}
      <CardMain className="min-w-0 overflow-hidden">
        <LogCardHeader
          eyebrow="Adherence"
          title="Prescribed vs actual reps"
          description="Average rep target vs reps actually performed, per exercise"
        />
        <div className="flex flex-1 flex-col gap-6">
          {adherenceData.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
              No performed sets with rep data yet
            </div>
          ) : (
            <>
              <StatHero
                value={adherenceOverall == null ? "—" : `${adherenceOverall}%`}
                caption={
                  adherenceOverall == null
                    ? "No prescribed rep targets to compare"
                    : `of prescribed rep targets hit across ${adherenceData.length} exercise${adherenceData.length === 1 ? "" : "s"}`
                }
              />
              <AdherenceRows data={adherenceData} />
            </>
          )}
        </div>
      </CardMain>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Volume by Exercise */}
        <CardMain className="min-w-0 overflow-hidden lg:col-span-2">
          <LogCardHeader
            eyebrow="Load"
            title="Volume by exercise"
            description="Total weight lifted (kg × reps) across all sessions"
          />
          <div className="flex flex-1 flex-col gap-6">
            {volumeData.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                No volume data yet
              </div>
            ) : (
              <>
                <StatHero
                  value={totalVolume.toLocaleString()}
                  unit="kg"
                  caption={`total load across ${volumeData.length} exercise${volumeData.length === 1 ? "" : "s"}`}
                />
                <VolumeRows data={volumeData} />
              </>
            )}
          </div>
        </CardMain>

        {/* Set Outcomes */}
        <CardMain className="min-w-0 overflow-hidden">
          <LogCardHeader
            eyebrow="Outcomes"
            title="Set outcomes"
            description="Results of all performed sets"
          />
          <div className="flex flex-1 flex-col gap-6">
            {outcomeData.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                No sets logged yet
              </div>
            ) : (
              <OutcomeRing data={outcomeData} />
            )}
          </div>
        </CardMain>
      </div>
    </div>
  );
}