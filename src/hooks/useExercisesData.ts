// src/hooks/useExercisesData.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { getExercises, deleteExercise, unarchiveExercise } from "@/services/exercises";
import { getApiErrorMessage } from "@/lib/api";
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useExercisesData() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<ExercisesFilters>(defaultFilters);

  // Delete action state
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sequence counter — stale responses whose seq no longer matches are dropped.
  const seqRef = useRef(0);

  // Keep a stable ref to the latest filters so the effect always reads the
  // current value without needing `filters` in the dependency array.
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  });

  // ── Effect: re-fetch on every server-side filter change ──────────────────
  useEffect(() => {
    const seq = ++seqRef.current;
    setLoading(true);
    setError("");

    void (async () => {
      try {
        const data = await getExercises(buildExerciseParams(filtersRef.current));
        if (seq !== seqRef.current) return;
        setExercises(Array.isArray(data) ? data : []);
      } catch (err) {
        if (seq !== seqRef.current) return;
        setError(getApiErrorMessage(err, "Failed to load exercises. Please try again."));
      } finally {
        if (seq === seqRef.current) setLoading(false);
      }
    })();
  }, [
    // Every change fires a new request.
    // showArchivedOnly implies includeInactive, handled in buildExerciseParams.
    filters.search,
    filters.category,
    filters.primaryMuscle,
    filters.includeInactive,
    filters.showArchivedOnly,
  ]);

  // ── Manual refresh — re-fetches with current filters ─────────────────────
  const refreshData = useCallback(async () => {
    const seq = ++seqRef.current;
    setIsRefreshing(true);
    setError("");

    try {
      const data = await getExercises(buildExerciseParams(filters));
      if (seq !== seqRef.current) return;
      setExercises(Array.isArray(data) ? data : []);
    } catch (err) {
      if (seq !== seqRef.current) return;
      setError(getApiErrorMessage(err, "Failed to load exercises. Please try again."));
    } finally {
      if (seq === seqRef.current) setIsRefreshing(false);
    }
  }, [filters]);

  // ── Retry ─────────────────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    // Reset seq so the pending effect re-runs cleanly
    setFilters((f) => ({ ...f }));
  }, []);

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
      setExercises((prev) =>
        isEditing
          ? prev.map((e) => (e.id === saved.id ? saved : e))
          : [saved, ...prev],
      );
    },
    [],
  );

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(async () => {
    if (!exerciseToDelete) return;
    setIsDeleting(true);
    try {
      await deleteExercise(exerciseToDelete.id);
      setExercises((prev) => prev.filter((e) => e.id !== exerciseToDelete.id));
      toast.success("Exercise deleted.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete exercise. Please try again."));
    } finally {
      setIsDeleting(false);
      setExerciseToDelete(null);
    }
  }, [exerciseToDelete]);
  // ── Unarchive ─────────────────────────────────────────────────────────────
  const handleUnarchive = useCallback(async (exercise: Exercise) => {
    try {
      const updated = await unarchiveExercise(exercise.id);
      setExercises((prev) =>
        prev.map((e) => (e.id === exercise.id ? (updated ? updated : { ...e, isActive: true }) : e))
      );
      toast.success(`"${exercise.name}" unarchived.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to unarchive exercise. Please try again."));
    }
  }, []);

  const hasActiveFilter =
    !!filters.search ||
    !!filters.category ||
    !!filters.primaryMuscle ||
    filters.includeInactive ||
    filters.showArchivedOnly;

  // Client-side post-filter: when showArchivedOnly, keep only inactive exercises
  const filteredExercises = filters.showArchivedOnly
    ? exercises.filter((ex) => !ex.isActive)
    : exercises;

  return {
    exercises,
    filteredExercises,
    loading,
    error,
    isRefreshing,
    hasActiveFilter,
    filters,
    setFilters,
    handleFiltersChange,
    resetFilters,
    refreshData,
    actions: {
      handleRetry,
      handleSavedExercise,
      exerciseToDelete,
      setExerciseToDelete,
      isDeleting,
      handleDeleteConfirm,
      handleUnarchive,
    },
  };
}
