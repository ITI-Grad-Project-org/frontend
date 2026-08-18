import { useQuery } from "@tanstack/react-query";
import { getClientProgress } from "@/services/analytics";
import { getApiErrorMessage } from "@/lib/api";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function useClientProgress(membershipId: string, from: string, to: string) {
  const query = useQuery({
    queryKey: ["analytics-client-progress", membershipId, from, to],
    queryFn: () => getClientProgress(membershipId, from, to),
    staleTime: 60 * 1000,
    enabled: Boolean(membershipId && from && to),
  });

  return {
    progress: query.data ?? null,
    loading: query.isPending,
    error: toError(query.error, "Failed to load client progress. Please try again."),
    refetch: () => void query.refetch(),
  };
}