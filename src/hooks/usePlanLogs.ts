import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { getProgramWorkoutLogs } from "@/services/plans";
import { getClients } from "@/services/clients";
import { getApiErrorMessage } from "@/lib/api";
import type { ProgramWorkoutLogsResponse, WorkoutLog } from "@/types/plans";
import type { ClientConnection } from "@/types/client";

export function usePlanLogs() {
  const { programId } = useParams();
  const [data, setData] = useState<ProgramWorkoutLogsResponse | null>(null);
  const [client, setClient] = useState<ClientConnection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    let isActive = true;

    if (!programId) {
      setError("Program ID is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    void (async () => {
      try {
        const res = await getProgramWorkoutLogs(programId);
        if (!isActive) return;
        setData(res);

        if (res.program?.membershipId) {
          try {
            const allClients = await getClients();
            const found = allClients.find((c) => c.id === res.program.membershipId);
            if (isActive && found) setClient(found);
          } catch {
            // Optional fallback
          }
        }
      } catch (err) {
        if (isActive) {
          setError(getApiErrorMessage(err, "Failed to load workout logs for this plan."));
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [programId]);

  const logs = useMemo(() => data?.logs || [], [data]);

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

  return {
    programId,
    program: data?.program || null,
    logs,
    filteredLogs,
    client,
    stats,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    expandedLogId,
    toggleExpandLog,
  };
}
