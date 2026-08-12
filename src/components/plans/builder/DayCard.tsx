import { Link } from "react-router";
import { useDroppable } from "@dnd-kit/react";
import { Activity, Edit3, Layers3, Moon } from "lucide-react";
import { BuilderExerciseCard } from "./BuilderExerciseCard";
import type { BuilderDay, BuilderPlannedExercise } from "./builder-types";
import { formatDate } from "./builder-utils";

export function DayCard({
    day,
    weekNumber,
    programId,
    onEdit,
    onCreateExercise,
    onExerciseEdit,
    onExerciseDelete,
    onToggleRestDay,
    isReordering,
}: {
    day: BuilderDay;
    weekNumber: number;
    programId: string;
    onEdit: (day: BuilderDay) => void;
    onCreateExercise: (day: BuilderDay) => void;
    onExerciseEdit: (exercise: BuilderPlannedExercise) => void;
    onExerciseDelete: (exercise: BuilderPlannedExercise) => void;
    onToggleRestDay: (day: BuilderDay) => void;
    isReordering: boolean;
}) {
    const { ref, isDropTarget } = useDroppable({
        id: day.id,
        data: { kind: "day" as const, dayId: day.id },
        disabled: day.isRestDay,
    });

    return (
        <section
            ref={ref}
            className={`flex h-180 w-[20rem] shrink-0 flex-col overflow-hidden rounded-3xl border p-4 shadow-sm transition ${day.isRestDay
                ? "border-border bg-muted/35 opacity-80"
                : isDropTarget
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Week {weekNumber}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold uppercase  text-muted-foreground">
                        Day {day.dayNumber}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-foreground">
                        {day.name ?? `-`}
                    </h3>
                </div>
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${day.isRestDay
                        ? "bg-warn/10 text-warn"
                        : "bg-success/10 text-success"
                        }`}
                >
                    {day.isRestDay ? "Rest" : "Training"}
                </span>
                <Link
                    to={`/dashboard/plans/${programId}/days/${day.id}/log`}
                    className="inline-flex size-7 items-center justify-center rounded-xl border border-border text-muted-foreground hover:border-brand/40 hover:bg-brand/10 hover:text-brand transition"
                    title="View day log"
                    aria-label={`View log for Day ${day.dayNumber}`}
                >
                    <Activity className="size-3.5" />
                </Link>
            </div>

            <div className="mt-3 flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onEdit(day)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
                >
                    <Edit3 className="size-3.5" />
                    Edit day
                </button>
                <button
                    type="button"
                    onClick={() => onToggleRestDay(day)}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${day.isRestDay
                        ? "border-warn/30 bg-warn/10 text-warn hover:bg-warn/20"
                        : "border-border text-foreground hover:bg-muted"
                        }`}
                    title={day.isRestDay ? "Mark as training day" : "Mark as rest day"}
                >
                    <Moon className="size-3.5" />
                    {day.isRestDay ? "Rest day" : "Set rest"}
                </button>
            </div>

            <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                <div>
                    <span className="block font-semibold uppercase tracking-[0.14em]">
                        Scheduled
                    </span>
                    <span className="mt-1 block text-foreground">
                        {formatDate(day.scheduledDate)}
                    </span>
                </div>
                <div>
                    <span className="block font-semibold uppercase tracking-[0.14em]">
                        Notes
                    </span>
                    <span className="mt-1 block text-foreground">
                        {day.notes?.trim() ? day.notes : "No notes"}
                    </span>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <Layers3 className="size-3.5" />
                Exercises
            </div>

            <button
                type="button"
                onClick={() => onCreateExercise(day)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
                <Edit3 className="size-3.5" />
                Create new exercise
            </button>

            <div className="mt-3 relative flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-y-contain rounded-2xl border border-dashed border-border/70 bg-muted/20 p-3 pr-2">
                {isReordering && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-[2px]">
                        <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm border border-border">
                            <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Saving order…
                        </div>
                    </div>
                )}
                {day.isRestDay ? (
                    <p className="m-auto text-center text-sm text-muted-foreground">
                        Rest days do not accept exercises.
                    </p>
                ) : day.exercises.length === 0 ? (
                    <p className="m-auto text-center text-sm text-muted-foreground/80">
                        Drop exercises here
                    </p>
                ) : (
                    day.exercises
                        .slice()
                        .sort((a, b) => a.position - b.position)
                        .map((exercise) => (
                            <BuilderExerciseCard
                                key={exercise.id}
                                exercise={exercise}
                                dayId={day.id}
                                onEdit={onExerciseEdit}
                                onDelete={onExerciseDelete}
                            />
                        ))
                )}
            </div>
        </section>
    );
}