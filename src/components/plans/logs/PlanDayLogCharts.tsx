import { useMemo } from "react";
import type {
  PrescribedDayInfo,
  PrescribedDayExercise,
  WorkoutLog,
  WorkoutLogExercise,
} from "@/types/plans";
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

  const adherenceOverall = useMemo(() => {
    const prescribedSum = adherenceData.reduce((sum, d) => sum + d.prescribed, 0);
    const actualSum = adherenceData.reduce((sum, d) => sum + d.actual, 0);
    return prescribedSum > 0 ? Math.round((actualSum / prescribedSum) * 100) : null;
  }, [adherenceData]);

  const volumeData = useMemo(
    () =>
      insights
        .filter((i) => i.volume > 0)
        .map((i) => ({ name: i.name, volume: Math.round(i.volume) }))
        .sort((a, b) => b.volume - a.volume),
    [insights]
  );

  const totalVolume = useMemo(
    () => volumeData.reduce((sum, d) => sum + d.volume, 0),
    [volumeData]
  );

  const outcomeData = useMemo<OutcomeRingEntry[]>(() => {
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
        label: OUTCOME_META[outcome]?.label ?? outcome,
        color: OUTCOME_META[outcome]?.color ?? "var(--color-muted)",
      }))
      .sort(
        (a, b) =>
          OUTCOME_ORDER.indexOf(a.outcome as (typeof OUTCOME_ORDER)[number]) -
          OUTCOME_ORDER.indexOf(b.outcome as (typeof OUTCOME_ORDER)[number])
      );
  }, [workoutLog]);

  const hasLog = Boolean(workoutLog);

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
              No prescribed exercises yet
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
            description="Total weight lifted (kg × reps) in this session"
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
            description="Results of this session's performed sets"
          />
          <div className="flex flex-1 flex-col gap-6">
            {!hasLog || outcomeData.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                No workout log recorded for this day
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