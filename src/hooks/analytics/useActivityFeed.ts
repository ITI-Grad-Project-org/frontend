import { useQuery } from "@tanstack/react-query";
import { getAnalyticsActivity } from "@/services/analytics";
import { getApiErrorMessage } from "@/lib/api";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function useActivityFeed(from: string, to: string, limit = 100) {
  const query = useQuery({
    queryKey: ["analytics-activity", from, to, limit],
    queryFn: () => getAnalyticsActivity(from, to, limit),
    staleTime: 60 * 1000,
    enabled: Boolean(from && to),
  });

  return {
    events: query.data ?? [],
    loading: query.isPending,
    error: toError(query.error, "Failed to load activity. Please try again."),
    refetch: () => void query.refetch(),
  };
}