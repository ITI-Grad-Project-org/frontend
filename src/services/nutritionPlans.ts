import { api } from "@/lib/api";
import type { Meal } from "@/types/nutrition";
import type {
  AddMealFromLibraryPayload,
  CreateClientNutritionPlanPayload,
  CreateLibraryMealAndAddPayload,
  GetNutritionPlansParams,
  NutritionPlanDay,
  NutritionPlanMeal,
  NutritionPlanSummary,
  NutritionPlanTree,
  ReplacePlannedMealItemsPayload,
  UpdateClientNutritionPlanPayload,
  UpdateNutritionPlanDayPayload,
  UpdatePlannedMealPayload,
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
export async function getNutritionPlan(
  planId: string,
): Promise<NutritionPlanTree> {
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
export async function archiveNutritionPlan(
  planId: string,
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `${BASE_URL}/${planId}`,
  );
  return data;
}

/** POST /plans/nutrition/client-plans/:planId/unarchive - Restore archived plan */
export async function unarchiveNutritionPlan(
  planId: string,
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    `${BASE_URL}/${planId}/unarchive`,
  );
  return data;
}

/** POST /plans/nutrition/client-plans/:planId/publish - Publish plan draft */
export async function publishNutritionPlan(
  planId: string,
): Promise<NutritionPlanSummary> {
  const { data } = await api.post<NutritionPlanSummary>(
    `${BASE_URL}/${planId}/publish`,
  );
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
export async function cancelNutritionPlan(
  planId: string,
): Promise<NutritionPlanSummary> {
  const { data } = await api.post<NutritionPlanSummary>(
    `${BASE_URL}/${planId}/cancel`,
  );
  return data;
}

// ─── Day & Planned Meal Builder API ───────────────────────────────────────────

/** PATCH /plans/nutrition/client-plans/:planId/days/:dayId - Update day overrides, flexible state, notes */
export async function updateNutritionPlanDay(
  planId: string,
  dayId: string,
  payload: UpdateNutritionPlanDayPayload,
): Promise<NutritionPlanDay> {
  const { data } = await api.patch<NutritionPlanDay>(
    `${BASE_URL}/${planId}/days/${dayId}`,
    payload,
  );
  return data;
}

/** POST /plans/nutrition/client-plans/:planId/days/:dayId/meals/from-library - Snapshot reusable Meal into day */
export async function addMealFromLibraryToDay(
  planId: string,
  dayId: string,
  payload: AddMealFromLibraryPayload,
): Promise<NutritionPlanMeal> {
  const { data } = await api.post<NutritionPlanMeal>(
    `${BASE_URL}/${planId}/days/${dayId}/meals/from-library`,
    payload,
  );
  return data;
}

/** POST /plans/nutrition/client-plans/:planId/days/:dayId/meals/create-in-library - Create library Meal and snapshot into day */
export async function createLibraryMealAndAddToDay(
  planId: string,
  dayId: string,
  payload: CreateLibraryMealAndAddPayload,
): Promise<{ meal: Meal; plannedMeal: NutritionPlanMeal }> {
  const { data } = await api.post<{
    meal: Meal;
    plannedMeal: NutritionPlanMeal;
  }>(`${BASE_URL}/${planId}/days/${dayId}/meals/create-in-library`, payload);
  return data;
}

/** PATCH /plans/nutrition/client-plans/:planId/meals/:plannedMealId - Edit slot, position, suggested time, coach notes */
export async function updatePlannedMeal(
  planId: string,
  plannedMealId: string,
  payload: UpdatePlannedMealPayload,
): Promise<NutritionPlanMeal> {
  const { data } = await api.patch<NutritionPlanMeal>(
    `${BASE_URL}/${planId}/meals/${plannedMealId}`,
    payload,
  );
  return data;
}

/** DELETE /plans/nutrition/client-plans/:planId/meals/:plannedMealId - Delete planned Meal from day */
export async function deletePlannedMeal(
  planId: string,
  plannedMealId: string,
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `${BASE_URL}/${planId}/meals/${plannedMealId}`,
  );
  return data;
}

/** PUT /plans/nutrition/client-plans/:planId/meals/:plannedMealId/items - Replace planned Food amounts and order */
export async function replacePlannedMealItems(
  planId: string,
  plannedMealId: string,
  payload: ReplacePlannedMealItemsPayload,
): Promise<NutritionPlanMeal> {
  const { data } = await api.put<NutritionPlanMeal>(
    `${BASE_URL}/${planId}/meals/${plannedMealId}/items`,
    payload,
  );
  return data;
}

/** GET /plans/nutrition/client-plans/:planId/logs - Review all nutrition logs for one plan */
export async function getNutritionPlanLogs(
  planId: string,
): Promise<import("@/types/nutritionPlans").NutritionPlanLogsResponse> {
  const { data } = await api.get(`${BASE_URL}/${planId}/logs`);
  return data;
}

/** GET /plans/nutrition/client-plans/:planId/days/:dayId/log - Review one day prescription vs actual intake */
export async function getNutritionPlanDayLog(
  planId: string,
  dayId: string,
): Promise<import("@/types/nutritionPlans").NutritionPlanDayLogResponse> {
  const { data } = await api.get(`${BASE_URL}/${planId}/days/${dayId}/log`);
  return data;
}
