import { useQuery } from "@tanstack/react-query";
import { getPendingMeasurementReviews } from "@/services/clients";
import { getApiErrorMessage } from "@/lib/api";
import type { MeasurementQueryParams } from "@/types/client";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function usePendingMeasurementReviews(params: MeasurementQueryParams = {}) {
  const query = useQuery({
    queryKey: [
      "measurements-reviews-pending",
      params.page,
      params.limit,
      params.from ?? null,
      params.to ?? null,
    ],
    queryFn: () => getPendingMeasurementReviews(params),
    staleTime: 30 * 1000,
  });

  return {
    docs: query.data?.docs ?? [],
    meta: query.data?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 1 },
    loading: query.isLoading,
    error: toError(query.error, "Failed to load pending reviews. Please try again."),
    refetch: () => void query.refetch(),
  };
}