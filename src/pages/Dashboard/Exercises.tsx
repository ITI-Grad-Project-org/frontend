import { useState } from "react";
import AddExerciseModal from "@/components/modals/AddExerciseModal";
import ExerciseDetailsModal from "@/components/modals/ExerciseDetailsModal";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { ExerciseFilters } from "@/components/exercises/ExerciseFilters";
import { ExerciseGrid } from "@/components/exercises/ExerciseGrid";
import { useExercisesData } from "@/hooks/useExercisesData";
import type { Exercise } from "@/types/exercise";
import { Plus } from "lucide-react";

export default function Exercises() {
  const {
    exercises,
    filteredExercises,
    loading,
    error,
    hasActiveFilter,
    filters,
    actions,
  } = useExercisesData();

  // Modals view state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
  const [viewingExercise, setViewingExercise] = useState<Exercise | null>(null);

  const handleOpenAdd = () => {
    setExerciseToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exercise: Exercise) => {
    setExerciseToEdit(exercise);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Header */}
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
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold bg-brand text-brand-foreground rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Add to library
        </button>
      </div>

      {/* Search & Category Filter Controls */}
      <ExerciseFilters
        searchQuery={filters.searchQuery}
        onSearchChange={filters.setSearchQuery}
        categoryFilter={filters.categoryFilter}
        onCategoryChange={filters.setCategoryFilter}
      />

      {/* Section Heading & Counter */}
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
      <p className="text-sm text-muted-foreground mb-6">
        Select an exercise to review its details, instructions, and media
      </p>

      {/* Exercises Content Grid */}
      <ExerciseGrid
        loading={loading}
        error={error}
        exercises={filteredExercises}
        hasActiveFilter={hasActiveFilter}
        onRetry={actions.handleRetry}
        onOpenAdd={handleOpenAdd}
        onView={setViewingExercise}
        onEdit={handleOpenEdit}
        onDelete={actions.setExerciseToDelete}
      />

      {/* Modals & Dialogs */}
      <AddExerciseModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exercise={exerciseToEdit}
        onSuccess={(saved) => actions.handleSavedExercise(saved, !!exerciseToEdit)}
      />

      <ConfirmDialog
        open={actions.exerciseToDelete !== null}
        title="Delete Exercise?"
        description={`"${actions.exerciseToDelete?.name}" will be permanently removed from your library.`}
        confirmLabel="Delete"
        isConfirming={actions.isDeleting}
        onConfirm={actions.handleDeleteConfirm}
        onCancel={() => actions.setExerciseToDelete(null)}
      />

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