// src/hooks/ai/usePlanSuggestionPolling.ts
import { useCallback, useEffect, useState } from "react";
import { listPlanSuggestions } from "@/services/ai";
import type { AIPlanSuggestionKind } from "@/types/ai";

export const AI_POLL_INTERVAL_MS = 4_000;
export const AI_MAX_POLL_ATTEMPTS = 90;

export type AIPlanPollStatus =
  | "idle"
  | "polling"
  | "ready"
  | "failed"
  | "invalid"
  | "error";

type UsePlanSuggestionPollingOptions = {
  /** Start/stop the loop. Disabling also cancels a request in flight. */
  enabled: boolean;
  /** The suggestion we created and are waiting on. */
  suggestionId: string | null;
  membershipId: string;
  kind: AIPlanSuggestionKind;
  intervalMs?: number;
  maxAttempts?: number;
};

/**
 * Polls GET /ai/plan-suggestions until the created suggestion leaves the
 * pending state. Uses a recursive setTimeout — each poll runs only after the
 * previous request settles, so duplicate/overlapping requests never happen.
 * The loop is torn down on unmount, on `enabled` flipping off, and as soon as
 * a terminal status is observed.
 */
export function usePlanSuggestionPolling({
  enabled,
  suggestionId,
  membershipId,
  kind,
  intervalMs = AI_POLL_INTERVAL_MS,
  maxAttempts = AI_MAX_POLL_ATTEMPTS,
}: UsePlanSuggestionPollingOptions) {
  const [status, setStatus] = useState<AIPlanPollStatus>("idle");
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setAttempts(0);
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    if (!enabled || !suggestionId) return;

    let cancelled = false;
    let timer: number | null = null;
    let count = 0;

    const schedule = (fn: () => Promise<void>): void => {
      if (cancelled) return;
      timer = window.setTimeout(() => {
        void fn();
      }, intervalMs);
    };

    const poll = async (): Promise<void> => {
      if (cancelled) return;

      try {
        const { docs } = await listPlanSuggestions({
          membershipId,
          kind,
          limit: 20,
        });
        const match = docs.find((s) => s.id === suggestionId);

        if (match) {
          if (match.status === "ready") {
            setStatus("ready");
            return;
          }
          if (match.status === "failed" || match.status === "invalid") {
            setStatus(match.status);
            setErrorMessage(
              match.error ??
                (match.status === "failed"
                  ? "The AI could not generate a plan for this request."
                  : "The request was invalid and could not be generated."),
            );
            return;
          }
          if (match.status === "accepted" || match.status === "declined") {
            setStatus("error");
            setErrorMessage(
              "This suggestion has already been decided and can no longer be reviewed.",
            );
            return;
          }
        }
      } catch {
        // Transient network/API failure — stay graceful and poll again.
      }

      count += 1;
      setAttempts(count);
      if (count >= maxAttempts) {
        setStatus("error");
        setErrorMessage(
          "Generation is taking longer than usual. You can keep the request queued or start over.",
        );
        return;
      }
      schedule(poll);
    };

    void poll();

    return () => {
      cancelled = true;
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [
    enabled,
    suggestionId,
    membershipId,
    kind,
    intervalMs,
    maxAttempts,
  ]);

  return { status, attempts, errorMessage, reset };
}