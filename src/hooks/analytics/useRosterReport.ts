import { useQuery } from "@tanstack/react-query";
import { getRosterReport } from "@/services/analytics";
import { getApiErrorMessage } from "@/lib/api";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function useRosterReport(from: string, to: string) {
  const query = useQuery({
    queryKey: ["analytics-roster", from, to],
    queryFn: () => getRosterReport(from, to),
    staleTime: 60 * 1000,
    enabled: Boolean(from && to),
  });

  return {
    report: query.data ?? null,
    loading: query.isPending,
    error: toError(query.error, "Failed to load roster. Please try again."),
    refetch: () => void query.refetch(),
  };
}