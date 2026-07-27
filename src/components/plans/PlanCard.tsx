import type { ClientProgramDraft } from "@/types/plans";
import { formatFilterLabel, formatPlanWindow } from "@/hooks/usePlansData";
import { Link } from "react-router";
import {
    Archive,
    CheckCircle2,
    CalendarClock,
    Pencil,
    Send,
    XCircle,
} from "lucide-react";

interface PlanCardProps {
    program: ClientProgramDraft;
    clientName: string;
    onEditDraft?: (program: ClientProgramDraft) => void;
    onPublish?: (program: ClientProgramDraft) => void;
    onReschedule?: (program: ClientProgramDraft) => void;
    onCancel?: (program: ClientProgramDraft) => void;
    onArchive?: (program: ClientProgramDraft) => void;
}

// ─── Badge helpers ───────────────────────────────────────────────────────────

type BadgeVariant = "brand" | "success" | "warning" | "muted" | "destructive";

const badgeStyles: Record<BadgeVariant, string> = {
    brand: "bg-brand/10 text-brand",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-400/10 text-amber-600 dark:text-amber-400",
    muted: "bg-muted text-muted-foreground",
    destructive: "bg-destructive/10 text-destructive",
};

function Badge({ label, variant }: { label: string; variant: BadgeVariant }) {
    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${badgeStyles[variant]}`}
        >
            {label}
        </span>
    );
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
    return <Badge label="Draft" variant="brand" />;
}

// ─── Action button helpers ────────────────────────────────────────────────────

const primaryBtnCls =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

const secondaryBtnCls = `${primaryBtnCls} border border-border text-foreground hover:bg-muted`;
const destructiveBtnCls = `${primaryBtnCls} border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10`;
const brandBtnCls = `${primaryBtnCls} bg-brand text-brand-foreground hover:opacity-90`;

// ─── Main component ───────────────────────────────────────────────────────────

export function PlanCard({
    program,
    clientName,
    onEditDraft,
    onPublish,
    onReschedule,
    onCancel,
    onArchive,
}: PlanCardProps) {
    const { status, schedulePhase, isArchived } = program;

    const isDraft = status === "draft";
    const isPublished = status === "published";
    const isCancelled = status === "cancelled";

    const isScheduled = isPublished && schedulePhase === "scheduled";
    const isActive = isPublished && schedulePhase === "active";
    const isEnded = isPublished && schedulePhase === "ended";

    return (
        <article className="rounded-3xl border border-border bg-background p-5 transition hover:border-brand/40">
            {/* ── Clickable card body ── */}
            <Link
                to={`/dashboard/plans/${program.id}`}
                state={{ clientName }}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-lg font-bold">{program.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{clientName}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {statusBadge(program)}
                        {isArchived && <Badge label="Archived" variant="muted" />}
                    </div>
                </div>

                {/* Description */}
                {program.description && (
                    <p className="mt-4 text-sm text-muted-foreground">{program.description}</p>
                )}

                {/* Meta grid */}
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
                        <p className="mt-1 text-sm font-medium text-foreground">
                            {program.durationWeeks} weeks
                        </p>
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

                {/* Timestamps */}
                <div className="mt-4 flex flex-col gap-1">
                    <span className="text-xs font-semibold text-muted-foreground">
                        Created{" "}
                        {new Date(program.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                        })}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                        Updated{" "}
                        {new Date(program.updatedAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                        })}
                    </span>
                </div>
            </Link>

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
        </article>
    );
}
