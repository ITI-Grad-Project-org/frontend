import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/api";
import { getClients } from "@/services/clients";
import { getClientPrograms } from "@/services/plans";
import type { ClientConnection } from "@/types/client";
import type {
  ClientProgramDraft,
  PlanStatus,
  PlanGoal,
  PlanDifficulty,
} from "@/types/plans";

// ─── Filter shape ─────────────────────────────────────────────────────────────

export type PlansFilters = {
  // API-backed filters — any change triggers a new network request
  search: string;
  membershipId: string; // "all" | uuid
  status: PlanStatus | "all";
  goal: PlanGoal | "all";
  difficulty: PlanDifficulty | "all";
  isArchived: boolean;
  // Client-side only — filters the response, no network request
  showCancelled: boolean;
};

const defaultFilters: PlansFilters = {
  search: "",
  membershipId: "all",
  status: "all",
  goal: "all",
  difficulty: "all",
  isArchived: false,
  showCancelled: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getClientName(connection: ClientConnection) {
  return (
    `${connection.client.firstName || ""} ${connection.client.lastName || ""}`.trim() ||
    connection.client.email
  );
}

export function formatFilterLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatPlanWindow(startDate: string, endDate: string) {
  return `${new Date(startDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} → ${new Date(endDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

function buildProgramParams(
  f: PlansFilters,
): Parameters<typeof getClientPrograms>[0] {
  const p: Parameters<typeof getClientPrograms>[0] = {};
  if (f.search.trim()) p.search = f.search.trim();
  if (f.membershipId !== "all") p.membershipId = f.membershipId;
  if (f.status !== "all") p.status = f.status;
  if (f.goal !== "all") p.goal = f.goal;
  if (f.difficulty !== "all") p.difficulty = f.difficulty;
  if (f.isArchived) p.isArchived = true;
  return p;
}

function sortByCreatedDesc(data: ClientProgramDraft[]): ClientProgramDraft[] {
  return [...data].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePlansData() {
  const [filters, setFilters] = useState<PlansFilters>(defaultFilters);

  // Clients are cached once and shared with the Clients page, logs, and the
  // nutrition hooks; each consumer derives its own view of the same cache.
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClients(),
    staleTime: 5 * 60_000,
  });

  // Each filter combination is its own cached query, so revisiting the Plans
  // page (or re-applying a filter) reads from cache instead of refetching.
  const programsQuery = useQuery({
    queryKey: ["programs", buildProgramParams(filters)],
    queryFn: async () => {
      const data = await getClientPrograms(buildProgramParams(filters));
      return Array.isArray(data) ? sortByCreatedDesc(data) : [];
    },
    staleTime: 5 * 60_000,
  });

  const clients = useMemo(
    () =>
      (clientsQuery.data ?? []).filter(
        (c) => c && c.client && c.status === "active",
      ),
    [clientsQuery.data],
  );
  const programs = useMemo(() => programsQuery.data ?? [], [programsQuery.data]);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  const refreshData = useCallback(() => {
    void programsQuery.refetch();
    void clientsQuery.refetch();
  }, [clientsQuery, programsQuery]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const clientNameMap = useMemo(
    () => new Map(clients.map((c) => [c.id, getClientName(c)])),
    [clients],
  );

  const clientMembershipMap = useMemo(
    () => new Map(clients.map((c) => [c.id, getClientName(c)])),
    [clients],
  );

  // Client-side only: strip cancelled plans when the toggle is off
  const filteredPrograms = useMemo(
    () =>
      filters.showCancelled
        ? programs
        : programs.filter((p) => p.status !== "cancelled"),
    [programs, filters.showCancelled],
  );

  const stats = useMemo(
    () => ({
      total: programs.length,
      drafts: programs.filter((p) => p.status === "draft").length,
      canceled: programs.filter((p) => p.status === "cancelled").length,
      activeClients: clients.length,
    }),
    [clients.length, programs],
  );

  return {
    clients,
    programs,
    filteredPrograms,
    stats,
    filters,
    setFilters,
    isLoading: programsQuery.isPending,
    loadError: toError(programsQuery.error, "Failed to load plans. Please try again."),
    isRefreshing: programsQuery.isFetching && !programsQuery.isPending,
    refreshData,
    resetFilters,
    clientNameMap,
    clientMembershipMap,
  };
}