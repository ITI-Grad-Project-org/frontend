import { useQuery } from "@tanstack/react-query";
import { getTemplateSurvival } from "@/services/analytics";
import { getApiErrorMessage } from "@/lib/api";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function useTemplateSurvival(templateId: string | null) {
  const query = useQuery({
    queryKey: ["analytics-template-survival", templateId],
    queryFn: () => getTemplateSurvival(templateId as string),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(templateId),
  });

  return {
    survival: query.data ?? null,
    loading: query.isPending,
    error: toError(
      query.error,
      "Failed to load template survival. Please try again.",
    ),
    refetch: () => void query.refetch(),
  };
}