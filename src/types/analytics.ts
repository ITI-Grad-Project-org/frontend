/** Mirrors GET /analytics/overview */
export interface AnalyticsOverview {
  from: string;
  to: string;
  roster: {
    active: number;
    paused: number;
    invited: number;
    requested: number;
    archived: number;
    mrrByCurrency: Record<string, number>;
  };
  sessionAdherencePct: number;
  checkinsAwaitingReview: number;
  clientsAtRisk: number;
  programsEndingSoon: number;
  thisWeek: {
    weekStart: string;
    weekEnd: string;
    sessionsLogged: number;
    previousWeekSessions: number;
    changePct: number;
    byDay: AnalyticsWeekDay[];
  };
}

export interface AnalyticsWeekDay {
  date: string;
  dayOfWeek: number;
  sessions: number;
}

/** Mirrors a client on the at-risk queue */
export interface AtRiskClient {
  membershipId: string;
  clientName: string;
  lastActivityOn: string | null;
  daysSilent: number;
}

/** Mirrors a check-in awaiting review */
export interface PendingCheckin {
  membershipId: string;
  clientName: string;
  submittedAt: string;
  hoursWaiting: number;
}

/** Mirrors a program that ends within the horizon */
export interface ProgramEndingSoon {
  programId: string;
  membershipId: string;
  clientName: string;
  programName: string;
  endsOn: string;
  daysRemaining: number;
  completionPct: number;
}

/** Mirrors GET /analytics/attention */
export interface AttentionQueue {
  asOf: string;
  riskThresholdDays: number;
  endingHorizonDays: number;
  atRisk: AtRiskClient[];
  checkinsAwaitingReview: PendingCheckin[];
  programsEndingSoon: ProgramEndingSoon[];
}

export type AnalyticsActivityType =
  | "workout_set_reported"
  | "workout_session_reported"
  | "nutrition_meal_reported"
  | "measurement_reported"
  | "checkin_reported"
  | string;

/** Mirrors a row in GET /analytics/activity */
export interface ActivityEvent {
  membershipId: string;
  clientName: string;
  activityType: AnalyticsActivityType;
  activityDate: string;
  occurredAt: string;
}

/** Mirrors the summary of GET /analytics/roster */
export interface RosterSummary {
  active: number;
  paused: number;
  invited: number;
  requested: number;
  archived: number;
  mrrByCurrency: Record<string, number>;
}

/** Mirrors a client row in GET /analytics/roster */
export interface RosterClient {
  membershipId: string;
  clientName: string;
  status: string;
  joinedOn: string;
  scheduledSessions: number;
  completedSessions: number;
  adherencePct: number | null;
  lastActivityOn: string | null;
  daysSinceLastActivity: number | null;
  monthlyPrice: number | null;
  currency: string;
}

/** Mirrors GET /analytics/roster */
export interface RosterReport {
  from: string;
  to: string;
  summary: RosterSummary;
  clients: RosterClient[];
}

/** Mirrors GET /analytics/adherence */
export interface AdherenceSummary {
  scheduledSessions: number;
  completedSessions: number;
  partialSessions: number;
  skippedSessions: number;
  inProgressSessions: number;
  sessionCompletionPct: number;
  comparableSets: number;
  prescribedVolume: number;
  actualVolume: number;
  volumeAdherencePct: number | null;
  setsCompleted: number;
  setsPartial: number;
  setsSkipped: number;
  setsExtra: number;
}

/** Mirrors a body measurement entry in GET /analytics/clients/{id}/progress */
export interface ClientMeasurementPoint {
  measuredOn: string;
  weightKg: number | null;
  bodyFatPct: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipsCm: number | null;
  armCm: number | null;
  thighCm: number | null;
}

/** Mirrors a strength exercise entry in GET /analytics/clients/{id}/progress */
export interface StrengthExercise {
  exerciseName: string;
  firstE1rmKg: number;
  latestE1rmKg: number;
  bestE1rmKg: number;
  changePct: number | null;
  points: StrengthPoint[];
}

export interface StrengthPoint {
  date: string;
  bestE1rmKg: number;
  sets: number;
  volumeKg: number;
}

/** Mirrors GET /analytics/clients/{id}/progress */
export interface ClientProgress {
  membershipId: string;
  clientName: string;
  from: string;
  to: string;
  measurements: ClientMeasurementPoint[];
  strength: StrengthExercise[];
}

/** Mirrors a row in GET /analytics/programs/effectiveness */
export interface TemplateEffectiveness {
  templateId: string;
  templateName: string;
  assignments: number;
  avgLastActiveWeek: number;
  durationWeeks: number;
  avgCompletionPct: number;
}

/** Mirrors GET /analytics/programs/{templateId}/survival */
export interface TemplateSurvival {
  templateId: string;
  templateName: string;
  weeks: TemplateSurvivalWeek[];
}

export interface TemplateSurvivalWeek {
  week: number;
  clientsStarted: number;
  clientsActive: number;
  retentionPct: number;
}

/** Default attention thresholds — keep in sync with overview badge computation. */
export const ATTENTION_RISK_THRESHOLD_DAYS = 7;
export const ATTENTION_ENDING_HORIZON_DAYS = 14;