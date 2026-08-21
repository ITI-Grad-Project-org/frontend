/**
 * Wire types for the AI assistant gateway (socket.io v4, default namespace).
 *
 * The assistant is NOT a REST job-ticket API. One `ai.requested` emit is
 * answered out-of-band by a separate `ai.completed` event, and nothing is
 * persisted server-side.
 */

/** Prompts longer than this are rejected by the gateway. */
export const MAX_PROMPT_LENGTH = 4000;

/**
 * Free-text label, not an enum — it is interpolated into the prompt as
 * `=== Request (kind: advice) ===` to nudge the model's register.
 */
export type AiRequestKind = "advice";

// ── client → server ──────────────────────────────────────────────────────────

export interface AiRequestPayload {
  kind: AiRequestKind;
  prompt: string;
  /**
   * Coach only, optional. Set it and retrieval may draw on that one client's
   * intake and check-ins; omit it and the answer is grounded only in the
   * coach's library and the curated corpus.
   */
  membershipId?: string | null;
  /** Metadata only — echoed back on `ai.completed`, grants no access. */
  clientId?: string | null;
}

// ── server → client ──────────────────────────────────────────────────────────

/** Queued. `requestId` is the ONLY way to correlate the eventual answer. */
export interface AiAccepted {
  requestId: string;
}

export interface AiCompleted {
  requestId: string;
  clientId: string | null;
  coachId: string | null;
  coachEmail: string | null;
  status: "succeeded" | "failed";
  /**
   * On `succeeded`, the assistant's answer as Markdown-flavoured prose.
   * On `failed`, an internal diagnostic — log it, NEVER render it.
   */
  summary: string;
}

/** No answer within the server timeout. Advisory, NOT final. */
export interface AiTimedOut {
  requestId: string;
}

/** Malformed request. Carries no `requestId`. */
export interface AiRejected {
  message: string;
}

/** Token missing/invalid/expired. Socket closed immediately after. */
export interface AiUnauthorized {
  message: string;
}

/** Unhandled server-side error. No `requestId`. */
export interface WsException {
  statusCode: number;
  message: string;
  timestamp: string;
}

// ── local view model ─────────────────────────────────────────────────────────

export type AiMessageRole = "user" | "assistant" | "system";

/**
 * `thinking` covers both waiting-for-`ai.accepted` and waiting-for-
 * `ai.completed`; `slow` is the same wait after an `ai.timed_out` advisory.
 * `stopped` is a purely LOCAL abandon — the gateway has no cancel event.
 */
export type AiMessageState = "thinking" | "slow" | "failed" | "stopped";

export interface AiMessage {
  id: string;
  role: AiMessageRole;
  text: string;
  state?: AiMessageState;
  /** Set on the assistant placeholder once `ai.accepted` lands. */
  requestId?: string;
  /** Display name of the client this question was scoped to. */
  scopeName?: string;
}
