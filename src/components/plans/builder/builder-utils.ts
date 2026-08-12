import type { ClientProgramDay, ClientProgramTree, PlannedExercise, PlannedExerciseSet } from "@/types/plans";
import type { Exercise } from "@/types/exercise";
import type {
    BuilderIntensityType,
    BuilderPlannedExercise,
    BuilderSetType,
    BuilderWeek,
} from "./builder-types";

export function formatDate(value: string | null | undefined) {
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

export function normalizeExercises(dayId: string, nodes: ClientProgramDay["exercises"]): BuilderPlannedExercise[] {
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
                    durationSeconds:
                        setNode.durationSeconds === null || setNode.durationSeconds === undefined
                            ? null
                            : Number(setNode.durationSeconds),
                } satisfies PlannedExerciseSet;
            }),
        };
    });
}

export function buildWeeks(weeks: ClientProgramTree["weeks"]): BuilderWeek[] {
    return weeks.map((week) => ({
        ...week,
        days: week.days.map((day) => ({
            ...day,
            exercises: normalizeExercises(day.id, day.exercises),
        })),
    }));
}

export function getExerciseSummary(exercise: Exercise) {
    return exercise.primaryMuscle.replaceAll("_", " ");
}

export function getExerciseDragData(exercise: PlannedExercise, dayId: string) {
    return {
        kind: "planned-exercise" as const,
        exercise,
        dayId,
    };
}

export function reorderPlannedExercises(
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

export function getOverlayExercise(data: unknown): Exercise | null {
    if (!data || typeof data !== "object") {
        return null;
    }

    const candidate = data as Partial<Exercise>;
    if (!candidate.id || !candidate.name || !candidate.primaryMuscle) {
        return null;
    }

    return candidate as Exercise;
}