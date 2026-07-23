import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api";
import { getClients } from "@/services/clients";
import { getClientPrograms } from "@/services/plans";
import type { ClientConnection } from "@/types/client";
import type { ClientProgramDraft } from "@/types/plans";

export type ArchivedFilter = "all" | "active" | "archived";

export type PlansFilters = {
  searchTerm: string;
  goal: string;
  difficulty: string;
  status: string;
  showArchived: boolean;
};

const defaultFilters: PlansFilters = {
  searchTerm: "",
  goal: "all",
  difficulty: "all",
  status: "all",
  showArchived: false,
};

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

export function usePlansData() {
  const [clients, setClients] = useState<ClientConnection[]>([]);
  const [programs, setPrograms] = useState<ClientProgramDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<PlansFilters>(defaultFilters);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const [clientData, programData] = await Promise.all([
        getClients(),
        getClientPrograms(),
      ]);

      const activeClients = Array.isArray(clientData)
        ? clientData.filter(
            (connection) =>
              connection && connection.client && connection.status === "active",
          )
        : [];
      const normalizedPrograms = Array.isArray(programData)
        ? [...programData].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
        : [];

      setClients(activeClients);
      setPrograms(normalizedPrograms);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Failed to load plans. Please try again.",
      );
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    void (async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const [clientData, programData] = await Promise.all([
          getClients(),
          getClientPrograms(),
        ]);

        if (!isActive) {
          return;
        }

        const activeClients = Array.isArray(clientData)
          ? clientData.filter(
              (connection) =>
                connection &&
                connection.client &&
                connection.status === "active",
            )
          : [];
        const normalizedPrograms = Array.isArray(programData)
          ? [...programData].sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
          : [];

        setClients(activeClients);
        setPrograms(normalizedPrograms);
      } catch (error) {
        if (isActive) {
          const message = getApiErrorMessage(
            error,
            "Failed to load plans. Please try again.",
          );
          setLoadError(message);
          toast.error(message);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await loadData();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadData]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const clientNameMap = useMemo(() => {
    return new Map(
      clients.map((connection) => [connection.id, getClientName(connection)]),
    );
  }, [clients]);

  const filteredPrograms = useMemo(() => {
    const normalizedSearch = filters.searchTerm.trim().toLowerCase();

    return programs.filter((program) => {
      const clientName = clientNameMap.get(program.membershipId) ?? "";
      const matchesSearch =
        normalizedSearch.length === 0 ||
        program.name.toLowerCase().includes(normalizedSearch) ||
        (program.description ?? "").toLowerCase().includes(normalizedSearch) ||
        clientName.toLowerCase().includes(normalizedSearch);

      const matchesGoal =
        filters.goal === "all" || program.goal === filters.goal;
      const matchesDifficulty =
        filters.difficulty === "all" ||
        program.difficulty === filters.difficulty;
      const matchesStatus =
        filters.status === "all" || program.status === filters.status;
      const matchesArchived = filters.showArchived || !program.isArchived;

      return (
        matchesSearch &&
        matchesGoal &&
        matchesDifficulty &&
        matchesStatus &&
        matchesArchived
      );
    });
  }, [
    clientNameMap,
    filters.difficulty,
    filters.goal,
    filters.searchTerm,
    filters.status,
    filters.showArchived,
    programs,
  ]);

  const stats = useMemo(
    () => ({
      total: programs.length,
      drafts: programs.filter((program) => program.status === "draft").length,
      archived: programs.filter((program) => program.isArchived).length,
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
  };
}
