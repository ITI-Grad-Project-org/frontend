import { Dumbbell, Layers } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PrescribedDayInfo, WorkoutLog, WorkoutLogSet, PlannedExerciseSet } from "@/types/plans";
import { OutcomeBadge } from "./OutcomeBadge";

interface PlanDayLogComparisonTableProps {
  prescription: PrescribedDayInfo;
  workoutLog: WorkoutLog | null;
}

export function PlanDayLogComparisonTable({ prescription, workoutLog }: PlanDayLogComparisonTableProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Layers className="size-5 text-brand" />
          <div>
            <h2 className="text-lg font-bold text-foreground">Prescription vs Logged Execution</h2>
            <p className="text-xs text-muted-foreground">
              Side-by-side comparison of planned exercises/sets and actual client workout log
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-8">
        {prescription.exercises.map((pExercise) => {
          const loggedEx = workoutLog?.exercises?.find(
            (e) => e.plannedExerciseId === pExercise.id || e.exerciseId === pExercise.exerciseId
          );

          return (
            <div
              key={pExercise.id}
              className="rounded-2xl border border-border bg-background p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    #{pExercise.position} {pExercise.exerciseName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Rest: {pExercise.restSeconds ?? 90}s {pExercise.tempo ? `· Tempo: ${pExercise.tempo}` : ""}
                    {pExercise.coachNotes ? ` · Coach Notes: ${pExercise.coachNotes}` : ""}
                  </p>
                </div>
                <Avatar className="size-12 border border-border shrink-0 bg-muted">
                  {pExercise.demoGifUrl ? (
                    <AvatarImage
                      src={pExercise.demoGifUrl}
                      alt={pExercise.exerciseName}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <Dumbbell className="size-5" />
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider">
                      <th className="py-2 px-3">Set #</th>
                      <th className="py-2 px-3 bg-muted/30">Prescribed Type</th>
                      <th className="py-2 px-3 bg-muted/30">Prescribed Reps</th>
                      <th className="py-2 px-3 bg-muted/30">Prescribed Weight</th>
                      <th className="py-2 px-3 bg-muted/30">Prescribed Intensity</th>
                      <th className="py-2 px-3 bg-brand/5 text-brand">Logged Reps</th>
                      <th className="py-2 px-3 bg-brand/5 text-brand">Logged Weight</th>
                      <th className="py-2 px-3 bg-brand/5 text-brand">Logged RPE</th>
                      <th className="py-2 px-3 bg-brand/5 text-brand">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {pExercise.sets.map((pSet: PlannedExerciseSet, idx: number) => {
                      const lSet: WorkoutLogSet | undefined = loggedEx?.sets?.find(
                        (ls) => ls.plannedSetId === pSet.id || ls.setNumber === pSet.setNumber
                      );

                      return (
                        <tr key={pSet.id || idx} className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 font-bold text-foreground">
                            Set {pSet.setNumber}
                          </td>
                          <td className="py-2.5 px-3 bg-muted/10 text-muted-foreground capitalize">
                            {pSet.setType}
                          </td>
                          <td className="py-2.5 px-3 bg-muted/10 text-muted-foreground">
                            {pSet.repsMin != null && pSet.repsMax != null
                              ? `${pSet.repsMin} - ${pSet.repsMax}`
                              : pSet.repsMin ?? pSet.repsMax ?? "—"}
                          </td>
                          <td className="py-2.5 px-3 bg-muted/10 text-muted-foreground">
                            {pSet.weightKg != null ? `${pSet.weightKg} kg` : "—"}
                          </td>
                          <td className="py-2.5 px-3 bg-muted/10 text-muted-foreground uppercase">
                            {pSet.intensityType ? `${pSet.intensityType} ${pSet.intensityValue ?? ""}` : "—"}
                          </td>

                          <td className="py-2.5 px-3 bg-brand/5 font-semibold text-foreground">
                            {lSet?.reps != null ? lSet.reps : "—"}
                          </td>
                          <td className="py-2.5 px-3 bg-brand/5 font-semibold text-foreground">
                            {lSet?.weightKg != null ? `${lSet.weightKg} kg` : "—"}
                          </td>
                          <td className="py-2.5 px-3 bg-brand/5 font-semibold text-foreground">
                            {lSet?.rpe != null ? lSet.rpe : "—"}
                          </td>
                          <td className="py-2.5 px-3 bg-brand/5">
                            {lSet ? <OutcomeBadge outcome={lSet.outcome} /> : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
