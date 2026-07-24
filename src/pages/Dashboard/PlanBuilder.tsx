import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { DragDropProvider, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/react";
import { CalendarDays, Edit3, GripVertical, Layers3, MonitorSmartphone, Moon, Send, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api";
import { deletePlannedExercise, getClientProgram, publishClientProgram, updatePlannedExercise, updateProgramDay } from "@/services/plans";
import { useExercisesData } from "@/hooks/useExercisesData";
import AddDayExerciseModal from "@/components/modals/AddDayExerciseModal";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import CreateExerciseAndAddToDayModal from "@/components/modals/CreateExerciseAndAddToDayModal";
import EditPlanDayModal from "@/components/modals/EditPlanDayModal";
import EditPlannedExerciseModal from "@/components/modals/EditPlannedExerciseModal";
import type {
    ClientProgramDay,
    ClientProgramTree,
    ClientProgramWeek,
    PlannedExercise,
    PlannedExerciseSet,
} from "@/types/plans";
import type { Exercise } from "@/types/exercise";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type BuilderPlannedExercise = PlannedExercise;

type BuilderSetType = PlannedExerciseSet["setType"];
type BuilderIntensityType = NonNullable<PlannedExerciseSet["intensityType"]>;

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

function normalizeExercises(dayId: string, nodes: ClientProgramDay["exercises"]): BuilderPlannedExercise[] {
    return nodes.map((node, index) => {
        const typedNode = node as Record<string, unknown>;
        const rawSets = Array.isArray(typedNode.sets) ? typedNode.sets : [];

        return {
            id: String(typedNode.id ?? `exercise-${index + 1}`),
            programDayId: String(typedNode.programDayId ?? dayId),
            exerciseId: String(typedNode.exerciseId ?? typedNode.id ?? `exercise-${index + 1}`),
            exerciseName: String(
                typedNode.exerciseName ??
                typedNode.name ??
                typedNode.title ??
                `Exercise ${index + 1}`,
            ),
            position: Number(typedNode.position ?? index + 1),
            supersetGroup:
                typedNode.supersetGroup === null || typedNode.supersetGroup === undefined
                    ? null
                    : Number(typedNode.supersetGroup),
            restSeconds: Number(typedNode.restSeconds ?? 90),
            tempo: (typedNode.tempo as string | null | undefined) ?? null,
            coachNotes:
                (typedNode.coachNotes as string | null | undefined) ??
                (typedNode.notes as string | null | undefined) ??
                null,
            sets: rawSets.map((set, setIndex) => {
                const setNode = set as Record<string, unknown>;

                return {
                    id: String(setNode.id ?? `set-${index + 1}-${setIndex + 1}`),
                    setNumber: Number(setNode.setNumber ?? setIndex + 1),
                    setType: (
                        setNode.setType === "warmup" ||
                            setNode.setType === "drop_set" ||
                            setNode.setType === "amrap" ||
                            setNode.setType === "to_failure"
                            ? setNode.setType
                            : "working"
                    ) as BuilderSetType,
                    repsMin:
                        setNode.repsMin === null || setNode.repsMin === undefined
                            ? null
                            : Number(setNode.repsMin),
                    repsMax:
                        setNode.repsMax === null || setNode.repsMax === undefined
                            ? null
                            : Number(setNode.repsMax),
                    weightKg:
                        setNode.weightKg === null || setNode.weightKg === undefined
                            ? null
                            : Number(setNode.weightKg),
                    intensityType:
                        setNode.intensityType === "rpe" ||
                            setNode.intensityType === "rir" ||
                            setNode.intensityType === "percent_1rm"
                            ? (setNode.intensityType as BuilderIntensityType)
                            : null,
                    intensityValue:
                        setNode.intensityValue === null || setNode.intensityValue === undefined
                            ? null
                            : Number(setNode.intensityValue),
                } satisfies PlannedExerciseSet;
            }),
        };
    });
}

function buildWeeks(weeks: ClientProgramTree["weeks"]): BuilderWeek[] {
    return weeks.map((week) => ({
        ...week,
        days: week.days.map((day) => ({
            ...day,
            exercises: normalizeExercises(day.id, day.exercises),
        })),
    }));
}

function getExerciseSummary(exercise: Exercise) {
    return exercise.primaryMuscle.replaceAll("_", " ");
}

function getExerciseDragData(exercise: PlannedExercise, dayId: string) {
    return {
        kind: "planned-exercise" as const,
        exercise,
        dayId,
    };
}

function reorderPlannedExercises(
    exercises: PlannedExercise[],
    draggedId: string,
    targetId: string,
): PlannedExercise[] {
    const ordered = exercises.slice().sort((a, b) => a.position - b.position);
    const fromIndex = ordered.findIndex((exercise) => exercise.id === draggedId);
    const toIndex = ordered.findIndex((exercise) => exercise.id === targetId);

    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
        return ordered;
    }

    const [moved] = ordered.splice(fromIndex, 1);
    ordered.splice(toIndex, 0, moved);

    return ordered.map((exercise, index) => ({
        ...exercise,
        position: index + 1,
    }));
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
    const { ref: dragRef, isDragging } = useDraggable({
        id: exercise.id,
        data: exercise,
    });

    return (
        <div
            className={`flex items-center gap-2 rounded-2xl border bg-background shadow-sm transition ${isDragging
                ? "border-primary bg-primary/5 opacity-40"
                : "border-border hover:border-foreground/20 hover:bg-muted/40"
                }`}
        >
            {/* Drag handle */}
            <button
                ref={dragRef}
                type="button"
                className="shrink-0 cursor-grab touch-none rounded-l-2xl px-2 py-3 text-muted-foreground/50 transition hover:text-muted-foreground active:cursor-grabbing"
                aria-label={`Drag ${exercise.name}`}
                tabIndex={-1}
            >
                <GripVertical className="size-4" />
            </button>

            {/* Content — not part of the drag sensor */}
            <div className="min-w-0 flex-1 select-none py-2.5 pr-3">
                <p className="font-semibold text-foreground">{exercise.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                    {getExerciseSummary(exercise)}
                </p>
            </div>
        </div>
    );
}

function LibraryExercisePreview({ exercise }: { exercise: Exercise }) {
    return (
        <div className="flex cursor-grabbing select-none items-center gap-2 rounded-2xl border border-primary bg-background shadow-lg">
            <div className="shrink-0 px-2 py-3 text-muted-foreground/50">
                <GripVertical className="size-4" />
            </div>
            <div className="min-w-0 flex-1 py-2.5 pr-3 text-sm">
                <p className="font-semibold text-foreground">{exercise.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                    {getExerciseSummary(exercise)}
                </p>
            </div>
        </div>
    );
}

function BuilderExerciseCard({
    exercise,
    dayId,
    onEdit,
    onDelete,
}: {
    exercise: BuilderPlannedExercise;
    dayId: string;
    onEdit: (exercise: BuilderPlannedExercise) => void;
    onDelete: (exercise: BuilderPlannedExercise) => void;
}) {
    const { ref: dragRef, isDragging } = useDraggable({
        id: exercise.id,
        data: getExerciseDragData(exercise, dayId),
    });
    const { ref: dropRef, isDropTarget } = useDroppable({
        id: exercise.id,
        data: getExerciseDragData(exercise, dayId),
    });

    return (
        <div
            ref={dropRef}
            className={`group flex items-start gap-2 rounded-2xl border bg-background px-2 py-2.5 shadow-sm transition ${isDragging
                ? "border-primary opacity-50"
                : isDropTarget
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
        >
            {/* Drag handle — only this element triggers the drag */}
            <button
                ref={dragRef}
                type="button"
                className="mt-0.5 shrink-0 cursor-grab touch-none rounded-lg p-1 text-muted-foreground/50 transition hover:text-muted-foreground active:cursor-grabbing"
                aria-label="Drag to reorder"
                tabIndex={-1}
            >
                <GripVertical className="size-4" />
            </button>

            {/* Position + content */}
            <button
                type="button"
                onClick={() => onEdit(exercise)}
                className="min-w-0 flex-1 text-left"
            >
                <p className="font-semibold text-foreground">
                    <span className="mr-1 text-xs font-bold text-muted-foreground">
                        #{exercise.position}
                    </span>
                    {exercise.exerciseName}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    {exercise.sets.length} set{exercise.sets.length === 1 ? "" : "s"} · {exercise.restSeconds}s rest
                    {exercise.coachNotes ? ` · ${exercise.coachNotes}` : ""}
                </p>
            </button>

            {/* Action buttons */}
            <div className="flex shrink-0 items-center gap-1">
                <button
                    type="button"
                    onClick={() => onEdit(exercise)}
                    className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label={`Edit ${exercise.exerciseName}`}
                >
                    <Edit3 className="size-3.5" />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(exercise)}
                    className="rounded-full p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove ${exercise.exerciseName}`}
                >
                    <Trash2 className="size-3.5" />
                </button>
            </div>
        </div>
    );
}

function DayCard({
    day,
    onEdit,
    onCreateExercise,
    onExerciseEdit,
    onExerciseDelete,
    onToggleRestDay,
    isReordering,
}: {
    day: BuilderDay;
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
                        ? "border-amber-400/30 bg-amber-400/10 text-amber-600 hover:bg-amber-400/20 dark:text-amber-400"
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

            <div className="mt-3 relative flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-2xl border border-dashed border-border/70 bg-muted/20 p-3 pr-2">
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

export default function PlanBuilder() {
    const { programId } = useParams();
    const location = useLocation();
    const [program, setProgram] = useState<ClientProgramTree | null>(null);
    const [builderWeeks, setBuilderWeeks] = useState<BuilderWeek[]>([]);
    const [selectedWeekId, setSelectedWeekId] = useState("");
    const [pendingDrop, setPendingDrop] = useState<{
        exercise: Exercise;
        dayId: string;
        dayLabel: string;
        defaultPosition: number;
    } | null>(null);
    const [createExerciseTarget, setCreateExerciseTarget] = useState<{
        dayId: string;
        dayLabel: string;
        defaultPosition: number;
    } | null>(null);
    const [dayToEdit, setDayToEdit] = useState<BuilderDay | null>(null);
    const [exerciseToEdit, setExerciseToEdit] = useState<BuilderPlannedExercise | null>(null);
    const [exerciseToDelete, setExerciseToDelete] = useState<BuilderPlannedExercise | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [reorderingDayId, setReorderingDayId] = useState<string | null>(null);
    const clientName = (location.state as { clientName?: string } | null)?.clientName ?? "Unknown client";
    const {
        filteredExercises,
        loading: exercisesLoading,
        error: exercisesError,
        actions: { handleRetry: refetchExercises },
    } = useExercisesData();

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

    function updateLocalDay(dayId: string, patch: Partial<BuilderDay>) {
        setBuilderWeeks((prevWeeks) =>
            prevWeeks.map((week) => ({
                ...week,
                days: week.days.map((day) => (day.id === dayId ? { ...day, ...patch } : day)),
            })),
        );
    }

    function findDayById(dayId: string) {
        for (const week of builderWeeks) {
            const day = week.days.find((weekDay) => weekDay.id === dayId);
            if (day) {
                return day;
            }
        }

        return null;
    }

    function handleDragEnd(event: any) {
        if (event.canceled) {
            return;
        }

        const { source, target } = event.operation;
        const sourceData = source?.data;
        const targetData = target?.data;
        if (!sourceData || !target) {
            return;
        }

        const exercise = getOverlayExercise(sourceData);
        if (exercise) {
            if (!targetData || targetData.kind !== "day") {
                return;
            }

            const targetDayId = String(target.id);
            const targetDay = findDayById(targetDayId);

            if (!targetDay) {
                toast.error("We could not find that day.");
                return;
            }

            if (targetDay.isRestDay) {
                toast.error("Unmark the day as rest before adding exercises.");
                return;
            }

            setPendingDrop({
                exercise,
                dayId: targetDayId,
                dayLabel: `Day ${targetDay.dayNumber}${targetDay.name ? ` · ${targetDay.name}` : ""}`,
                defaultPosition: targetDay.exercises.length + 1,
            });
            return;
        }

        const draggedExercise = sourceData as { kind?: string; exercise?: BuilderPlannedExercise; dayId?: string };
        const targetExercise = targetData as { kind?: string; exercise?: BuilderPlannedExercise; dayId?: string };

        if (draggedExercise.kind !== "planned-exercise" || targetExercise.kind !== "planned-exercise") {
            return;
        }

        if (!draggedExercise.exercise || !targetExercise.exercise || draggedExercise.dayId !== targetExercise.dayId) {
            return;
        }

        const draggedExerciseItem = draggedExercise.exercise;
        const targetExerciseItem = targetExercise.exercise;

        if (draggedExerciseItem.id === targetExerciseItem.id) {
            return;
        }

        const dayId = draggedExercise.dayId!;

        // Build the reordered list and derive the dragged item's new position
        const currentDay = findDayById(dayId);
        if (!currentDay) return;

        const reordered = reorderPlannedExercises(
            currentDay.exercises,
            draggedExerciseItem.id,
            targetExerciseItem.id,
        );
        const newPosition = reordered.find((e) => e.id === draggedExerciseItem.id)!.position;

        // Snapshot for rollback
        const snapshot = currentDay.exercises.slice();

        // Optimistic update
        setBuilderWeeks((prevWeeks) =>
            prevWeeks.map((week) => ({
                ...week,
                days: week.days.map((day) =>
                    day.id === dayId ? { ...day, exercises: reordered } : day,
                ),
            })),
        );

        setReorderingDayId(dayId);
        void (async () => {
            try {
                await updatePlannedExercise(program?.id ?? "", draggedExerciseItem.id, {
                    position: newPosition,
                });
            } catch (error) {
                // Roll back
                setBuilderWeeks((prevWeeks) =>
                    prevWeeks.map((week) => ({
                        ...week,
                        days: week.days.map((day) =>
                            day.id === dayId ? { ...day, exercises: snapshot } : day,
                        ),
                    })),
                );
                toast.error(getApiErrorMessage(error, "We could not reorder this exercise."));
            } finally {
                setReorderingDayId(null);
            }
        })();
    }

    function handleAddSuccess(plannedExercise: PlannedExercise) {
        setBuilderWeeks((prevWeeks) =>
            prevWeeks.map((week) => ({
                ...week,
                days: week.days.map((day) => ({
                    ...day,
                    exercises:
                        day.id === plannedExercise.programDayId
                            ? [...day.exercises, plannedExercise].sort((a, b) => a.position - b.position)
                            : day.exercises,
                })),
            })),
        );
        setPendingDrop(null);
    }

    function handleCreateSuccess(plannedExercise: PlannedExercise) {
        handleAddSuccess(plannedExercise);
        setCreateExerciseTarget(null);
        refetchExercises();
    }

    function handleDayUpdated(updatedDay: Partial<ClientProgramDay> & { id: string }) {
        updateLocalDay(updatedDay.id, updatedDay as Partial<BuilderDay>);
        setDayToEdit(null);
    }

    async function handleToggleRestDay(day: BuilderDay) {
        if (!program?.id) return;

        const next = !day.isRestDay;
        // Optimistic update
        updateLocalDay(day.id, { isRestDay: next });

        try {
            await updateProgramDay(program.id, day.id, { isRestDay: next });
        } catch (err) {
            // Roll back on failure
            updateLocalDay(day.id, { isRestDay: day.isRestDay });
            toast.error(getApiErrorMessage(err, "Could not update the rest day status."));
        }
    }

    async function handlePublishConfirm() {
        if (!program?.id) return;

        setIsPublishing(true);
        try {
            const updated = await publishClientProgram(program.id);
            setProgram((prev) => prev ? { ...prev, status: updated.status, schedulePhase: updated.schedulePhase } : prev);
            toast.success("Plan published successfully.");
            setIsPublishConfirmOpen(false);
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Could not publish this plan. Please try again."));
        } finally {
            setIsPublishing(false);
        }
    }

    function handleExerciseUpdated(updatedExercise: PlannedExercise) {
        setBuilderWeeks((prevWeeks) =>
            prevWeeks.map((week) => ({
                ...week,
                days: week.days.map((day) =>
                    day.id === updatedExercise.programDayId
                        ? {
                            ...day,
                            exercises: day.exercises
                                .map((exercise) => (exercise.id === updatedExercise.id ? updatedExercise : exercise))
                                .sort((a, b) => a.position - b.position),
                        }
                        : day,
                ),
            })),
        );
        setExerciseToEdit(null);
    }

    function handleDeleteExercise() {
        if (!exerciseToDelete || !program?.id) {
            return;
        }

        const exercise = exerciseToDelete;

        void (async () => {
            try {
                await deletePlannedExercise(program.id, exercise.id);
                setBuilderWeeks((prevWeeks) =>
                    prevWeeks.map((week) => ({
                        ...week,
                        days: week.days.map((day) => ({
                            ...day,
                            exercises: day.exercises.filter((item) => item.id !== exercise.id),
                        })),
                    })),
                );
                toast.success("Exercise deleted.");
                setExerciseToDelete(null);
            } catch (error) {
                toast.error(getApiErrorMessage(error, "We could not delete this exercise."));
            }
        })();
    }

    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" && window.matchMedia("(max-width: 1024px)").matches,
    );

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 1024px)");
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    if (isMobile) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand/10 text-brand">
                    <MonitorSmartphone className="size-8" />
                </div>
                <div className="max-w-xs">
                    <h2 className="text-xl font-black tracking-tight text-foreground">
                        Best on a larger screen
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        The Plan Builder uses an advanced drag-and-drop workout editor designed for
                        precision. For the best experience, open it on a tablet or desktop.
                    </p>
                </div>
                <Link
                    to="/dashboard/plans"
                    className="inline-flex items-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                    ← Back to plans
                </Link>
            </div>
        );
    }

    return (
        <>
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

                    {/* Publish button — draft only */}
                    {program?.status === "draft" && (
                        <button
                            type="button"
                            onClick={() => setIsPublishConfirmOpen(true)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
                        >
                            <Send className="size-4" />
                            Publish plan
                        </button>
                    )}
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
                            <aside className="flex max-h-[calc(100vh+10rem)] flex-col rounded-3xl border border-border bg-card p-4 shadow-(--shadow-card)">
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
                                                        onEdit={(nextDay) => setDayToEdit(nextDay)}
                                                        onToggleRestDay={(nextDay) => void handleToggleRestDay(nextDay)}
                                                        isReordering={reorderingDayId === day.id}
                                                        onCreateExercise={(nextDay) =>
                                                            setCreateExerciseTarget({
                                                                dayId: nextDay.id,
                                                                dayLabel: `Day ${nextDay.dayNumber}${nextDay.name ? ` · ${nextDay.name}` : ""}`,
                                                                defaultPosition: nextDay.exercises.length + 1,
                                                            })
                                                        }
                                                        onExerciseEdit={(exercise) => setExerciseToEdit(exercise)}
                                                        onExerciseDelete={(exercise) => setExerciseToDelete(exercise)}
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

                <AddDayExerciseModal
                    open={!!pendingDrop}
                    programId={program?.id ?? null}
                    programDayId={pendingDrop?.dayId ?? null}
                    dayLabel={pendingDrop?.dayLabel ?? ""}
                    exercise={pendingDrop?.exercise ?? null}
                    defaultPosition={pendingDrop?.defaultPosition ?? 1}
                    onClose={() => setPendingDrop(null)}
                    onAdded={handleAddSuccess}
                />

                <EditPlanDayModal
                    open={!!dayToEdit}
                    programId={program?.id ?? null}
                    day={dayToEdit}
                    onClose={() => setDayToEdit(null)}
                    onUpdated={handleDayUpdated}
                />

                <EditPlannedExerciseModal
                    key={exerciseToEdit?.id ?? "closed"}
                    open={!!exerciseToEdit}
                    programId={program?.id ?? null}
                    exercise={exerciseToEdit}
                    onClose={() => setExerciseToEdit(null)}
                    onUpdated={handleExerciseUpdated}

                />

                <CreateExerciseAndAddToDayModal
                    open={!!createExerciseTarget}
                    programId={program?.id ?? null}
                    programDayId={createExerciseTarget?.dayId ?? null}
                    dayLabel={createExerciseTarget?.dayLabel ?? ""}
                    defaultPosition={createExerciseTarget?.defaultPosition ?? 1}
                    onClose={() => setCreateExerciseTarget(null)}
                    onAdded={handleCreateSuccess}
                />

                {exerciseToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-sm rounded-3xl border border-border bg-background p-6 shadow-2xl">
                            <h3 className="text-lg font-bold text-foreground">Delete exercise?</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                This will remove {exerciseToDelete.exerciseName} from the day.
                            </p>
                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setExerciseToDelete(null)}
                                    className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteExercise}
                                    className="rounded-2xl bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground transition hover:opacity-90"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={isPublishConfirmOpen}
                title="Publish this plan?"
                description={
                    program
                        ? `"${program.name}" will be sent to ${clientName}. You can still cancel it afterwards.`
                        : ""
                }
                confirmLabel="Publish plan"
                cancelLabel="Not yet"
                pendingLabel="Publishing…"
                isConfirming={isPublishing}
                onConfirm={() => void handlePublishConfirm()}
                onCancel={() => setIsPublishConfirmOpen(false)}
            />
        </>
    );
}
