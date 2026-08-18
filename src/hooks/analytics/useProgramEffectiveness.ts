import { useQuery } from "@tanstack/react-query";
import { getProgramEffectiveness } from "@/services/analytics";
import { getApiErrorMessage } from "@/lib/api";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function useProgramEffectiveness() {
  const query = useQuery({
    queryKey: ["analytics-program-effectiveness"],
    queryFn: getProgramEffectiveness,
    staleTime: 5 * 60 * 1000,
  });

  return {
    templates: query.data ?? [],
    loading: query.isPending,
    error: toError(
      query.error,
      "Failed to load program effectiveness. Please try again.",
    ),
    refetch: () => void query.refetch(),
  };
}