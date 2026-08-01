import { Link } from "react-router";
import { ArrowLeft, Activity, AlertCircle } from "lucide-react";
import { usePlanDayLog } from "@/hooks/usePlanDayLog";
import { ClientInfoCard } from "@/components/plans/logs/ClientInfoCard";
import { PlanSummaryCard } from "@/components/plans/logs/PlanSummaryCard";
import { LogStatusBadge } from "@/components/plans/logs/LogStatusBadge";
import { PlanDayLogComparisonTable } from "@/components/plans/logs/PlanDayLogComparisonTable";

function formatDate(isoStr: string | null | undefined): string {
  if (!isoStr) return "—";
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return isoStr;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function PlanDayLog() {
  const {
    programId,
    program,
    scheduledDate,
    prescription,
    workoutLog,
    client,
    isLoading,
    error,
  } = usePlanDayLog();

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

  if (error || !program || !prescription) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-destructive/20 bg-destructive/5 p-12 text-center">
          <AlertCircle className="size-10 text-destructive mb-3" />
          <p className="text-lg font-bold text-destructive">Error Loading Day Log</p>
          <p className="mt-1 text-sm text-muted-foreground">{error || "Program day review not found."}</p>
          <Link
            to={programId ? `/dashboard/plans/${programId}` : "/dashboard/plans"}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <ArrowLeft className="size-4" />
            Back to Plan
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
            to={`/dashboard/plans/${program.id}`}
            className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground transition hover:border-brand/40 hover:text-foreground"
            aria-label="Back to plan builder"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Day {prescription.dayNumber}: {prescription.name || `Day ${prescription.dayNumber}`} Log
              </h1>
              {workoutLog ? (
                <LogStatusBadge status={workoutLog.status} />
              ) : (
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  Not Executed
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Scheduled Date: {formatDate(scheduledDate)} {prescription.weekNumber ? `· Week ${prescription.weekNumber}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/dashboard/plans/${program.id}/logs`}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <Activity className="size-4" />
            All Program Logs
          </Link>
        </div>
      </div>

      {/* Client Data & Plan Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <ClientInfoCard client={client} membershipId={program.membershipId} />
        <PlanSummaryCard program={program} prescription={prescription} workoutLog={workoutLog} />
      </div>

      {/* Execution Log Details Banners */}
      {!workoutLog && (
        <div className="rounded-2xl border border-warn/30 bg-warn/10 p-4 text-sm text-warn">
          <p className="font-bold">No Canonical Workout Log Recorded</p>
          <p className="text-xs mt-1">The client has not submitted a workout log for this prescribed day yet.</p>
        </div>
      )}

      {workoutLog?.clientNotes && (
        <div className="rounded-2xl border border-info/30 bg-info/10 p-4 text-sm text-info">
          <p className="font-bold">Client Notes:</p>
          <p className="text-xs mt-1">{workoutLog.clientNotes}</p>
        </div>
      )}

      {/* Prescribed Day vs Workout Log Canonical Comparison Table */}
      <PlanDayLogComparisonTable prescription={prescription} workoutLog={workoutLog} />
    </div>
  );
}