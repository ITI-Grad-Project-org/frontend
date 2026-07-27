import { api } from "@/lib/api";
import type {
  AddLibraryExerciseToDayPayload,
  CreateExerciseInLibraryAndAddToDayPayload,
  CreateClientProgramPayload,
  ClientProgramDraft,
  ClientProgramTree,
  PlannedExercise,
  ReplacePlannedExerciseSetsPayload,
  UpdatePlannedExercisePayload,
  UpdateProgramDayPayload,
  UpdateClientProgramPayload,
} from "@/types/plans";

export async function createClientProgramDraft(
  payload: CreateClientProgramPayload,
): Promise<ClientProgramDraft> {
  const { data } = await api.post<ClientProgramDraft>(
    "/plans/training/client-programs",
    payload,
  );
  return data;
}

export type GetClientProgramsParams = {
  search?: string;
  membershipId?: string;
  status?: "draft" | "published" | "cancelled";
  goal?: string;
  difficulty?: string;
  isArchived?: boolean;
};

export async function getClientPrograms(
  params: GetClientProgramsParams = {},
): Promise<ClientProgramDraft[]> {
  // Build query params — omit keys with undefined / empty / falsy-default values
  const query: Record<string, string> = {};

  if (params.search?.trim()) query.search = params.search.trim();
  if (params.membershipId) query.membershipId = params.membershipId;
  if (params.status) query.status = params.status;
  if (params.goal) query.goal = params.goal;
  if (params.difficulty) query.difficulty = params.difficulty;
  if (params.isArchived === true) query.isArchived = "true";

  const { data } = await api.get<ClientProgramDraft[]>(
    "/plans/training/client-programs",
    { params: query },
  );
  return data;
}

export async function getClientProgram(
  programId: string,
): Promise<ClientProgramTree> {
  const { data } = await api.get<ClientProgramTree>(
    `/plans/training/client-programs/${programId}`,
  );
  return data;
}

export async function addLibraryExerciseToDay(
  programId: string,
  programDayId: string,
  payload: AddLibraryExerciseToDayPayload,
): Promise<PlannedExercise> {
  const { data } = await api.post<PlannedExercise>(
    `/plans/training/client-programs/${programId}/days/${programDayId}/exercises/from-library`,
    payload,
  );
  return data;
}

export async function createExerciseInLibraryAndAddToDay(
  programId: string,
  programDayId: string,
  payload: CreateExerciseInLibraryAndAddToDayPayload,
): Promise<{ exercise: unknown; plannedExercise: PlannedExercise }> {
  const { data } = await api.post<{
    exercise: unknown;
    plannedExercise: PlannedExercise;
  }>(
    `/plans/training/client-programs/${programId}/days/${programDayId}/exercises/create-in-library`,
    payload,
  );
  return data;
}

export async function updateProgramDay(
  programId: string,
  programDayId: string,
  payload: UpdateProgramDayPayload,
): Promise<unknown> {
  const { data } = await api.patch(
    `/plans/training/client-programs/${programId}/days/${programDayId}`,
    payload,
  );
  return data;
}

export async function updatePlannedExercise(
  programId: string,
  plannedExerciseId: string,
  payload: UpdatePlannedExercisePayload,
): Promise<PlannedExercise> {
  const { data } = await api.patch<PlannedExercise>(
    `/plans/training/client-programs/${programId}/exercises/${plannedExerciseId}`,
    payload,
  );
  return data;
}

export async function replacePlannedExerciseSets(
  programId: string,
  plannedExerciseId: string,
  payload: ReplacePlannedExerciseSetsPayload,
): Promise<PlannedExercise["sets"]> {
  const { data } = await api.put<PlannedExercise["sets"]>(
    `/plans/training/client-programs/${programId}/exercises/${plannedExerciseId}/sets`,
    payload,
  );
  return data;
}

export async function deletePlannedExercise(
  programId: string,
  plannedExerciseId: string,
): Promise<void> {
  await api.delete(
    `/plans/training/client-programs/${programId}/exercises/${plannedExerciseId}`,
  );
}

export async function updateClientProgramDraft(
  programId: string,
  payload: UpdateClientProgramPayload,
): Promise<ClientProgramDraft> {
  const { data } = await api.patch<ClientProgramDraft>(
    `/plans/training/client-programs/${programId}`,
    payload,
  );
  return data;
}

export async function archiveClientProgramDraft(
  programId: string,
): Promise<void> {
  await api.delete(`/plans/training/client-programs/${programId}`);
}

export async function publishClientProgram(
  programId: string,
): Promise<ClientProgramDraft> {
  const { data } = await api.post<ClientProgramDraft>(
    `/plans/training/client-programs/${programId}/publish`,
  );
  return data;
}

export async function rescheduleClientProgram(
  programId: string,
  startDate: string,
): Promise<ClientProgramDraft> {
  const { data } = await api.post<ClientProgramDraft>(
    `/plans/training/client-programs/${programId}/reschedule`,
    { startDate },
  );
  return data;
}

export async function cancelClientProgram(
  programId: string,
): Promise<ClientProgramDraft> {
  const { data } = await api.post<ClientProgramDraft>(
    `/plans/training/client-programs/${programId}/cancel`,
  );
  return data;
}
