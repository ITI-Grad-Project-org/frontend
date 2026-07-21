import { api } from "@/lib/api";
import type { Exercise, ExercisePayload, GetExercisesParams } from "@/types/exercise";

/** GET /exercises */
export async function getExercises(params?: GetExercisesParams) {
  const { data } = await api.get<Exercise[]>("/exercises", { params });
  return data;
}

/** GET /exercises/:exerciseId */
export async function getExercise(exerciseId: string) {
  const { data } = await api.get<Exercise>(`/exercises/${exerciseId}`);
  return data;
}

/** POST /exercises */
export async function createExercise(payload: ExercisePayload) {
  const { data } = await api.post<Exercise>("/exercises", payload);
  return data;
}

/** PATCH /exercises/:exerciseId */
export async function updateExercise(exerciseId: string, payload: ExercisePayload) {
  const { data } = await api.patch<Exercise>(`/exercises/${exerciseId}`, payload);
  return data;
}

/** DELETE /exercises/:exerciseId */
export async function deleteExercise(exerciseId: string) {
  await api.delete(`/exercises/${exerciseId}`);
}

/**
 * POST /exercises/initialize-library-from-defaults
 *
 * ⚠️  NOT TESTED YET — the API currently returns 404 for this endpoint.
 *     Test manually before wiring into the UI.
 */
export async function initializeLibraryFromDefaults() {
  const { data } = await api.post<Exercise[]>(
    "/exercises/initialize-library-from-defaults",
  );
  return data;
}
