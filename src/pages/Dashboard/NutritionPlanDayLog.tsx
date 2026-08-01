import { Link } from "react-router";
import { Activity, AlertCircle, ArrowLeft } from "lucide-react";
import { useNutritionPlanDayLog } from "@/hooks/useNutritionPlanDayLog";
import { ClientInfoCard } from "@/components/plans/logs/ClientInfoCard";
import { LogStatusBadge } from "@/components/plans/logs/LogStatusBadge";
import { NutritionPlanDayLogDetail } from "@/components/nutritionPlans/logs/NutritionPlanDayLogDetail";

function formatDate(isoStr: string | null | undefined): string {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

export default function NutritionPlanDayLog() {
  const {
    planId,
    plan,
    scheduledDate,
    prescription,
    comparisons,
    client,
    isLoading,
    error,
  } = useNutritionPlanDayLog();

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

  if (error || !plan || !prescription) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-destructive/20 bg-destructive/5 p-12 text-center">
          <AlertCircle className="size-10 text-destructive mb-3" />
          <p className="text-lg font-bold text-destructive">Error Loading Day Log</p>
          <p className="mt-1 text-sm text-muted-foreground">{error || "Nutrition plan day log not found."}</p>
          <Link
            to={planId ? `/dashboard/nutrition-plans/${planId}/logs` : "/dashboard/nutrition-plans"}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
          >
            <ArrowLeft className="size-4" /> Back to Plan Logs
          </Link>
        </div>
      </div>
    );
  }

  // Derive a log status from comparisons if no top-level status available
  const hasLog = comparisons && Object.keys(comparisons).length > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={`/dashboard/nutrition-plans/${planId}/logs`}
            className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground transition hover:border-brand/40 hover:text-foreground"
            aria-label="Back to plan logs"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Day {prescription.dayNumber} Log
              </h1>
              {hasLog ? (
                <LogStatusBadge status="completed" />
              ) : (
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  Not Logged
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Scheduled: {formatDate(scheduledDate)}
              {prescription.isFlexibleDay ? " · Flexible Day" : ""}
            </p>
          </div>
        </div>

        <Link
          to={`/dashboard/nutrition-plans/${planId}/logs`}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          <Activity className="size-4" /> All Plan Logs
        </Link>
      </div>

      {/* Client info */}
      <div className="grid gap-6 md:grid-cols-2">
        <ClientInfoCard client={client} membershipId={plan.membershipId} />

        {/* Day summary card */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="border-b border-border/60 pb-4 mb-4">
            <h2 className="font-bold text-foreground">Day Summary</h2>
            <p className="text-xs text-muted-foreground">Prescription configuration for this day</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs font-medium text-muted-foreground">Plan</span>
              <span className="font-semibold text-foreground">{plan.name}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground">Day Type</span>
              <span className="font-semibold text-foreground">
                {prescription.isFlexibleDay ? "Flexible" : "Structured"}
              </span>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground">Scheduled Date</span>
              <span className="font-semibold text-foreground">{formatDate(scheduledDate)}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground">Meals Prescribed</span>
              <span className="font-semibold text-foreground">{prescription.meals?.length ?? 0}</span>
            </div>
            {prescription.effectiveTargets?.calories && (
              <div>
                <span className="block text-xs font-medium text-muted-foreground">Calorie Target</span>
                <span className="font-semibold text-foreground">{prescription.effectiveTargets.calories} kcal</span>
              </div>
            )}
            {prescription.prescribedTotals?.calories && (
              <div>
                <span className="block text-xs font-medium text-muted-foreground">Prescribed Total</span>
                <span className="font-semibold text-warn">{prescription.prescribedTotals.calories} kcal</span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* No log banner */}
      {!hasLog && (
        <div className="rounded-2xl border border-warn/30 bg-warn/10 p-4 text-sm text-warn">
          <p className="font-bold">No Nutrition Log Recorded</p>
          <p className="text-xs mt-1">The client has not submitted a nutrition log for this prescribed day yet.</p>
        </div>
      )}

      {/* Prescription + comparisons detail */}
      <NutritionPlanDayLogDetail prescription={prescription} comparisons={comparisons} />
    </div>
  );
}