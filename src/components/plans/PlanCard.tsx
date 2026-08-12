import type { ClientProgramDraft } from "@/types/plans";
import { formatFilterLabel, formatPlanWindow } from "@/hooks/plans/usePlansData";
import { Link } from "react-router";
import { Badge } from "@/components/cards/StatusBadge";
import {
    Archive,
    ArchiveRestore,
    CheckCircle2,
    CalendarClock,
    Pencil,
    Send,
    XCircle,
    ClipboardList,
    Target,
    Clock,
    Calendar,
    User,
    Dumbbell,
    Zap,
} from "lucide-react";

interface PlanCardProps {
    program: ClientProgramDraft;
    clientName: string;
    onEditDraft?: (program: ClientProgramDraft) => void;
    onPublish?: (program: ClientProgramDraft) => void;
    onReschedule?: (program: ClientProgramDraft) => void;
    onCancel?: (program: ClientProgramDraft) => void;
    onArchive?: (program: ClientProgramDraft) => void;
    onUnarchive?: (program: ClientProgramDraft) => void;
}

function statusBadge(program: ClientProgramDraft) {
    if (program.status === "cancelled") {
        return <Badge label="Cancelled" variant="destructive" />;
    }
    if (program.status === "published") {
        if (program.schedulePhase === "scheduled")
            return <Badge label="Scheduled" variant="success" />;
        if (program.schedulePhase === "active")
            return <Badge label="Active" variant="success" />;
        if (program.schedulePhase === "ended")
            return <Badge label="Ended" variant="muted" />;
        return <Badge label="Published" variant="brand" />;
    }
    return <Badge label="Draft" variant="warning" />;
}

// ─── Action button helpers ────────────────────────────────────────────────────

const primaryBtnCls =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-xs";

const secondaryBtnCls = `${primaryBtnCls} border border-border bg-background/80 text-foreground hover:bg-muted hover:border-border/80`;
const destructiveBtnCls = `${primaryBtnCls} border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10`;
const brandBtnCls = `${primaryBtnCls} bg-brand text-brand-foreground hover:opacity-95 shadow-md shadow-brand/20`;

// ─── Main component ───────────────────────────────────────────────────────────

