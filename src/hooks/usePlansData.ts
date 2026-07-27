import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePlansData() {
  const [clients, setClients] = useState<ClientConnection[]>([]);
  const [programs, setPrograms] = useState<ClientProgramDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<PlansFilters>(defaultFilters);

  // Incremented before every fetch — stale responses whose seq no longer
  // matches seqRef.current are silently dropped.
  const seqRef = useRef(0);

  // Keep a ref to the latest filters so the effect callback always reads the
  // current value without needing filters itself in the dependency array.
  // showCancelled is intentionally excluded from triggering a fetch.
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  });

  // ── Effect: fetch clients + programs together on mount and on every
  //    API-backed filter change. Always fetching both avoids any ref-based
  //    "is this the first run?" logic that breaks under React Strict Mode.
  useEffect(() => {
    const seq = ++seqRef.current;

    Promise.all([
      getClients(),
      getClientPrograms(buildProgramParams(filtersRef.current)),
    ])
      .then(([clientData, programData]) => {
        if (seq !== seqRef.current) return;

        setIsLoading(false);
        setLoadError("");
        setClients(
          Array.isArray(clientData)
            ? clientData.filter((c) => c && c.client && c.status === "active")
            : [],
        );
        setPrograms(
          Array.isArray(programData) ? sortByCreatedDesc(programData) : [],
        );
      })
      .catch((error) => {
        if (seq !== seqRef.current) return;
        const message = getApiErrorMessage(
          error,
          "Failed to load plans. Please try again.",
        );
        setIsLoading(false);
        setLoadError(message);
        toast.error(message);
      });
  }, [
    // showCancelled intentionally omitted — it's a client-side filter
    filters.search,
    filters.membershipId,
    filters.status,
    filters.goal,
    filters.difficulty,
    filters.isArchived,
  ]);

  // ── Manual refresh — re-fetches clients + programs with current filters ───
  const refreshData = useCallback(async () => {
    const seq = ++seqRef.current;
    setIsRefreshing(true);
    setLoadError("");

    try {
      const [clientData, programData] = await Promise.all([
        getClients(),
        getClientPrograms(buildProgramParams(filters)),
      ]);

      if (seq !== seqRef.current) return;

      setClients(
        Array.isArray(clientData)
          ? clientData.filter((c) => c && c.client && c.status === "active")
          : [],
      );
      setPrograms(
        Array.isArray(programData) ? sortByCreatedDesc(programData) : [],
      );
    } catch (error) {
      if (seq !== seqRef.current) return;
      const message = getApiErrorMessage(
        error,
        "Failed to load plans. Please try again.",
      );
      setLoadError(message);
      toast.error(message);
    } finally {
      if (seq === seqRef.current) setIsRefreshing(false);
    }
  }, [filters]);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

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
    isLoading,
    loadError,
    isRefreshing,
    refreshData,
    resetFilters,
    clientNameMap,
    clientMembershipMap,
  };
}
