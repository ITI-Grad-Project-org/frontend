// src/hooks/ai/useAISuggestionsData.ts
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/api";
import { getClients } from "@/services/clients";
import { listPlanSuggestions } from "@/services/ai";
import type { ClientConnection } from "@/types/client";
import type { AIPlanSuggestionKind, AIPlanSuggestionStatus } from "@/types/ai";

export type AISuggestionsFilters = {
  kind: AIPlanSuggestionKind | "all";
  status: AIPlanSuggestionStatus | "all";
};

const defaultFilters: AISuggestionsFilters = {
  kind: "all",
  status: "ready",
};

function getClientName(connection: ClientConnection) {
  return (
    `${connection.client.firstName || ""} ${connection.client.lastName || ""}`.trim() ||
    connection.client.email
  );
}

export function useAISuggestionsData() {
  const [filters, setFilters] = useState<AISuggestionsFilters>(defaultFilters);

  // Clients are cached once and shared across the dashboard; consumers derive
  // their own view of the same cache.
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClients(),
    staleTime: 5 * 60_000,
  });

  const params = useMemo(() => {
    const p: { kind?: AIPlanSuggestionKind; status?: AIPlanSuggestionStatus; limit?: number } = {
      limit: 50,
    };
    if (filters.kind !== "all") p.kind = filters.kind;
    if (filters.status !== "all") p.status = filters.status;
    return p;
  }, [filters]);

  const suggestionsQuery = useQuery({
    queryKey: ["ai-plan-suggestions", params],
    queryFn: () => listPlanSuggestions(params),
    staleTime: 10_000,
    refetchInterval: (query) =>
      query.state.data?.docs.some((s) => s.status === "pending") ? 15_000 : false,
  });

  const clientNameMap = useMemo(
    () => new Map((clientsQuery.data ?? []).map((connection) => [connection.id, getClientName(connection)])),
    [clientsQuery.data],
  );

  const handleFiltersChange = (next: Partial<AISuggestionsFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  return {
    clients: clientsQuery.data ?? [],
    suggestions: suggestionsQuery.data?.docs ?? [],
    suggestionCount: suggestionsQuery.data?.meta.total ?? 0,
    isLoading: suggestionsQuery.isPending,
    loadError: suggestionsQuery.error
      ? getApiErrorMessage(suggestionsQuery.error, "We could not load the AI suggestions.")
      : null,
    filters,
    handleFiltersChange,
    clientNameMap,
    refreshSuggestions: () => void suggestionsQuery.refetch(),
  };
}