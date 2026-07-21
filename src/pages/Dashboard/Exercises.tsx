import { useEffect, useMemo, useState } from "react";
import AddExerciseModal from "@/components/AddExerciseModal";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseDetailsModal from "@/components/ExerciseDetailsModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { getExercises, deleteExercise } from "@/services/exercises";
import { getApiErrorMessage } from "@/lib/api";
import type { Exercise } from "@/types/exercise";
import { Plus, Search, RefreshCw, Dumbbell } from "lucide-react";
import { toast } from "react-toastify";
import ExerciseCardSkeleton from "@/components/ExerciseCardSkeleton";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "mobility", label: "Mobility" },
  { value: "plyometric", label: "Plyometric" },
  { value: "core", label: "Core" },
];


function Exercises() {
  // All exercises fetched once from the API
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Local filter state — no API calls, purely client-side
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal / dialog state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const [viewingExercise, setViewingExercise] = useState<Exercise | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch ALL exercises once ───────
  useEffect(() => {
    let cancelled = false;

    // Call async fetch function inside effect
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
            getApiErrorMessage(err, "Failed to load exercises. Please try again.")
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

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setRefreshTrigger((t) => t + 1);
  };

  // ── Client-side filtering ──────────────────────────────
  const filteredExercises = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return exercises.filter((ex) => {
      const matchesSearch = !q || ex.name.toLowerCase().includes(q);
      const matchesCategory = !categoryFilter || ex.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [exercises, searchQuery, categoryFilter]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleOpenAdd = () => {
    setExerciseToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exercise: Exercise) => {
    setExerciseToEdit(exercise);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (saved: Exercise) => {
    if (exerciseToEdit) {
      // Optimistically update the item in the list
      setExercises((prev) => prev.map((e) => (e.id === saved.id ? saved : e)));
    } else {
      // Prepend the new exercise
      setExercises((prev) => [saved, ...prev]);
    }
  };

  const handleDeleteConfirm = async () => {
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
  };

  const hasActiveFilter = !!searchQuery || !!categoryFilter;

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black font-display text-foreground">
            Exercises
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your coaching exercise library.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          // className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold bg-ink text-ink-foreground rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm w-full sm:w-auto"
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold bg-brand text-brand-foreground rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Add to library
        </button>
      </div>

      {/* ── Search + category filters ───────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mb-8">
        {/* Search bar */}
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-border bg-card shadow-sm">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises…"
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-lg leading-none text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer
                ${categoryFilter === cat.value
                  ? "bg-ink text-ink-foreground shadow-sm"
                  : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Library heading ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-foreground">Library</h2>
        {!loading && !error && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground">
            {hasActiveFilter
              ? `${filteredExercises.length} of ${exercises.length}`
              : exercises.length}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-6">Select an exercise to review its details, instructions, and media</p>

      {/* ── Content states ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ExerciseCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-8 border border-destructive/25 rounded-3xl bg-destructive/5 text-center min-h-75">
          <p role="alert" className="text-lg font-medium text-destructive mb-2">
            Error loading exercises
          </p>
          <p className="text-sm text-muted-foreground max-w-md mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2.5 bg-ink text-ink-foreground font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-3xl bg-muted/20 min-h-75">
          <Dumbbell
            className="w-10 h-10 text-muted-foreground/40"
            strokeWidth={1.5}
          />
          <p className="text-lg font-medium text-muted-foreground">
            {hasActiveFilter ? "No exercises match your filters" : "No exercises yet"}
          </p>
          <p className="text-sm text-muted-foreground/70">
            {hasActiveFilter
              ? "Try adjusting your search or category filter."
              : "Start building your coaching library."}
          </p>
          {!hasActiveFilter && (
            <button
              onClick={handleOpenAdd}
              className="mt-2 flex items-center gap-2 px-4 py-2.5 bg-ink text-ink-foreground font-semibold rounded-xl hover:opacity-90 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add first exercise
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={setViewingExercise}
              onEdit={handleOpenEdit}
              onDelete={setExerciseToDelete}
            />
          ))}
        </div>
      )}

      {/* ── Add / Edit modal ────────────────────────────────────────────────── */}
      <AddExerciseModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exercise={exerciseToEdit}
        onSuccess={handleModalSuccess}
      />

      {/* ── Delete confirmation ─────────────────────────────────────────────── */}
      <ConfirmDialog
        open={exerciseToDelete !== null}
        title="Delete Exercise?"
        description={`"${exerciseToDelete?.name}" will be permanently removed from your library.`}
        confirmLabel="Delete"
        isConfirming={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setExerciseToDelete(null)}
      />

      {/* ── View Details Modal ──────────────────────────────────────────────── */}
      <ExerciseDetailsModal
        exercise={viewingExercise}
        onClose={() => setViewingExercise(null)}
        onEdit={(exercise) => {
          setViewingExercise(null);
          handleOpenEdit(exercise);
        }}
      />
    </>
  );
}

export default Exercises;