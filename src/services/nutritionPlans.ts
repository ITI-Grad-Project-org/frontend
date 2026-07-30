// src/services/nutritionPlans.ts
import { api } from "@/lib/api";
import type {
  CreateClientNutritionPlanPayload,
  GetNutritionPlansParams,
  NutritionPlanSummary,
  NutritionPlanTree,
  UpdateClientNutritionPlanPayload,
} from "@/types/nutritionPlans";

const BASE_URL = "/plans/nutrition/client-plans";

/** POST /plans/nutrition/client-plans - Create a dated client nutrition plan draft */
export async function createNutritionPlanDraft(
  payload: CreateClientNutritionPlanPayload,
): Promise<NutritionPlanSummary> {
  const { data } = await api.post<NutritionPlanSummary>(BASE_URL, payload);
  return data;
}

/** GET /plans/nutrition/client-plans - List coach nutrition plans */
export async function getNutritionPlans(
  params: GetNutritionPlansParams = {},
): Promise<NutritionPlanSummary[]> {
  const query: Record<string, string> = {};

  if (params.search?.trim()) query.search = params.search.trim();
  if (params.membershipId && params.membershipId !== "all") {
    query.membershipId = params.membershipId;
  }
  if (params.status && params.status !== ("all" as string)) {
    query.status = params.status;
  }
  if (params.goal && params.goal !== ("all" as string)) {
    query.goal = params.goal;
  }
  if (params.isArchived === true) {
    query.isArchived = "true";
  }

  const { data } = await api.get<NutritionPlanSummary[]>(BASE_URL, {
    params: query,
  });
  return Array.isArray(data) ? data : [];
}

/** GET /plans/nutrition/client-plans/:planId - Get full builder tree */
export async function getNutritionPlan(planId: string): Promise<NutritionPlanTree> {
  const { data } = await api.get<NutritionPlanTree>(`${BASE_URL}/${planId}`);
  return data;
}

/** PATCH /plans/nutrition/client-plans/:planId - Update draft metadata & targets */
export async function updateNutritionPlanDraft(
  planId: string,
  payload: UpdateClientNutritionPlanPayload,
): Promise<NutritionPlanSummary> {
  const { data } = await api.patch<NutritionPlanSummary>(
    `${BASE_URL}/${planId}`,
    payload,
  );
  return data;
}

/** DELETE /plans/nutrition/client-plans/:planId - Archive plan */
export async function archiveNutritionPlan(planId: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`${BASE_URL}/${planId}`);
  return data;
}

/** POST /plans/nutrition/client-plans/:planId/unarchive - Restore archived plan */
export async function unarchiveNutritionPlan(planId: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    `${BASE_URL}/${planId}/unarchive`,
  );
  return data;
}

/** POST /plans/nutrition/client-plans/:planId/publish - Publish plan draft */
export async function publishNutritionPlan(planId: string): Promise<NutritionPlanSummary> {
  const { data } = await api.post<NutritionPlanSummary>(`${BASE_URL}/${planId}/publish`);
  return data;
}

/** POST /plans/nutrition/client-plans/:planId/reschedule - Reschedule plan */
export async function rescheduleNutritionPlan(
  planId: string,
  startDate: string,
): Promise<NutritionPlanSummary> {
  const { data } = await api.post<NutritionPlanSummary>(
    `${BASE_URL}/${planId}/reschedule`,
    { startDate },
  );
  return data;
}

/** POST /plans/nutrition/client-plans/:planId/cancel - Cancel published plan */
export async function cancelNutritionPlan(planId: string): Promise<NutritionPlanSummary> {
  const { data } = await api.post<NutritionPlanSummary>(`${BASE_URL}/${planId}/cancel`);
  return data;
}
