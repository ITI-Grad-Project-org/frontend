import { api } from "@/lib/api";
import type {
  AdherenceSummary,
  ActivityEvent,
  AnalyticsOverview,
  AttentionQueue,
  ClientProgress,
  RosterReport,
  TemplateEffectiveness,
  TemplateSurvival,
} from "@/types/analytics";

/** GET /analytics/overview — coach home screen in one call */
export async function getAnalyticsOverview(from: string, to: string) {
  const { data } = await api.get<AnalyticsOverview>("/analytics/overview", {
    params: { from, to },
  });
  return data;
}

/** GET /analytics/attention — queues sorted most-urgent-first */
export async function getAttentionQueue(params: {
  asOf?: string;
  riskThresholdDays?: number;
  endingHorizonDays?: number;
}) {
  const { data } = await api.get<AttentionQueue>("/analytics/attention", {
    params,
  });
  return data;
}

/** GET /analytics/activity — what clients logged, newest first */
export async function getAnalyticsActivity(from: string, to: string, limit = 50) {
  const { data } = await api.get<ActivityEvent[]>("/analytics/activity", {
    params: { from, to, limit },
  });
  return data;
}

/** GET /analytics/clients/{membershipId}/progress — outcomes for one client */
export async function getClientProgress(
  membershipId: string,
  from: string,
  to: string,
) {
  const { data } = await api.get<ClientProgress>(
    `/analytics/clients/${membershipId}/progress`,
    { params: { from, to } },
  );
  return data;
}

/** GET /analytics/roster — status mix, MRR, clients ranked worst-adherence-first */
export async function getRosterReport(from: string, to: string) {
  const { data } = await api.get<RosterReport>("/analytics/roster", {
    params: { from, to },
  });
  return data;
}

/** GET /analytics/adherence — completion against the prescription */
export async function getAdherenceSummary(
  params: {
    from: string;
    to: string;
    membershipId?: string;
  },
) {
  const { data } = await api.get<AdherenceSummary>("/analytics/adherence", {
    params,
  });
  return data;
}

/** GET /analytics/programs/effectiveness — whole-history template track record */
export async function getProgramEffectiveness() {
  const { data } = await api.get<TemplateEffectiveness[]>(
    "/analytics/programs/effectiveness",
  );
  return data;
}

/** GET /analytics/programs/{templateId}/survival — retention curve */
export async function getTemplateSurvival(templateId: string) {
  const { data } = await api.get<TemplateSurvival>(
    `/analytics/programs/${templateId}/survival`,
  );
  return data;
}