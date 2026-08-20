import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getClientById, getClients } from "@/services/clients";
import { getApiErrorMessage } from "@/lib/api";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function useClientProfile(clientId: string) {
  // The route param can be either the client id (connection.client.id) or —
  // for links coming from the analytics attention band — the membership id
  // (connection.id). Resolve membership → client id from the shared
  // ["clients"] query before calling GET /client/{id}, which expects a real
  // client id. We piggyback on the shared query here so cold caches (any
  // page that doesn't load useClientsData) still resolve correctly.
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(clientId),
  });

  const resolvedClientId = useMemo(() => {
    if (!clientId) return "";
    const match = clientsQuery.data?.find((c) => c.id === clientId);
    return match?.client?.id ?? clientId;
  }, [clientId, clientsQuery.data]);

  const clientsReady = clientsQuery.isSuccess || clientsQuery.isError;

  const query = useQuery({
    queryKey: ["client-profile", clientId],
    queryFn: () => getClientById(resolvedClientId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(clientId && resolvedClientId && clientsReady),
  });

  return {
    connection: query.data ?? null,
    loading: query.isLoading || clientsQuery.isLoading,
    error: toError(query.error, "Failed to load client. Please try again."),
    refetch: () => void query.refetch(),
  };
}