export function PlanCard({
    program,
    clientName,
    onEditDraft,
    onPublish,
    onReschedule,
    onCancel,
    onArchive,
    onUnarchive,
}: PlanCardProps) {
    const { status, schedulePhase, isArchived } = program;

    const isDraft = status === "draft";
    const isPublished = status === "published";
    const isCancelled = status === "cancelled";

    const isScheduled = isPublished && schedulePhase === "scheduled";
    const isActive = isPublished && schedulePhase === "active";
    const isEnded = isPublished && schedulePhase === "ended";

    return (
        <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card/80 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-xl">

            <div>
                {/* Top Bar: status badges + logs link */}
                <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                        {statusBadge(program)}
                        {isArchived && <Badge label="Archived" variant="muted" />}
                    </div>
                    <Link
                        to={`/dashboard/plans/${program.id}/logs`}
                        className="inline-flex size-9 items-center justify-center rounded-2xl border border-border/80 bg-background/60 text-muted-foreground transition-all duration-200 hover:border-brand/40 hover:bg-brand/10 hover:text-brand hover:scale-105 active:scale-95"
                        title="View Plan Workout Logs"
                        aria-label={`View workout logs for ${program.name}`}
                    >
                        <ClipboardList className="size-4.5" />
                    </Link>
                </div>

                {/* ── Clickable card body ── */}
                <Link
                    to={`/dashboard/plans/${program.id}`}
                    state={{ clientName }}
                    className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-2xl"
                >
                    {/* Title & Client */}
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand/10 border border-brand/20">
                            <Dumbbell className="size-5 text-brand" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors duration-200 group-hover:text-brand">
                                {program.name}
                            </h3>
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                <User className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
                                <span className="truncate">{clientName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {program.description && (
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground/90 line-clamp-2">
                            {program.description}
                        </p>
                    )}

                    {/* Meta Information Badges */}
                    <div className="mt-4 grid gap-3.5 sm:grid-cols-2 text-xs">
                        <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-muted/20 px-3.5 py-2.5">
                            <Target className="w-4 h-4 shrink-0 text-brand" />
                            <div>
                                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Goal
                                </span>
                                <span className="font-semibold text-foreground">
                                    {formatFilterLabel(program.goal)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-muted/20 px-3.5 py-2.5">
                            <Zap className="w-4 h-4 shrink-0 text-brand" />
                            <div>
                                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Difficulty
                                </span>
                                <span className="font-semibold text-foreground">
                                    {formatFilterLabel(program.difficulty)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-muted/20 px-3.5 py-2.5">
                            <Dumbbell className="w-4 h-4 shrink-0 text-info" />
                            <div>
                                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Duration
                                </span>
                                <span className="font-semibold text-foreground">
                                    {program.durationWeeks} week{program.durationWeeks !== 1 ? "s" : ""}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-muted/20 px-3.5 py-2.5">
                            <Calendar className="w-4 h-4 shrink-0 text-success" />
                            <div>
                                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Schedule
                                </span>
                                <span className="font-semibold text-foreground">
                                    {formatPlanWindow(program.startDate, program.endDate)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between text-[11px] font-medium text-muted-foreground/80 gap-2">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                            Created{" "}
                            {new Date(program.createdAt).toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                            Updated{" "}
                            {new Date(program.updatedAt).toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })}
                        </span>
                    </div>
                </Link>
            </div>

            {/* ── Action area (outside the link) ── */}

            {/* DRAFT: Edit · Publish · Cancel · Archive */}
            {isDraft && (
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => onEditDraft?.(program)}
                        className={secondaryBtnCls}
                    >
                        <Pencil className="h-4 w-4" />
                        Edit draft
                    </button>
                    <button
                        type="button"
                        onClick={() => onPublish?.(program)}
                        className={brandBtnCls}
                    >
                        <Send className="h-4 w-4" />
                        Publish
                    </button>
                    <button
                        type="button"
                        onClick={() => onCancel?.(program)}
                        className={destructiveBtnCls}
                    >
                        <XCircle className="h-4 w-4" />
                        Cancel draft
                    </button>
                    <button
                        type="button"
                        onClick={() => onArchive?.(program)}
                        className={secondaryBtnCls}
                    >
                        <Archive className="h-4 w-4" />
                        Archive
                    </button>
                </div>
            )}

            {/* SCHEDULED: Reschedule · Cancel · Archive */}
            {isScheduled && (
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    <button
                        type="button"
                        onClick={() => onReschedule?.(program)}
                        className={secondaryBtnCls}
                    >
                        <CalendarClock className="h-4 w-4" />
                        Reschedule
                    </button>
                    <button
                        type="button"
                        onClick={() => onCancel?.(program)}
                        className={destructiveBtnCls}
                    >
                        <XCircle className="h-4 w-4" />
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onArchive?.(program)}
                        className={secondaryBtnCls}
                    >
                        <Archive className="h-4 w-4" />
                        Archive
                    </button>
                </div>
            )}

            {/* ACTIVE: Cancel · Archive (reschedule not allowed once plan has started) */}
            {isActive && (
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => onCancel?.(program)}
                        className={destructiveBtnCls}
                    >
                        <XCircle className="h-4 w-4" />
                        Cancel plan
                    </button>
                    <button
                        type="button"
                        onClick={() => onArchive?.(program)}
                        className={secondaryBtnCls}
                    >
                        <Archive className="h-4 w-4" />
                        Archive
                    </button>
                </div>
            )}

            {/* ENDED: Archive only */}
            {isEnded && !isArchived && (
                <div className="mt-5">
                    <button
                        type="button"
                        onClick={() => onArchive?.(program)}
                        className={`w-full ${secondaryBtnCls}`}
                    >
                        <Archive className="h-4 w-4" />
                        Archive
                    </button>
                </div>
            )}

            {/* CANCELLED: Archive only (if not yet archived) */}
            {isCancelled && !isArchived && (
                <div className="mt-5">
                    <button
                        type="button"
                        onClick={() => onArchive?.(program)}
                        className={`w-full ${secondaryBtnCls}`}
                    >
                        <Archive className="h-4 w-4" />
                        Archive
                    </button>
                </div>
            )}

            {/* Cancelled notice */}
            {isCancelled && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-destructive" />
                    This plan has been cancelled and is no longer visible to the client.
                </div>
            )}

            {/* ARCHIVED: Unarchive */}
            {isArchived && (
                <div className="mt-5">
                    <button
                        type="button"
                        onClick={() => onUnarchive?.(program)}
                        className={`w-full ${secondaryBtnCls}`}
                    >
                        <ArchiveRestore className="h-4 w-4" />
                        Unarchive
                    </button>
                </div>
            )}
        </article>
    );
}
