import { useQuery } from "@tanstack/react-query";
import { getAttentionQueue } from "@/services/analytics";
import { getApiErrorMessage } from "@/lib/api";
import {
  ATTENTION_ENDING_HORIZON_DAYS,
  ATTENTION_RISK_THRESHOLD_DAYS,
} from "@/types/analytics";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function useAttentionQueue(asOf: string) {
  const query = useQuery({
    queryKey: [
      "analytics-attention",
      asOf,
      ATTENTION_RISK_THRESHOLD_DAYS,
      ATTENTION_ENDING_HORIZON_DAYS,
    ],
    queryFn: () =>
      getAttentionQueue({
        asOf,
        riskThresholdDays: ATTENTION_RISK_THRESHOLD_DAYS,
        endingHorizonDays: ATTENTION_ENDING_HORIZON_DAYS,
      }),
    staleTime: 60 * 1000,
    enabled: Boolean(asOf),
  });

  return {
    queue: query.data,
    loading: query.isPending,
    error: toError(query.error, "Failed to load attention queue. Please try again."),
    refetch: () => void query.refetch(),
  };
}