import { useQuery } from "@tanstack/react-query";
import {
  getClientMeasurementById,
  getClientMeasurements,
} from "@/services/clients";
import { getApiErrorMessage } from "@/lib/api";
import type { MeasurementQueryParams } from "@/types/client";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function useClientMeasurements(clientId: string, params: MeasurementQueryParams) {
  const query = useQuery({
    queryKey: [
      "client-measurements",
      clientId,
      params.page,
      params.limit,
      params.from ?? null,
      params.to ?? null,
    ],
    queryFn: () => getClientMeasurements(clientId, params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(clientId),
  });

  return {
    docs: query.data?.docs ?? [],
    meta: query.data?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 1 },
    loading: query.isLoading,
    error: toError(query.error, "Failed to load measurements. Please try again."),
    refetch: () => void query.refetch(),
  };
}

export function useClientMeasurement(clientId: string, measurementId: string | null) {
  const query = useQuery({
    queryKey: ["client-measurement", clientId, measurementId],
    queryFn: () => getClientMeasurementById(clientId, measurementId as string),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(clientId && measurementId),
  });

  return {
    measurement: query.data ?? null,
    loading: query.isLoading,
    error: toError(query.error, "Failed to load measurement. Please try again."),
  };
}