import { useQuery } from "@tanstack/react-query";
import { getAdherenceSummary } from "@/services/analytics";
import { getApiErrorMessage } from "@/lib/api";
import type { AdherenceSummary } from "@/types/analytics";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

const EMPTY_ADHERENCE: AdherenceSummary = {
  scheduledSessions: 0,
  completedSessions: 0,
  partialSessions: 0,
  skippedSessions: 0,
  inProgressSessions: 0,
  sessionCompletionPct: 0,
  comparableSets: 0,
  prescribedVolume: 0,
  actualVolume: 0,
  volumeAdherencePct: null,
  setsCompleted: 0,
  setsPartial: 0,
  setsSkipped: 0,
  setsExtra: 0,
};

export function useAdherence(from: string, to: string, membershipId?: string) {
  const query = useQuery({
    queryKey: ["analytics-adherence", from, to, membershipId ?? null],
    queryFn: () => getAdherenceSummary({ from, to, membershipId }),
    staleTime: 60 * 1000,
    enabled: Boolean(from && to),
  });

  return {
    summary: query.data ?? EMPTY_ADHERENCE,
    loading: query.isPending,
    error: toError(query.error, "Failed to load these numbers. Please try again."),
    refetch: () => void query.refetch(),
  };
}