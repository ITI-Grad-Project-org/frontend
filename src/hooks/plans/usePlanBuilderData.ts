import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import {
    archiveClientProgramDraft,
    deletePlannedExercise,
    getClientProgram,
    publishClientProgram,
    updatePlannedExercise,
    updateProgramDay,
} from "@/services/plans";
import type { ClientProgramTree, PlannedExercise } from "@/types/plans";
import type { BuilderDay, BuilderWeek } from "@/components/plans/builder/builder-types";
import { buildWeeks, reorderPlannedExercises } from "@/components/plans/builder/builder-utils";

export function usePlanBuilderData(programId?: string) {
    const [program, setProgram] = useState<ClientProgramTree | null>(null);
    const [builderWeeks, setBuilderWeeks] = useState<BuilderWeek[]>([]);
    const [selectedWeekId, setSelectedWeekId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isPublishing, setIsPublishing] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [reorderingDayId, setReorderingDayId] = useState<string | null>(null);

    // Keep the Plans list fresh — edits made here must show when the coach
    // navigates back to /dashboard/plans.
    useEffect(() => () => void queryClient.invalidateQueries({ queryKey: ["programs"] }), []);

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

    function addExercise(plannedExercise: PlannedExercise) {
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
    }

    function replaceExercise(updatedExercise: PlannedExercise) {
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
    }

    async function removeExercise(exercise: PlannedExercise): Promise<boolean> {
        if (!program?.id) {
            return false;
        }

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
            return true;
        } catch (error) {
            toast.error(getApiErrorMessage(error, "We could not delete this exercise."));
            return false;
        }
    }

    async function toggleRestDay(day: BuilderDay): Promise<boolean> {
        if (!program?.id) return false;

        const next = !day.isRestDay;
        // Optimistic update
        updateLocalDay(day.id, { isRestDay: next });

        try {
            await updateProgramDay(program.id, day.id, { isRestDay: next });
            return true;
        } catch (err) {
            // Roll back on failure
            updateLocalDay(day.id, { isRestDay: day.isRestDay });
            toast.error(getApiErrorMessage(err, "Could not update the rest day status."));
            return false;
        }
    }

    function reorderExercises(dayId: string, draggedId: string, targetId: string) {
        const currentDay = findDayById(dayId);
        if (!currentDay) return;

        const reordered = reorderPlannedExercises(currentDay.exercises, draggedId, targetId);
        const newPosition = reordered.find((e) => e.id === draggedId)!.position;

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
                await updatePlannedExercise(program?.id ?? "", draggedId, {
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

    async function publishPlan(): Promise<boolean> {
        if (!program?.id) return false;

        setIsPublishing(true);
        try {
            const updated = await publishClientProgram(program.id);
            setProgram((prev) => prev ? { ...prev, status: updated.status, schedulePhase: updated.schedulePhase } : prev);
            toast.success("Plan published successfully.");
            return true;
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Could not publish this plan. Please try again."));
            return false;
        } finally {
            setIsPublishing(false);
        }
    }

    async function archivePlan(): Promise<boolean> {
        if (!program?.id) return false;

        setIsArchiving(true);
        try {
            await archiveClientProgramDraft(program.id);
            setProgram((prev) => (prev ? { ...prev, isArchived: true } : prev));
            toast.success("Plan archived.");
            return true;
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Could not archive this plan. Please try again."));
            return false;
        } finally {
            setIsArchiving(false);
        }
    }

    return {
        program,
        builderWeeks,
        selectedWeekId,
        setSelectedWeekId,
        selectedWeek,
        isLoading,
        error,
        isPublishing,
        isArchiving,
        reorderingDayId,
        updateLocalDay,
        findDayById,
        addExercise,
        replaceExercise,
        removeExercise,
        toggleRestDay,
        reorderExercises,
        publishPlan,
        archivePlan,
    };
}