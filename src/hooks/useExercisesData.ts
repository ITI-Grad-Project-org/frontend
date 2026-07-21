// src/hooks/useExercisesData.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import { getExercises, deleteExercise } from "@/services/exercises";
import { getApiErrorMessage } from "@/lib/api";
import type { Exercise } from "@/types/exercise";
import { toast } from "react-toastify";

export function useExercisesData() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Delete Action state
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch exercises
  useEffect(() => {
    let cancelled = false;

    const fetchExercises = async () => {
      try {
        const data = await getExercises();
        if (!cancelled) {
          setExercises(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              err,
              "Failed to load exercises. Please try again.",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchExercises();

    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError("");
    setRefreshTrigger((t) => t + 1);
  }, []);

  // Client-side filtering
  const filteredExercises = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return exercises.filter((ex) => {
      const matchesSearch = !q || ex.name.toLowerCase().includes(q);
      const matchesCategory = !categoryFilter || ex.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [exercises, searchQuery, categoryFilter]);

  // Handle Add/Edit modal success update
  const handleSavedExercise = useCallback(
    (saved: Exercise, isEditing: boolean) => {
      if (isEditing) {
        setExercises((prev) =>
          prev.map((e) => (e.id === saved.id ? saved : e)),
        );
      } else {
        setExercises((prev) => [saved, ...prev]);
      }
    },
    [],
  );

  // Handle Delete confirm
  const handleDeleteConfirm = useCallback(async () => {
    if (!exerciseToDelete) return;
    setIsDeleting(true);
    try {
      await deleteExercise(exerciseToDelete.id);
      setExercises((prev) => prev.filter((e) => e.id !== exerciseToDelete.id));
      toast.success("Exercise deleted.");
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Failed to delete exercise. Please try again."),
      );
    } finally {
      setIsDeleting(false);
      setExerciseToDelete(null);
    }
  }, [exerciseToDelete]);

  const hasActiveFilter = !!searchQuery || !!categoryFilter;

  return {
    exercises,
    filteredExercises,
    loading,
    error,
    hasActiveFilter,
    filters: {
      searchQuery,
      setSearchQuery,
      categoryFilter,
      setCategoryFilter,
    },
    actions: {
      handleRetry,
      handleSavedExercise,
      exerciseToDelete,
      setExerciseToDelete,
      isDeleting,
      handleDeleteConfirm,
    },
  };
}
