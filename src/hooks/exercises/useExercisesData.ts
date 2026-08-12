// src/hooks/useExercisesData.ts
import { useCallback, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getExercises,
  deleteExercise,
  unarchiveExercise,
} from "@/services/exercises";
import { getApiErrorMessage } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import type { Exercise, ExerciseCategory, MuscleGroup } from "@/types/exercise";
import { toast } from "react-toastify";

// ─── Filter shape ─────────────────────────────────────────────────────────────

export type ExercisesFilters = {
  /** Case-insensitive name search — sent as ?search= */
  search: string;
  /** Exercise category — sent as ?category= */
  category: ExerciseCategory | "";
  /** Primary muscle group — sent as ?primaryMuscle= */
  primaryMuscle: MuscleGroup | "";
  /** Whether to include inactive (archived) exercises — sent as ?includeInactive=true */
  includeInactive: boolean;
  /**
   * Show ONLY archived exercises.
   * Implies includeInactive=true in the API call.
   * Client-side post-filters the response to isActive===false only.
   */
  showArchivedOnly: boolean;
};

const defaultFilters: ExercisesFilters = {
  search: "",
  category: "",
  primaryMuscle: "",
  includeInactive: false,
  showArchivedOnly: false,
};

// ─── Query-param builder ──────────────────────────────────────────────────────

function buildExerciseParams(f: ExercisesFilters) {
  const params: Record<string, string | boolean> = {};
  if (f.search.trim()) params.search = f.search.trim();
  if (f.category) params.category = f.category;
  if (f.primaryMuscle) params.primaryMuscle = f.primaryMuscle;
  // showArchivedOnly implies we need inactive exercises from the server
  if (f.includeInactive || f.showArchivedOnly) params.includeInactive = true;
  return params;
}

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useExercisesData() {
  const [filters, setFilters] = useState<ExercisesFilters>(defaultFilters);

  // Delete action state
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);

  // Each filter combination is its own cached query, so revisiting a page
  // (or re-applying a filter) reads from cache instead of re-fetching the
  // whole image-heavy library. Long staleTime: exercises rarely change.
  const exercisesQuery = useQuery({
    queryKey: ["exercises", buildExerciseParams(filters)],
    queryFn: async () => {
      const data = await getExercises(buildExerciseParams(filters));
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60_000,
  });

  // Mutations update the current filter view's cache in place (no refetch) and
  // mark every other cached combination stale so they refresh on their next visit.
  const markLibraryStale = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["exercises"],
      refetchType: "none",
    });
  }, []);

  const deleteExerciseMutation = useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => toast.success("Exercise deleted."),
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Failed to delete exercise. Please try again."),
      ),
  });

  // ── Retry ─────────────────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    void exercisesQuery.refetch();
  }, [exercisesQuery]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  // ── Filter helpers ────────────────────────────────────────────────────────
  const handleFiltersChange = useCallback(
    (next: Partial<ExercisesFilters>) =>
      setFilters((current) => ({ ...current, ...next })),
    [],
  );

  // ── Optimistic local updates after add/edit (avoids a round-trip) ─────────
  const handleSavedExercise = useCallback(
    (saved: Exercise, isEditing: boolean) => {
      queryClient.setQueryData<Exercise[]>(
        ["exercises", buildExerciseParams(filters)],
        (prev) =>
          isEditing
            ? prev?.map((e) => (e.id === saved.id ? saved : e))
            : [saved, ...(prev ?? [])],
      );
      markLibraryStale();
    },
    [filters, markLibraryStale],
  );

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(async () => {
    if (!exerciseToDelete) return;
    try {
      await deleteExerciseMutation.mutateAsync(exerciseToDelete.id);
      queryClient.setQueryData<Exercise[]>(
        ["exercises", buildExerciseParams(filters)],
        (prev) => prev?.filter((e) => e.id !== exerciseToDelete.id),
      );
      markLibraryStale();
    } finally {
      setExerciseToDelete(null);
    }
  }, [exerciseToDelete, deleteExerciseMutation, filters, markLibraryStale]);

  // ── Unarchive ─────────────────────────────────────────────────────────────
  const handleUnarchive = useCallback(
    async (exercise: Exercise) => {
      try {
        const updated = await unarchiveExercise(exercise.id);
        queryClient.setQueryData<Exercise[]>(
          ["exercises", buildExerciseParams(filters)],
          (prev) =>
            prev?.map((e) =>
              e.id === exercise.id
                ? updated ?? { ...e, isActive: true }
                : e,
            ),
        );
        markLibraryStale();
        toast.success(`"${exercise.name}" unarchived.`);
      } catch (err) {
        toast.error(
          getApiErrorMessage(err, "Failed to unarchive exercise. Please try again."),
        );
      }
    },
    [filters, markLibraryStale],
  );

  const hasActiveFilter =
    !!filters.search ||
    !!filters.category ||
    !!filters.primaryMuscle ||
    filters.includeInactive ||
    filters.showArchivedOnly;

  const exercises = exercisesQuery.data ?? [];

  // Client-side post-filter: when showArchivedOnly, keep only inactive exercises
  const filteredExercises = filters.showArchivedOnly
    ? exercises.filter((ex) => !ex.isActive)
    : exercises;

  return {
    exercises,
    filteredExercises,
    loading: exercisesQuery.isPending,
    error: toError(exercisesQuery.error, "Failed to load exercises. Please try again."),
    isRefreshing: exercisesQuery.isFetching && !exercisesQuery.isPending,
    hasActiveFilter,
    filters,
    setFilters,
    handleFiltersChange,
    resetFilters,
    refreshData: () => void exercisesQuery.refetch(),
    actions: {
      handleRetry,
      handleSavedExercise,
      exerciseToDelete,
      setExerciseToDelete,
      isDeleting: deleteExerciseMutation.isPending,
      handleDeleteConfirm,
      handleUnarchive,
    },
  };
}