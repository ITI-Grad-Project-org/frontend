import { Link } from "react-router";
import { Activity, AlertCircle, ArrowLeft, Utensils } from "lucide-react";
import { useNutritionPlanLogs } from "@/hooks/useNutritionPlanLogs";
import { ClientInfoCard } from "@/components/plans/logs/ClientInfoCard";
import { NutritionLogsStats } from "@/components/nutritionPlans/logs/NutritionLogsStats";
import { NutritionLogsTable } from "@/components/nutritionPlans/logs/NutritionLogsTable";

function formatDate(isoStr: string | null | undefined): string {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

export default function NutritionPlanLogs() {
  const {
    planId,
    plan,
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
  } = useNutritionPlanLogs();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="h-8 w-48 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-44 animate-pulse rounded-3xl bg-muted" />
          <div className="h-44 animate-pulse rounded-3xl bg-muted" />
        </div>
        <div className="h-32 animate-pulse rounded-3xl bg-muted" />
        <div className="h-96 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-destructive/20 bg-destructive/5 p-12 text-center">
          <AlertCircle className="size-10 text-destructive mb-3" />
          <p className="text-lg font-bold text-destructive">Error Loading Nutrition Logs</p>
          <p className="mt-1 text-sm text-muted-foreground">{error || "Plan logs not found."}</p>
          <Link
            to="/dashboard/nutrition-plans"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
          >
            <ArrowLeft className="size-4" /> Back to Nutrition Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/nutrition-plans"
            className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground transition hover:border-brand/40 hover:text-foreground"
            aria-label="Back to nutrition plans"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{plan.name} — Logs</h1>
              <span className="rounded-full bg-brand/10 px-3 py-0.5 text-xs font-semibold text-brand uppercase tracking-wider">
                {plan.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(plan.startDate)} → {formatDate(plan.endDate)}
            </p>
          </div>
        </div>

        <Link
          to={`/dashboard/nutrition-plans/${planId}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          <Utensils className="size-4" /> Open Plan Builder
        </Link>
      </div>

      {/* Client + Plan summary cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <ClientInfoCard client={client} membershipId={plan.membershipId} />

        {/* Nutrition-specific plan summary */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-4">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Utensils className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Plan Summary</h2>
              <p className="text-xs text-muted-foreground">Nutrition schedule details</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs font-medium text-muted-foreground">Plan Name</span>
              <span className="font-semibold text-foreground">{plan.name}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground">Goal</span>
              <span className="font-semibold text-foreground capitalize">{plan.goal?.replace(/_/g, " ") ?? "—"}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground">Start Date</span>
              <span className="font-semibold text-foreground">{formatDate(plan.startDate)}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground">End Date</span>
              <span className="font-semibold text-foreground">{formatDate(plan.endDate)}</span>
            </div>
            {plan.targets?.calories && (
              <div>
                <span className="block text-xs font-medium text-muted-foreground">Calorie Target</span>
                <span className="font-semibold text-foreground">{plan.targets.calories} kcal/day</span>
              </div>
            )}
            <div>
              <span className="block text-xs font-medium text-muted-foreground">Status</span>
              <span className="font-semibold text-foreground capitalize">{plan.schedulePhase ?? plan.status}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Stats row */}
      <NutritionLogsStats stats={stats} />

      {/* Logs table */}
      {logs.length === 0 ? (
        <section className="rounded-3xl border border-border bg-card p-12 shadow-sm flex flex-col items-center text-center text-muted-foreground">
          <Activity className="size-10 mb-3 opacity-40" />
          <p className="text-lg font-bold">No logs yet</p>
          <p className="text-sm mt-1">The client hasn't started logging nutrition for this plan yet.</p>
        </section>
      ) : (
        <NutritionLogsTable
          planId={planId!}
          logs={logs}
          filteredLogs={filteredLogs}
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
          expandedLogId={expandedLogId}
          onToggleExpand={toggleExpandLog}
        />
      )}
    </div>
  );
}
