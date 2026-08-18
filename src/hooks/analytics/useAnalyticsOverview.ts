import { useQuery } from "@tanstack/react-query";
import { getAnalyticsOverview } from "@/services/analytics";
import { getApiErrorMessage } from "@/lib/api";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function useAnalyticsOverview(from: string, to: string) {
  const query = useQuery({
    queryKey: ["analytics-overview", from, to],
    queryFn: () => getAnalyticsOverview(from, to),
    staleTime: 60 * 1000,
    enabled: Boolean(from && to),
  });

  return {
    overview: query.data,
    loading: query.isPending,
    error: toError(query.error, "Failed to load overview. Please try again."),
    refetch: () => void query.refetch(),
  };
}