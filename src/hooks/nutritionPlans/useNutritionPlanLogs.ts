import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getNutritionPlanLogs } from "@/services/nutritionPlans";
import { getClients } from "@/services/clients";
import { getApiErrorMessage } from "@/lib/api";
import type { NutritionDayLog } from "@/types/nutritionPlans";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function useNutritionPlanLogs() {
  const { planId } = useParams();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const logsQuery = useQuery({
    queryKey: ["nutrition-plan-logs", planId],
    queryFn: () => getNutritionPlanLogs(planId!),
    enabled: !!planId,
  });

  // The clients list is cached from the Clients page, so the owner lookup
  // usually resolves without a network call.
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClients(),
    staleTime: 5 * 60_000,
  });

  const membershipId = logsQuery.data?.plan?.membershipId;
  const client = membershipId
    ? clientsQuery.data?.find((c) => c.id === membershipId) ?? null
    : null;

  const logs = useMemo(() => logsQuery.data?.logs ?? [], [logsQuery.data]);

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

  const error = !planId
    ? "Plan ID is missing."
    : toError(logsQuery.error, "Failed to load nutrition logs for this plan.");

  return {
    planId,
    plan: logsQuery.data?.plan ?? null,
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