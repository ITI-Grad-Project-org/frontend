import { Link } from "react-router";
import { ArrowLeft, Dumbbell, AlertCircle } from "lucide-react";
import { usePlanLogs } from "@/hooks/usePlanLogs";
import { ClientInfoCard } from "@/components/plans/logs/ClientInfoCard";
import { PlanSummaryCard } from "@/components/plans/logs/PlanSummaryCard";
import { PlanLogsStats } from "@/components/plans/logs/PlanLogsStats";
import { PlanLogsCharts } from "@/components/plans/logs/PlanLogsCharts";
import { PlanLogsTable } from "@/components/plans/logs/PlanLogsTable";

export default function PlanLogs() {
  const {
    programId,
    program,
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
  } = usePlanLogs();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="h-8 w-48 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-44 animate-pulse rounded-3xl bg-muted" />
          <div className="h-44 animate-pulse rounded-3xl bg-muted" />
        </div>
        <div className="h-96 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-destructive/20 bg-destructive/5 p-12 text-center">
          <AlertCircle className="size-10 text-destructive mb-3" />
          <p className="text-lg font-bold text-destructive">Error Loading Workout Logs</p>
          <p className="mt-1 text-sm text-muted-foreground">{error || "Client program logs not found."}</p>
          <Link
            to="/dashboard/plans"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <ArrowLeft className="size-4" />
            Back to Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/plans"
            className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground transition hover:border-brand/40 hover:text-foreground"
            aria-label="Back to plans"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{program.name} Logs</h1>
              <span className="rounded-full bg-brand/10 px-3 py-0.5 text-xs font-semibold text-brand uppercase tracking-wider">
                {program.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Comprehensive workout execution logs for this plan</p>
          </div>
        </div>

        <Link
          to={`/dashboard/plans/${programId}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          <Dumbbell className="size-4" />
          Open Plan Builder
        </Link>
      </div>

      {/* Client Data & Plan Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <ClientInfoCard client={client} membershipId={program.membershipId} />
        <PlanSummaryCard program={program} />
      </div>

      {/* Metrics Row */}
      <PlanLogsStats stats={stats} />

      {/* Charts */}
      <PlanLogsCharts logs={logs} />

      {/* Logs Table */}
      <PlanLogsTable
        logs={logs}
        filteredLogs={filteredLogs}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        expandedLogId={expandedLogId}
        onToggleExpand={toggleExpandLog}
      />
    </div>
  );
}
