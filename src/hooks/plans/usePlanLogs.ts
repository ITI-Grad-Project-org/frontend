import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getProgramWorkoutLogs } from "@/services/plans";
import { getClients } from "@/services/clients";
import { getApiErrorMessage } from "@/lib/api";
import type { WorkoutLog } from "@/types/plans";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function usePlanLogs() {
  const { programId } = useParams();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const logsQuery = useQuery({
    queryKey: ["plan-logs", programId],
    queryFn: () => getProgramWorkoutLogs(programId!),
    enabled: !!programId,
  });

  // The clients list is cached from the Clients page, so the owner lookup
  // usually resolves without a network call.
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClients(),
    staleTime: 5 * 60_000,
  });

  const membershipId = logsQuery.data?.program?.membershipId;
  const client = membershipId
    ? clientsQuery.data?.find((c) => c.id === membershipId) ?? null
    : null;

  const logs = useMemo(() => logsQuery.data?.logs || [], [logsQuery.data]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log: WorkoutLog) => {
      if (statusFilter === "all") return true;
      return (log.status || "").toLowerCase() === statusFilter;
    });
  }, [logs, statusFilter]);

  const stats = useMemo(() => {
    const totalLogs = logs.length;
    const completedCount = logs.filter((l) => (l.status || "").toLowerCase() === "completed").length;
    const skippedCount = logs.filter((l) => (l.status || "").toLowerCase() === "skipped").length;
    const rpeLogs = logs.filter((l) => typeof l.overallRpe === "number");
    const avgRpe =
      rpeLogs.length > 0
        ? (rpeLogs.reduce((acc, curr) => acc + (curr.overallRpe || 0), 0) / rpeLogs.length).toFixed(1)
        : "N/A";

    return {
      totalLogs,
      completedCount,
      skippedCount,
      avgRpe,
    };
  }, [logs]);

  const toggleExpandLog = (logId: string) => {
    setExpandedLogId((current) => (current === logId ? null : logId));
  };

  const error = !programId
    ? "Program ID is missing."
    : toError(logsQuery.error, "Failed to load workout logs for this plan.");

  return {
    programId,
    program: logsQuery.data?.program || null,
    logs,
    filteredLogs,
    client,
    stats,
    isLoading: logsQuery.isPending,
    error,
    statusFilter,
    setStatusFilter,
    expandedLogId,
    toggleExpandLog,
  };
}