import type { ClientProgramDraft } from "@/types/plans";
import { formatFilterLabel, formatPlanWindow } from "@/hooks/usePlansData";
import { Link } from "react-router";

interface PlanCardProps {
    program: ClientProgramDraft;
    clientName: string;
}

export function PlanCard({ program, clientName }: PlanCardProps) {
    return (
        <Link
            to={`/dashboard/plans/${program.id}`}
            state={{ clientName }}
            className="block rounded-3xl border border-border bg-background p-5 transition hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-lg font-bold">{program.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{clientName}</p>
                </div>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                    {program.status}
                </span>
            </div>

            {program.description && (
                <p className="mt-4 text-sm text-muted-foreground">{program.description}</p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Goal</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{formatFilterLabel(program.goal)}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Difficulty</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{formatFilterLabel(program.difficulty)}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Duration</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{program.durationWeeks} weeks</p>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Schedule</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                        {formatPlanWindow(program.startDate, program.endDate)}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {program.isArchived && (
                    <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                        Archived
                    </span>
                )}
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    Created {new Date(program.createdAt).toLocaleDateString()}
                </span>
            </div>
        </Link>
    );
}
