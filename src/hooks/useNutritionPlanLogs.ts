import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { getNutritionPlanLogs } from "@/services/nutritionPlans";
import { getClients } from "@/services/clients";
import { getApiErrorMessage } from "@/lib/api";
import type { NutritionPlanLogsResponse, NutritionDayLog } from "@/types/nutritionPlans";
import type { ClientConnection } from "@/types/client";

export function useNutritionPlanLogs() {
  const { planId } = useParams();
  const [data, setData] = useState<NutritionPlanLogsResponse | null>(null);
  const [client, setClient] = useState<ClientConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let isActive = true;
    if (!planId) {
      setError("Plan ID is missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError("");
    void (async () => {
      try {
        const res = await getNutritionPlanLogs(planId);
        if (!isActive) return;
        setData(res);
        if (res.plan?.membershipId) {
          try {
            const allClients = await getClients();
            const found = allClients.find((c) => c.id === res.plan.membershipId);
            if (isActive && found) setClient(found);
          } catch {
            // optional
          }
        }
      } catch (err) {
        if (isActive) setError(getApiErrorMessage(err, "Failed to load nutrition logs for this plan."));
      } finally {
        if (isActive) setIsLoading(false);
      }
    })();
    return () => { isActive = false; };
  }, [planId]);

  const logs = useMemo(() => data?.logs ?? [], [data]);

  const filteredLogs = useMemo(() => {
    if (statusFilter === "all") return logs;
    return logs.filter((l: NutritionDayLog) => (l.status ?? "").toLowerCase() === statusFilter);
  }, [logs, statusFilter]);

  const stats = useMemo(() => {
    const total = logs.length;
    const completed = logs.filter((l) => (l.status ?? "").toLowerCase() === "completed").length;
    const skipped = logs.filter((l) => (l.status ?? "").toLowerCase() === "skipped").length;
    const inProgress = logs.filter((l) => (l.status ?? "").toLowerCase() === "in_progress").length;
    const adherentLogs = logs.filter((l) =>
      ["compliant", "partial", "non_compliant"].includes((l.adherenceOutcome ?? "").toLowerCase()),
    );
    const compliant = adherentLogs.filter((l) =>
      (l.adherenceOutcome ?? "").toLowerCase() === "compliant",
    ).length;
    return { total, completed, skipped, inProgress, compliant };
  }, [logs]);

  const toggleExpandLog = (logId: string) => {
    setExpandedLogId((cur) => (cur === logId ? null : logId));
  };

  return {
    planId,
    plan: data?.plan ?? null,
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
