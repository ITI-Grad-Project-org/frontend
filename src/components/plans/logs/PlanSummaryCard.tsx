import { FileText } from "lucide-react";
import type { ClientProgramSummary, PrescribedDayInfo, WorkoutLog } from "@/types/plans";

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

interface PlanSummaryCardProps {
  program: ClientProgramSummary;
  prescription?: PrescribedDayInfo | null;
  workoutLog?: WorkoutLog | null;
}

export function PlanSummaryCard({ program, prescription, workoutLog }: PlanSummaryCardProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <FileText className="size-5" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Plan Summary</h2>
            <p className="text-xs text-muted-foreground">Target schedule & configuration</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="block text-xs font-medium text-muted-foreground">Program Name</span>
          <span className="font-semibold text-foreground">{program.name}</span>
        </div>
        <div>
          <span className="block text-xs font-medium text-muted-foreground">Status / Type</span>
          <span className="font-semibold text-foreground capitalize">
            {prescription ? (prescription.isRestDay ? "Rest Day" : "Training Day") : program.status}
          </span>
        </div>
        <div>
          <span className="block text-xs font-medium text-muted-foreground">Start Date</span>
          <span className="font-semibold text-foreground">{formatDate(program.startDate)}</span>
        </div>
        <div>
          <span className="block text-xs font-medium text-muted-foreground">
            {prescription ? "Log Duration" : "End Date"}
          </span>
          <span className="font-semibold text-foreground">
            {prescription
              ? workoutLog?.durationMinutes ? `${workoutLog.durationMinutes} min` : "—"
              : formatDate(program.endDate)}
          </span>
        </div>
        <div className="col-span-2">
          <span className="block text-xs font-medium text-muted-foreground">Program ID</span>
          <span className="font-mono text-xs text-muted-foreground">{program.id}</span>
        </div>
      </div>
    </section>
  );
}
