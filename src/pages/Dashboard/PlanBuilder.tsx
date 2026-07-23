import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { DragDropProvider, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/react";
import { ChevronRight, CalendarDays, Layers3, Trash2 } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { getClientProgram } from "@/services/plans";
import { useExercisesData } from "@/hooks/useExercisesData";
import type { ClientProgramDay, ClientProgramTree, ClientProgramWeek } from "@/types/plans";
import type { Exercise } from "@/types/exercise";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type BuilderPlannedExercise = {
    id: string;
    exerciseId: string;
    exerciseName: string;
    position: number;
    restSeconds: number;
    notes: string | null;
};

type BuilderDay = Omit<ClientProgramDay, "exercises"> & {
    exercises: BuilderPlannedExercise[];
};

type BuilderWeek = Omit<ClientProgramWeek, "days"> & {
    days: BuilderDay[];
};

function formatDate(value: string | null | undefined) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

function formatDateTime(value: string | null | undefined) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function normalizeExercises(nodes: ClientProgramDay["exercises"]): BuilderPlannedExercise[] {
    return nodes.map((node, index) => {
        const typedNode = node as Record<string, unknown>;

        return {
            id: String(typedNode.id ?? `exercise-${index + 1}`),
            exerciseId: String(typedNode.exerciseId ?? typedNode.id ?? `exercise-${index + 1}`),
            exerciseName: String(
                typedNode.exerciseName ??
                typedNode.name ??
                typedNode.title ??
                `Exercise ${index + 1}`,
            ),
            position: Number(typedNode.position ?? index + 1),
            restSeconds: Number(typedNode.restSeconds ?? 90),
            notes: (typedNode.notes as string | null | undefined) ?? null,
        };
    });
}

function buildWeeks(weeks: ClientProgramTree["weeks"]): BuilderWeek[] {
    return weeks.map((week) => ({
        ...week,
        days: week.days.map((day) => ({
            ...day,
            exercises: normalizeExercises(day.exercises),
        })),
    }));
}

function getExerciseSummary(exercise: Exercise) {
    return exercise.primaryMuscle.replaceAll("_", " ");
}

function getOverlayExercise(data: unknown): Exercise | null {
    if (!data || typeof data !== "object") {
        return null;
    }

    const candidate = data as Partial<Exercise>;
    if (!candidate.id || !candidate.name || !candidate.primaryMuscle) {
        return null;
    }

    return candidate as Exercise;
}

function LibraryExerciseCard({ exercise }: { exercise: Exercise }) {
    const { ref, isDragging } = useDraggable({
        id: exercise.id,
        data: exercise,
    });

    return (
        <button
            ref={ref}
            type="button"
            className={`w-full cursor-grab select-none rounded-2xl border px-3 py-2.5 text-left shadow-sm transition active:cursor-grabbing ${isDragging
                ? "border-primary bg-primary/5 opacity-40"
                : "border-border bg-background hover:border-foreground/20 hover:bg-muted/40"
                }`}
        >
            <p className="font-semibold text-foreground">{exercise.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                {getExerciseSummary(exercise)}
            </p>
        </button>
    );
}

function LibraryExercisePreview({ exercise }: { exercise: Exercise }) {
    return (
        <div className="cursor-grabbing select-none rounded-2xl border border-primary bg-background px-3 py-2.5 text-sm shadow-lg">
            <p className="font-semibold text-foreground">{exercise.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                {getExerciseSummary(exercise)}
            </p>
        </div>
    );
}

function BuilderExerciseCard({
    exercise,
    onRemove,
}: {
    exercise: BuilderPlannedExercise;
    onRemove: (plannedExerciseId: string) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background px-3 py-2.5 shadow-sm">
            <div>
                <p className="font-semibold text-foreground">{exercise.exerciseName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    {exercise.restSeconds}s rest
                    {exercise.notes ? ` · ${exercise.notes}` : ""}
                </p>
            </div>
            <button
                type="button"
                onClick={() => onRemove(exercise.id)}
                className="rounded-full p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${exercise.exerciseName}`}
            >
                <Trash2 className="size-3.5" />
            </button>
        </div>
    );
}

function DayCard({
    day,
    onRemove,
}: {
    day: BuilderDay;
    onRemove: (plannedExerciseId: string) => void;
}) {
    const { ref, isDropTarget } = useDroppable({
        id: day.id,
        disabled: day.isRestDay,
    });

    return (
        <section
            ref={ref}
            className={`flex h-[34rem] w-[20rem] flex-shrink-0 flex-col overflow-hidden rounded-3xl border p-4 shadow-sm transition ${day.isRestDay
                ? "border-border bg-muted/35 opacity-80"
                : isDropTarget
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Day {day.dayNumber}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-foreground">
                        {day.name ?? `Day ${day.dayNumber}`}
                    </h3>
                </div>
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${day.isRestDay
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}
                >
                    {day.isRestDay ? "Rest" : "Training"}
                </span>
            </div>

            <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="rounded-2xl bg-muted/40 px-3 py-2">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.14em]">
                        Rest
                    </span>
                    <span className="mt-1 block text-foreground">
                        {day.isRestDay ? "Yes" : "No"}
                    </span>
                </div>
                <div className="rounded-2xl bg-muted/40 px-3 py-2">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.14em]">
                        Scheduled
                    </span>
                    <span className="mt-1 block text-foreground">
                        {formatDate(day.scheduledDate)}
                    </span>
                </div>
                <div className="rounded-2xl bg-muted/40 px-3 py-2 sm:col-span-2">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.14em]">
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

            <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-2xl border border-dashed border-border/70 bg-muted/20 p-3 pr-2">
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
                                onRemove={onRemove}
                            />
                        ))
                )}
            </div>
        </section>
    );
}

export default function PlanBuilder() {
    const { programId } = useParams();
    const location = useLocation();
    const [program, setProgram] = useState<ClientProgramTree | null>(null);
    const [builderWeeks, setBuilderWeeks] = useState<BuilderWeek[]>([]);
    const [selectedWeekId, setSelectedWeekId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const clientName = (location.state as { clientName?: string } | null)?.clientName ?? "Unknown client";
    const { filteredExercises, loading: exercisesLoading, error: exercisesError } = useExercisesData();

    useEffect(() => {
        let isActive = true;

        if (!programId) {
            setProgram(null);
            setError("Missing plan id.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError("");

        void (async () => {
            try {
                const data = await getClientProgram(programId);

                if (!isActive) {
                    return;
                }

                setProgram(data);
                setBuilderWeeks(buildWeeks(data.weeks));
            } catch (fetchError) {
                if (isActive) {
                    setError(
                        getApiErrorMessage(
                            fetchError,
                            "We could not load this plan.",
                        ),
                    );
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        })();

        return () => {
            isActive = false;
        };
    }, [programId]);

    useEffect(() => {
        if (!builderWeeks.length) {
            setSelectedWeekId("");
            return;
        }

        setSelectedWeekId((currentWeekId) => {
            const nextWeekExists = builderWeeks.some((week) => week.id === currentWeekId);
            return nextWeekExists ? currentWeekId : builderWeeks[0].id;
        });
    }, [builderWeeks]);

    const selectedWeek = useMemo(
        () => builderWeeks.find((week) => week.id === selectedWeekId) ?? builderWeeks[0] ?? null,
        [builderWeeks, selectedWeekId],
    );

    function handleDragEnd(event: any) {
        if (event.canceled) {
            return;
        }

        const { source, target } = event.operation;
        const exercise = getOverlayExercise(source?.data);
        if (!exercise || !target) {
            return;
        }

        const targetDayId = String(target.id);

        setBuilderWeeks((prevWeeks) =>
            prevWeeks.map((week) => ({
                ...week,
                days: week.days.map((day) => {
                    if (day.id !== targetDayId || day.isRestDay) {
                        return day;
                    }

                    const newExercise: BuilderPlannedExercise = {
                        id: `${exercise.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        exerciseId: exercise.id,
                        exerciseName: exercise.name,
                        position: day.exercises.length + 1,
                        restSeconds: 90,
                        notes: null,
                    };

                    return {
                        ...day,
                        exercises: [...day.exercises, newExercise],
                    };
                }),
            })),
        );
    }

    function handleRemove(plannedExerciseId: string) {
        setBuilderWeeks((prevWeeks) =>
            prevWeeks.map((week) => ({
                ...week,
                days: week.days.map((day) => ({
                    ...day,
                    exercises: day.exercises.filter((exercise) => exercise.id !== plannedExerciseId),
                })),
            })),
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Plan Builder
                    </p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
                        {program ? (
                            <div>
                                <div>{program.name}</div>
                                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-base font-normal text-muted-foreground">
                                    <span>For {clientName}</span>
                                    <span>·</span>
                                    <span>{program.goal}</span>
                                    <span>·</span>
                                    <span>{program.difficulty}</span>
                                    {/* {program.status && (
                                        <>
                                            <span>·</span>
                                            <span className="capitalize font-medium text-foreground/80">
                                                {program.status}
                                            </span>
                                        </>
                                    )} */}
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-muted-foreground">
                                    <span>
                                        <span className="font-semibold text-foreground">Start date</span>{": "}
                                        {formatDate(program.startDate)}
                                    </span>
                                    <span>
                                        <span className="font-semibold text-foreground">End date</span>{": "}
                                        {formatDate(program.endDate)}
                                    </span>
                                    <span>
                                        <span className="font-semibold text-foreground">Status</span>{": "}
                                        {program.status ?? "—"}
                                    </span>
                                    <span>
                                        <span className="font-semibold text-foreground">Archived</span>{": "}
                                        {program.isArchived ? "Yes" : "No"}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            "Loading plan..."
                        )}
                    </h1>
                </div>
            </div>

            <div>
                <Link
                    to="/dashboard/plans"
                    className="inline-flex items-center justify-center rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                    ← Back to plans
                </Link>
            </div>

            {isLoading && (
                <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
                    Loading plan...
                </div>
            )}

            {!isLoading && error && (
                <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
                    {error}
                </div>
            )}

            {!isLoading && program && (
                <DragDropProvider onDragEnd={handleDragEnd}>
                    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                        <aside className="flex max-h-[calc(100vh-14rem)] flex-col rounded-3xl border border-border bg-card p-4 shadow-(--shadow-card)">
                            <div className="flex items-center gap-2">
                                {/* <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                                    <ChevronRight className="size-4 rotate-90" />
                                </div> */}
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                        Exercise Library
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Drag one card onto a day.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
                                {exercisesLoading ? (
                                    <p className="rounded-2xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                                        Loading exercises...
                                    </p>
                                ) : exercisesError ? (
                                    <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-6 text-center text-sm text-destructive">
                                        {exercisesError}
                                    </p>
                                ) : filteredExercises.length === 0 ? (
                                    <p className="rounded-2xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                                        No exercises found.
                                    </p>
                                ) : (
                                    filteredExercises.map((exercise) => (
                                        <LibraryExerciseCard key={exercise.id} exercise={exercise} />
                                    ))
                                )}
                            </div>
                        </aside>

                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card px-4 py-3 shadow-(--shadow-card)">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                        Weeks
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Choose the week you want to edit.
                                    </p>
                                </div>

                                <Select
                                    value={selectedWeekId}
                                    onValueChange={setSelectedWeekId}
                                    disabled={!builderWeeks.length}
                                >
                                    <SelectTrigger className="min-w-44 rounded-2xl border-border bg-background px-4 py-2.5">
                                        <SelectValue placeholder="Select week" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {builderWeeks.map((week) => (
                                            <SelectItem key={week.id} value={week.id}>
                                                Week {week.weekNumber}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedWeek ? (
                                <div className="rounded-3xl border border-border bg-card p-4 shadow-(--shadow-card)">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground">
                                                Week {selectedWeek.weekNumber}
                                            </h2>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {selectedWeek.notes ? selectedWeek.notes : "No notes"}
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                                            <CalendarDays className="size-3.5" />
                                            {selectedWeek.days.length} days
                                        </div>
                                    </div>

                                    <div className="mt-4 overflow-x-auto pb-2">
                                        <div className="flex min-w-max items-start gap-3">
                                            {selectedWeek.days.map((day) => (
                                                <DayCard
                                                    key={day.id}
                                                    day={day}
                                                    onRemove={handleRemove}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
                                    No weeks available for this plan.
                                </div>
                            )}
                        </div>
                    </div>

                    <DragOverlay>
                        {(source) => {
                            const exercise = getOverlayExercise(source.data);
                            return exercise ? <LibraryExercisePreview exercise={exercise} /> : null;
                        }}
                    </DragOverlay>
                </DragDropProvider>
            )}
        </div>
    );
}
