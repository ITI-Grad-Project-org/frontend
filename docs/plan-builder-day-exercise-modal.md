# Plan Builder Day Exercise Modal

## What changed

- Dragging an exercise from the library onto a day now opens a modal instead of inserting the exercise immediately.
- The modal collects the day-exercise prescription before saving:
  - position
  - rest seconds
  - superset group
  - tempo
  - coach notes
  - one or more set rows
- Submitting the modal calls:
  - `POST /plans/training/client-programs/:programId/days/:programDayId/exercises/from-library`
- The returned planned exercise is added to the matching day in the local builder state.
- A `Create new exercise` button now appears above each day's exercise list.
- That button opens the combined create-and-add flow for:
  - `POST /plans/training/client-programs/:programId/days/:programDayId/exercises/create-in-library`
- Set rows are now required end to end in the builder UI:
  - no blank set fields can be submitted
  - intensity type defaults to `rpe`
  - intensity value is required and validated

## Updated files

- [`src/pages/Dashboard/PlanBuilder.tsx`](../src/pages/Dashboard/PlanBuilder.tsx)
- [`src/components/modals/AddDayExerciseModal.tsx`](../src/components/modals/AddDayExerciseModal.tsx)
- [`src/components/modals/CreateExerciseAndAddToDayModal.tsx`](../src/components/modals/CreateExerciseAndAddToDayModal.tsx)
- [`src/services/plans.ts`](../src/services/plans.ts)
- [`src/types/plans.ts`](../src/types/plans.ts)

## Notes

- The library exercise still comes from the existing drag source.
- The day row layout and scroll behavior stay the same.
- The remove button is still handled locally for now, so the save flow for deletes can be wired later if needed.
- The builder now keeps enough structure in state to support future day-edit and exercise-edit endpoints.
