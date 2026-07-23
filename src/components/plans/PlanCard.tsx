import type { ClientProgramDraft } from "@/types/plans";
import { formatFilterLabel, formatPlanWindow } from "@/hooks/usePlansData";
import { Link } from "react-router";
import { Pencil, Trash2 } from "lucide-react";

interface PlanCardProps {
    program: ClientProgramDraft;
    clientName: string;
    onEditDraft?: (program: ClientProgramDraft) => void;
    onDeleteDraft?: (program: ClientProgramDraft) => void;
}

export function PlanCard({ program, clientName, onEditDraft, onDeleteDraft }: PlanCardProps) {
    const isDraft = program.status === "draft";

    return (
        <article className="rounded-3xl border border-border bg-background p-5 transition hover:border-brand/40">
            <Link
                to={`/dashboard/plans/${program.id}`}
                state={{ clientName }}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
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
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Goal
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                            {formatFilterLabel(program.goal)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Difficulty
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                            {formatFilterLabel(program.difficulty)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Duration
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">{program.durationWeeks} weeks</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Schedule
                        </p>
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
                    <div className="flex flex-col gap-1">
                        <span className="rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                            Created {new Date(program.createdAt).toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })}
                        </span>
                        <span className="rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                            Updated {new Date(program.updatedAt).toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })}
                        </span>
                    </div>
                </div>
            </Link>

            {isDraft && (
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => onEditDraft?.(program)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit draft
                    </button>
                    <button
                        type="button"
                        onClick={() => onDeleteDraft?.(program)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete draft
                    </button>
                </div>
            )}
        </article>
    );
}
