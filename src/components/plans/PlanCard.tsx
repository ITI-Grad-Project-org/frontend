import type { ClientProgramDraft } from "@/types/plans";
import { formatFilterLabel, formatPlanWindow } from "@/hooks/usePlansData";
import { Link } from "react-router";
import {
    AlertCircle,
    Archive,
    BarChart3,
    CalendarClock,
    CalendarRange,
    Clock3,
    Pencil,
    Send,
    Target,
    Trash2,
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

// ─── Time helpers ────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.round(diffMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.round(days / 7);
    if (weeks < 5) return `${weeks}w ago`;
    return new Date(iso).toLocaleDateString(undefined, {
        dateStyle: "medium",
    });
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
    // draft
    return <Badge label="Draft" variant="brand" />;
}

// ─── Meta row ─────────────────────────────────────────────────────────────────

function MetaItem({
    icon: Icon,
    children,
}: {
    icon: typeof Target;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium text-foreground">{children}</span>
        </div>
    );
}

// ─── Action button styles ────────────────────────────────────────────────────

const btnBase =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

const brandBtnCls = `${btnBase} bg-brand text-brand-foreground hover:opacity-90`;
const secondaryBtnCls = `${btnBase} border border-border text-foreground hover:bg-muted`;
const destructiveBtnCls =
    `${btnBase} border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10`;

// Quiet, icon-only affordance for low-priority/tertiary actions (archive, delete)
const ghostIconBtnCls =
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-destructive disabled:cursor-not-allowed disabled:opacity-60";

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

    const canArchive = !isArchived && (isEnded || isCancelled);

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
                    <p
                        title={program.description}
                        className="mt-3 line-clamp-2 text-sm text-muted-foreground"
                    >
                        {program.description}
                    </p>
                )}

                {/* Meta row — single line, icon-led, scans left to right */}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <MetaItem icon={Target}>{formatFilterLabel(program.goal)}</MetaItem>
                    <MetaItem icon={BarChart3}>{formatFilterLabel(program.difficulty)}</MetaItem>
                    <MetaItem icon={Clock3}>
                        {program.durationWeeks} {program.durationWeeks === 1 ? "week" : "weeks"}
                    </MetaItem>
                    <MetaItem icon={CalendarRange}>
                        {formatPlanWindow(program.startDate, program.endDate)}
                    </MetaItem>
                </div>
            </Link>

            {/* ── Footer: timestamp + actions (outside the link) ── */}
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">
                    Updated {timeAgo(program.updatedAt)}
                </span>

                <div className="flex items-center gap-2">
                    {/* DRAFT: Edit + Publish carry the weight, Delete is quiet */}
                    {isDraft && (
                        <>
                            <button
                                type="button"
                                onClick={() => onEditDraft?.(program)}
                                className={secondaryBtnCls}
                            >
                                <Pencil className="h-4 w-4" />
                                Edit
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
                                onClick={() => onArchive?.(program)}
                                className={ghostIconBtnCls}
                                title="Delete draft"
                                aria-label="Delete draft"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </>
                    )}

                    {/* SCHEDULED: Reschedule + Cancel carry the weight, Archive is quiet */}
                    {isScheduled && (
                        <>
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
                                className={ghostIconBtnCls}
                                title="Archive plan"
                                aria-label="Archive plan"
                            >
                                <Archive className="h-4 w-4" />
                            </button>
                        </>
                    )}

                    {/* ACTIVE: Cancel is the one real action, Archive is quiet */}
                    {isActive && (
                        <>
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
                                className={ghostIconBtnCls}
                                title="Archive plan"
                                aria-label="Archive plan"
                            >
                                <Archive className="h-4 w-4" />
                            </button>
                        </>
                    )}

                    {/* ENDED / CANCELLED and not yet archived: Archive is the only action, so it can be quiet but visible */}
                    {canArchive && !isDraft && !isScheduled && !isActive && (
                        <button
                            type="button"
                            onClick={() => onArchive?.(program)}
                            className={ghostIconBtnCls}
                            title="Archive plan"
                            aria-label="Archive plan"
                        >
                            <Archive className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Cancelled indicator */}
            {isCancelled && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                    This plan has been cancelled and is no longer visible to the client.
                </div>
            )}
        </article>
    );
}