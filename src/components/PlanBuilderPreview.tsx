import { useState } from "react";
import { DragDropProvider, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/react";

// ── Mock types (loosely matching the real API shapes) ──────────────────────

interface LibraryExercise {
    id: string;
    name: string;
    primaryMuscle: string;
}

interface PlannedSet {
    id: string;
    setNumber: number;
    setType: string;
    repsMin: number | null;
    repsMax: number | null;
    weightKg: number | null;
}

interface PlannedExercise {
    id: string;
    exerciseId: string;
    exerciseName: string;
    position: number;
    restSeconds: number;
    supersetGroup: number | null;
    sets: PlannedSet[];
}

interface BoardDay {
    id: string;
    dayNumber: number;
    isRestDay: boolean;
    exercises: PlannedExercise[];
}

interface BoardWeek {
    id: string;
    weekNumber: number;
    days: BoardDay[];
}

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_LIBRARY: LibraryExercise[] = [
    { id: "ex-1", name: "Barbell Squat", primaryMuscle: "legs" },
    { id: "ex-2", name: "Bench Press", primaryMuscle: "chest" },
    { id: "ex-3", name: "Deadlift", primaryMuscle: "back" },
    { id: "ex-4", name: "Pull Up", primaryMuscle: "back" },
    { id: "ex-5", name: "Overhead Press", primaryMuscle: "shoulders" },
    { id: "ex-6", name: "Plank", primaryMuscle: "core" },
    { id: "ex-7", name: "Lateral Raise", primaryMuscle: "shoulders" },
    { id: "ex-8", name: "Romanian Deadlift", primaryMuscle: "legs" },
];

function buildMockWeeks(): BoardWeek[] {
    return Array.from({ length: 4 }, (_, weekIndex) => ({
        id: `week-${weekIndex + 1}`,
        weekNumber: weekIndex + 1,
        days: Array.from({ length: 7 }, (_, dayIndex) => ({
            id: `week-${weekIndex + 1}-day-${dayIndex + 1}`,
            dayNumber: dayIndex + 1,
            isRestDay: dayIndex === 6,
            exercises: [],
        })),
    }));
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ExerciseCard({ exercise }: { exercise: LibraryExercise }) {
    const { ref, isDragging } = useDraggable({
        id: exercise.id,
        data: exercise,
    });

    return (
        <div
            ref={ref}
            className={`cursor-grab select-none rounded-2xl border border-border bg-background px-3 py-2.5 text-sm shadow-sm transition active:cursor-grabbing ${isDragging ? "opacity-40" : "hover:border-foreground/20 hover:bg-muted/40"
                }`}
        >
            <p className="font-semibold text-foreground">{exercise.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{exercise.primaryMuscle}</p>
        </div>
    );
}

function ExerciseCardPreview({ exercise }: { exercise: LibraryExercise }) {
    return (
        <div className="cursor-grabbing select-none rounded-2xl border border-primary bg-background px-3 py-2.5 text-sm shadow-lg">
            <p className="font-semibold text-foreground">{exercise.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{exercise.primaryMuscle}</p>
        </div>
    );
}

function PlacedExerciseCard({
    exercise,
    onRemove,
}: {
    exercise: PlannedExercise;
    onRemove: (plannedExerciseId: string) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-2.5 py-2 text-xs shadow-sm">
            <div>
                <p className="font-semibold text-foreground">{exercise.exerciseName}</p>
                <p className="text-muted-foreground">
                    {exercise.sets.length} set{exercise.sets.length === 1 ? "" : "s"} · {exercise.restSeconds}s rest
                </p>
            </div>
            <button
                type="button"
                onClick={() => onRemove(exercise.id)}
                className="rounded-full px-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${exercise.exerciseName}`}
            >
                ×
            </button>
        </div>
    );
}

function DaySlot({
    day,
    onRemove,
}: {
    day: BoardDay;
    onRemove: (plannedExerciseId: string) => void;
}) {
    const { ref, isDropTarget } = useDroppable({ id: day.id, disabled: day.isRestDay });

    return (
        <div
            ref={ref}
            className={`flex min-h-[220px] flex-col gap-2 rounded-2xl border-2 border-dashed p-3 transition ${day.isRestDay
                    ? "border-border bg-muted/40 opacity-60"
                    : isDropTarget
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/20"
                }`}
        >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Day {day.dayNumber}
            </p>

            {day.isRestDay ? (
                <p className="mt-2 text-center text-xs text-muted-foreground">Rest day</p>
            ) : (
                <div className="flex flex-1 flex-col gap-2">
                    {day.exercises.length === 0 && (
                        <p className="mt-2 text-center text-xs text-muted-foreground/70">
                            Drop exercises here
                        </p>
                    )}
                    {day.exercises
                        .slice()
                        .sort((a, b) => a.position - b.position)
                        .map((exercise) => (
                            <PlacedExerciseCard key={exercise.id} exercise={exercise} onRemove={onRemove} />
                        ))}
                </div>
            )}
        </div>
    );
}

function WeekSelector({
    weeks,
    selectedWeekId,
    onChange,
}: {
    weeks: BoardWeek[];
    selectedWeekId: string;
    onChange: (weekId: string) => void;
}) {
    return (
        <select
            value={selectedWeekId}
            onChange={(event) => onChange(event.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
            {weeks.map((week) => (
                <option key={week.id} value={week.id}>
                    Week {week.weekNumber}
                </option>
            ))}
        </select>
    );
}

function ExerciseLibrary({ exercises }: { exercises: LibraryExercise[] }) {
    return (
        <aside className="h-fit rounded-3xl border border-border bg-card p-4 shadow-(--shadow-card)">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Exercises
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Drag an exercise onto a day to add it.</p>

            <div className="mt-4 space-y-2">
                {exercises.map((exercise) => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
            </div>
        </aside>
    );
}

// ── Main preview component ───────────────────────────────────────────────────

export default function PlanBuilderPreview() {
    const [weeks, setWeeks] = useState<BoardWeek[]>(buildMockWeeks);
    const [selectedWeekId, setSelectedWeekId] = useState(weeks[0].id);

    const selectedWeek = weeks.find((week) => week.id === selectedWeekId) ?? weeks[0];

    function handleDragEnd(event: any) {
        if (event.canceled) return;

        const { source, target } = event.operation;
        const exercise = source?.data as LibraryExercise | undefined;
        if (!exercise || !target) return;

        const programDayId = String(target.id);

        setWeeks((prevWeeks) =>
            prevWeeks.map((week) => ({
                ...week,
                days: week.days.map((day) => {
                    if (day.id !== programDayId || day.isRestDay) return day;

                    const newExercise: PlannedExercise = {
                        id: `${exercise.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        exerciseId: exercise.id,
                        exerciseName: exercise.name,
                        position: day.exercises.length + 1,
                        restSeconds: 90,
                        supersetGroup: null,
                        sets: [
                            {
                                id: `set-${Date.now()}`,
                                setNumber: 1,
                                setType: "working",
                                repsMin: 8,
                                repsMax: 10,
                                weightKg: null,
                            },
                        ],
                    };

                    return { ...day, exercises: [...day.exercises, newExercise] };
                }),
            })),
        );
    }

    function handleRemove(plannedExerciseId: string) {
        setWeeks((prevWeeks) =>
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
        <DragDropProvider onDragEnd={handleDragEnd}>
            <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
                <ExerciseLibrary exercises={MOCK_LIBRARY} />

                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-bold text-foreground">Weekly schedule</h2>
                        <WeekSelector
                            weeks={weeks}
                            selectedWeekId={selectedWeek.id}
                            onChange={setSelectedWeekId}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                        {selectedWeek.days.map((day) => (
                            <DaySlot key={day.id} day={day} onRemove={handleRemove} />
                        ))}
                    </div>
                </div>
            </div>

            <DragOverlay>
                {(source) => {
                    const exercise = source.data as LibraryExercise | undefined;
                    return exercise ? <ExerciseCardPreview exercise={exercise} /> : null;
                }}
            </DragOverlay>
        </DragDropProvider>
    );
}