import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getClientById } from "@/services/clients";
import { getApiErrorMessage } from "@/lib/api";
import type { ClientConnection } from "@/types/client";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function useClientProfile(clientId: string) {
  const queryClient = useQueryClient();

  // The route param can be either the client id (connection.client.id) or —
  // if a stale link/URL was used — the membership id (connection.id).
  // Resolve membership → client id from the shared ["clients"] cache so
  // GET /client/{id} always receives a real client id.
  const resolvedClientId = useMemo(() => {
    if (!clientId) return "";
    const connections = queryClient.getQueryData<ClientConnection[]>(["clients"]);
    const match = connections?.find((c) => c.id === clientId);
    return match?.client?.id ?? clientId;
  }, [clientId, queryClient]);

  const query = useQuery({
    queryKey: ["client-profile", clientId],
    queryFn: () => getClientById(resolvedClientId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(clientId),
  });

  return {
    connection: query.data ?? null,
    loading: query.isLoading,
    error: toError(query.error, "Failed to load client. Please try again."),
    refetch: () => void query.refetch(),
  };
}