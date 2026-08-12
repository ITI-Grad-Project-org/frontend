// src/hooks/useNutritionPlansData.ts
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { getApiErrorMessage } from "@/lib/api";
import { getClients } from "@/services/clients";
import { getNutritionPlans } from "@/services/nutritionPlans";
import type { ClientConnection } from "@/types/client";
import type {
  NutritionPlanGoal,
  NutritionPlanStatus,
  NutritionPlanSummary,
} from "@/types/nutritionPlans";

export type NutritionPlansFilters = {
  search: string;
  membershipId: string; // "all" | uuid
  status: NutritionPlanStatus | "all";
  goal: NutritionPlanGoal | "all";
  isArchived: boolean;
  showCancelled: boolean; // client-side filter
};

const defaultFilters: NutritionPlansFilters = {
  search: "",
  membershipId: "all",
  status: "all",
  goal: "all",
  isArchived: false,
  showCancelled: false,
};

function getClientName(connection: ClientConnection) {
  return (
    `${connection.client.firstName || ""} ${connection.client.lastName || ""}`.trim() ||
    connection.client.email
  );
}

export function formatNutritionFilterLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatNutritionPlanWindow(startDate: string, endDate: string) {
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

function buildApiParams(
  f: NutritionPlansFilters,
): Parameters<typeof getNutritionPlans>[0] {
  const p: Parameters<typeof getNutritionPlans>[0] = {};
  if (f.search.trim()) p.search = f.search.trim();
  if (f.membershipId !== "all") p.membershipId = f.membershipId;
  if (f.status !== "all") p.status = f.status;
  if (f.goal !== "all") p.goal = f.goal;
  if (f.isArchived) p.isArchived = true;
  return p;
}

function sortByCreatedDesc(data: NutritionPlanSummary[]): NutritionPlanSummary[] {
  return [...data].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function useNutritionPlansData() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filters from URL query parameters
  const initialFilters = useMemo<NutritionPlansFilters>(() => {
    return {
      search: searchParams.get("search") || "",
      membershipId: searchParams.get("membershipId") || "all",
      status: (searchParams.get("status") as NutritionPlanStatus) || "all",
      goal: (searchParams.get("goal") as NutritionPlanGoal) || "all",
      isArchived: searchParams.get("isArchived") === "true",
      showCancelled: searchParams.get("showCancelled") === "true",
    };
  }, []); // Only parse on mount

  const [filters, setFiltersState] = useState<NutritionPlansFilters>(initialFilters);

  // Sync state changes with URL query parameters
  const updateFilters = useCallback(
    (nextOrUpdater: Partial<NutritionPlansFilters> | ((current: NutritionPlansFilters) => NutritionPlansFilters)) => {
      setFiltersState((current) => {
        const next = typeof nextOrUpdater === "function" ? nextOrUpdater(current) : { ...current, ...nextOrUpdater };

        // Sync with URL query params
        const newParams = new URLSearchParams();
        if (next.search.trim()) newParams.set("search", next.search.trim());
        if (next.membershipId !== "all") newParams.set("membershipId", next.membershipId);
        if (next.status !== "all") newParams.set("status", next.status);
        if (next.goal !== "all") newParams.set("goal", next.goal);
        if (next.isArchived) newParams.set("isArchived", "true");
        if (next.showCancelled) newParams.set("showCancelled", "true");

        setSearchParams(newParams, { replace: true });
        return next;
      });
    },
    [setSearchParams],
  );

  // Clients are cached once and shared with the Clients page, logs, and the
  // training hooks; each consumer derives its own view of the same cache.
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClients(),
    staleTime: 5 * 60_000,
  });

  // Each filter combination is its own cached query, so revisiting the plans
  // page (or re-applying a filter) reads from cache instead of refetching.
  const plansQuery = useQuery({
    queryKey: ["nutrition-plans", buildApiParams(filters)],
    queryFn: async () => {
      const data = await getNutritionPlans(buildApiParams(filters));
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
  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);

  const resetFilters = useCallback(() => {
    updateFilters(defaultFilters);
  }, [updateFilters]);

  const refreshData = useCallback(() => {
    void plansQuery.refetch();
    void clientsQuery.refetch();
  }, [clientsQuery, plansQuery]);

  const clientNameMap = useMemo(
    () => new Map(clients.map((c) => [c.id, getClientName(c)])),
    [clients],
  );

  const filteredPlans = useMemo(
    () =>
      filters.showCancelled
        ? plans
        : plans.filter((p) => p.status !== "cancelled"),
    [plans, filters.showCancelled],
  );

  const stats = useMemo(
    () => ({
      total: plans.length,
      drafts: plans.filter((p) => p.status === "draft").length,
      canceled: plans.filter((p) => p.status === "cancelled").length,
      activeClients: clients.length,
    }),
    [clients.length, plans],
  );

  return {
    clients,
    plans,
    filteredPlans,
    stats,
    filters,
    setFilters: updateFilters,
    isLoading: plansQuery.isPending,
    loadError: toError(plansQuery.error, "Failed to load nutrition plans. Please try again."),
    isRefreshing: plansQuery.isFetching && !plansQuery.isPending,
    refreshData,
    resetFilters,
    clientNameMap,
  };
}