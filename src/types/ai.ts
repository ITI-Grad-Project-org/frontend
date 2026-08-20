// src/types/ai.ts
// AI plan-suggestion flow. Mirrors the `/ai/plan-suggestions` API contract —
// shared by both training ("program") and nutrition ("plan") suggestions.

import type { PlanGoal } from "@/types/plans";

export type AIPlanSuggestionKind = "training" | "nutrition";

export type AIPlanSuggestionStatus =
  | "pending"
  | "ready"
  | "invalid"
  | "failed"
  | "accepted"
  | "declined";

export interface AICreatePlanSuggestionPayload {
  membershipId: string;
  kind: AIPlanSuggestionKind;
  /** 1–52, defaults to 4. */
  durationWeeks?: number;
  /** Training only. Defaults to the intake's trainingDaysPerWeek, then 3. */
  daysPerWeek?: number;
  /** Overrides the intake goal for this plan only. */
  goal?: PlanGoal;
  coachNotes?: string;
}

export interface AIPlanConstraints {
  goal: PlanGoal | null;
  daysPerWeek: number | null;
  durationWeeks: number;
}

export interface AIPlanLibrary {
  counts: {
    exercises?: number;
    meals?: number;
    foods?: number;
  };
  equipment: string[];
  excludedAllergens: string[];
  truncated: boolean;
}

export interface AIPlanWarningCounts {
  error: number;
  warning: number;
}

/** POST /ai/plan-suggestions (201) — generation is queued, not finished. */
export interface AIPlanSuggestionCreated {
  suggestionId: string;
  requestId: string;
  membershipId: string;
  kind: AIPlanSuggestionKind;
  status: AIPlanSuggestionStatus;
  createdAt: string;
  constraints: AIPlanConstraints;
  library: AIPlanLibrary;
}

export interface AIPlanSuggestionSummary {
  id: string;
  requestId: string;
  membershipId: string;
  kind: AIPlanSuggestionKind;
  status: AIPlanSuggestionStatus;
  constraints: AIPlanConstraints;
  library: AIPlanLibrary;
  warningCounts: AIPlanWarningCounts;
  error: string | null;
  createdProgramId: string | null;
  createdPlanId: string | null;
  declineReason: string | null;
  createdAt: string;
  decidedAt: string | null;
}

export interface AIPlanSuggestionListResponse {
  docs: AIPlanSuggestionSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AIPlanSuggestionListParams {
  membershipId?: string;
  kind?: AIPlanSuggestionKind;
  status?: AIPlanSuggestionStatus;
  page?: number;
  limit?: number;
}

// ─── Generated plan shapes (kind-specific) ─────────────────────────────────────

export interface AITrainingSuggestionSet {
  repsMax: number | null;
  repsMin: number | null;
  setType: string;
  setNumber: number;
  intensityType: string | null;
  intensityValue: number | null;
  durationSeconds: number | null;
}

export interface AITrainingSuggestionExercise {
  exerciseId: string;
  position: number;
  supersetGroup: number | null;
  restSeconds: number;
  tempo: string | null;
  coachNotes: string | null;
  sets: AITrainingSuggestionSet[];
}

export interface AITrainingSuggestionDay {
  name: string | null;
  notes: string | null;
  dayNumber: number;
  isRestDay: boolean;
  exercises: AITrainingSuggestionExercise[];
}

export interface AITrainingSuggestionPlan {
  name: string;
  description: string;
  difficulty: string;
  week: {
    days: AITrainingSuggestionDay[];
  };
  progression: {
    note: string;
    strategy: string;
  };
}

export interface AINutritionSuggestionMeal {
  slot: string;
  position: number;
  servings: number;
  coachNotes: string | null;
  sourceMealId: string | null;
  suggestedTime: string | null;
}

export interface AINutritionSuggestionDay {
  dayNumber: number;
  isFlexibleDay: boolean;
  notes: string | null;
  meals: AINutritionSuggestionMeal[];
}

export interface AINutritionSuggestionPlan {
  name: string;
  description: string;
  week: {
    days: AINutritionSuggestionDay[];
  };
  targets: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number | null;
    waterMl: number;
  };
  progression: {
    note: string;
    strategy: string;
  };
}

// ─── Suggestion detail ────────────────────────────────────────────────────────

export interface AIPlanSuggestionClientSnapshot {
  gender?: string;
  ageYears?: number;
  heightCm?: number;
  weightKg?: number;
  [key: string]: unknown;
}

export interface AIPlanSuggestionInput {
  client?: AIPlanSuggestionClientSnapshot | null;
  constraints?: AIPlanConstraints | null;
  coachNotes?: string | null;
  [key: string]: unknown;
}

export interface AIPlanModelMeta {
  model: string;
  latencyMs: number;
  totalTokens: number;
  finishReason: string;
  outputTokens: number;
  promptTokens: number;
}

export interface AIPlanSuggestionDetail {
  id: string;
  requestId: string;
  membershipId: string;
  kind: AIPlanSuggestionKind;
  status: AIPlanSuggestionStatus;
  constraints: AIPlanConstraints;
  library: AIPlanLibrary;
  warningCounts: AIPlanWarningCounts;
  error: string | null;
  createdProgramId: string | null;
  createdPlanId: string | null;
  declineReason: string | null;
  createdAt: string;
  decidedAt: string | null;
  input: AIPlanSuggestionInput;
  plan: AITrainingSuggestionPlan | AINutritionSuggestionPlan | null;
  warnings: unknown[];
  modelMeta: AIPlanModelMeta;
}

// ─── Decision payloads ────────────────────────────────────────────────────────

export interface AIPlanAcceptPayload {
  startDate: string;
  name: string;
}

export interface AIPlanDeclinePayload {
  reason: string;
}