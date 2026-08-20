import { api } from "@/lib/api";
import type {
  AICreatePlanSuggestionPayload,
  AIPlanAcceptPayload,
  AIPlanDeclinePayload,
  AIPlanSuggestionCreated,
  AIPlanSuggestionDetail,
  AIPlanSuggestionListParams,
  AIPlanSuggestionListResponse,
} from "@/types/ai";

const BASE_URL = "/ai/plan-suggestions";

/** POST /ai/plan-suggestions — queue AI plan generation for a client. */
export async function createPlanSuggestion(
  payload: AICreatePlanSuggestionPayload,
): Promise<AIPlanSuggestionCreated> {
  const { data } = await api.post<AIPlanSuggestionCreated>(BASE_URL, payload);
  return data;
}

/** GET /ai/plan-suggestions — list suggestions, newest first (summaries only). */
export async function listPlanSuggestions(
  params: AIPlanSuggestionListParams = {},
): Promise<AIPlanSuggestionListResponse> {
  const query: Record<string, string> = {};

  if (params.membershipId) query.membershipId = params.membershipId;
  if (params.kind) query.kind = params.kind;
  if (params.status) query.status = params.status;
  if (params.page !== undefined) query.page = String(params.page);
  if (params.limit !== undefined) query.limit = String(params.limit);

  const { data } = await api.get<AIPlanSuggestionListResponse>(BASE_URL, {
    params: query,
  });
  return data;
}

/** GET /ai/plan-suggestions/{id} — one suggestion, including the proposed plan. */
export async function getPlanSuggestion(
  suggestionId: string,
): Promise<AIPlanSuggestionDetail> {
  const { data } = await api.get<AIPlanSuggestionDetail>(
    `${BASE_URL}/${suggestionId}`,
  );
  return data;
}

/** POST /ai/plan-suggestions/{id}/accept — build the real plan as a draft. */
export async function acceptPlanSuggestion(
  suggestionId: string,
  payload: AIPlanAcceptPayload,
): Promise<void> {
  await api.post(`${BASE_URL}/${suggestionId}/accept`, payload);
}

/** POST /ai/plan-suggestions/{id}/decline — record the decision + reason. */
export async function declinePlanSuggestion(
  suggestionId: string,
  payload: AIPlanDeclinePayload,
): Promise<void> {
  await api.post(`${BASE_URL}/${suggestionId}/decline`, payload);
}