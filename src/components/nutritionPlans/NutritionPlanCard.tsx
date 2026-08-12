// src/components/nutritionPlans/NutritionPlanCard.tsx
import type { NutritionPlanSummary } from "@/types/nutritionPlans";
import { formatNutritionFilterLabel, formatNutritionPlanWindow } from "@/hooks/nutritionPlans/useNutritionPlansData";
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
  Flame,
  Droplets,
  Calendar,
  Clock,
  Target,
  User,
  Wheat,
  Beef,
  Cookie,
  Salad,
} from "lucide-react";

interface NutritionPlanCardProps {
  plan: NutritionPlanSummary;
  clientName: string;
  onEditDraft?: (plan: NutritionPlanSummary) => void;
  onPublish?: (plan: NutritionPlanSummary) => void;
  onReschedule?: (plan: NutritionPlanSummary) => void;
  onCancel?: (plan: NutritionPlanSummary) => void;
  onArchive?: (plan: NutritionPlanSummary) => void;
  onUnarchive?: (plan: NutritionPlanSummary) => void;
}

// ─── Badge helpers ───────────────────────────────────────────────────────────

function statusBadge(plan: NutritionPlanSummary) {
  if (plan.status === "cancelled") {
    return <Badge label="Cancelled" variant="destructive" />;
  }
  if (plan.status === "published") {
    if (plan.schedulePhase === "scheduled")
      return <Badge label="Scheduled" variant="success" />;
    if (plan.schedulePhase === "active")
      return <Badge label="Active" variant="success" />;
    if (plan.schedulePhase === "ended")
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

export function NutritionPlanCard({
  plan,
  clientName,
  onEditDraft,
  onPublish,
  onReschedule,
  onCancel,
  onArchive,
  onUnarchive,
}: NutritionPlanCardProps) {
  const { status, schedulePhase, isArchived, targets } = plan;

  const isDraft = status === "draft";
  const isPublished = status === "published";
  const isCancelled = status === "cancelled";

  const isScheduled = isPublished && schedulePhase === "scheduled";
  const isActive = isPublished && schedulePhase === "active";
  const isEnded = isPublished && schedulePhase === "ended";

  const hasTargets =
    targets &&
    (targets.calories != null ||
      targets.proteinG != null ||
      targets.carbsG != null ||
      targets.fatG != null ||
      targets.fiberG != null ||
      targets.waterMl != null);

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card/80 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-success/40 hover:shadow-xl">

      <div>
        {/* Top Bar with Status Badges and Logs Link */}
        <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-3.5">
          <div className="flex flex-wrap items-center gap-2">
            {statusBadge(plan)}
            {isArchived && <Badge label="Archived" variant="muted" />}
          </div>
          <Link
            to={`/dashboard/nutrition-plans/${plan.id}/logs`}
            className="inline-flex size-9 items-center justify-center rounded-2xl border border-border/80 bg-background/60 text-muted-foreground transition-all duration-200 hover:border-brand/40 hover:bg-brand/10 hover:text-brand hover:scale-105 active:scale-95"
            title="View Plan Nutrition Logs"
            aria-label={`View nutrition logs for ${plan.name}`}
          >
            <ClipboardList className="size-4.5" />
          </Link>
        </div>

        {/* ── Clickable card body ── */}
        <Link
          to={`/dashboard/nutrition-plans/${plan.id}`}
          state={{ clientName }}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-2xl"
        >
          {/* Header & Client Info */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-success/10 border border-success/20">
              <Salad className="size-5 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors duration-200 group-hover:text-success">
                {plan.name}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <User className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
                <span className="truncate">{clientName}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {plan.description && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground/90 line-clamp-2">
              {plan.description}
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
                  {plan.goal ? formatNutritionFilterLabel(plan.goal) : "General Health"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-muted/20 px-3.5 py-2.5">
              <Clock className="w-4 h-4 shrink-0 text-brand" />
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Duration
                </span>
                <span className="font-semibold text-foreground">
                  {plan.durationWeeks} week{plan.durationWeeks !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 rounded-2xl border border-border/50 bg-muted/20 px-3.5 py-2.5">
              <Calendar className="w-4 h-4 shrink-0 text-success" />
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Schedule Window
                </span>
                <span className="font-semibold text-foreground">
                  {formatNutritionPlanWindow(plan.startDate, plan.endDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Targets Summary Grid */}
          {hasTargets && (
            <div className="mt-4 rounded-2xl border border-border/60 bg-muted/30 p-3.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-2.5">
                Daily Nutritional Targets
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {targets?.calories != null && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-brand/20 bg-brand/10 px-2.5 py-1.5 text-brand font-bold">
                    <Flame className="w-3.5 h-3.5 text-brand shrink-0" />
                    <span>{targets.calories} kcal</span>
                  </div>
                )}
                {targets?.proteinG != null && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-success/20 bg-success/10 px-2.5 py-1.5 text-success font-bold">
                    <Beef className="w-3.5 h-3.5 text-success shrink-0" />
                    <span>{targets.proteinG}g P</span>
                  </div>
                )}
                {targets?.carbsG != null && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-info/20 bg-info/10 px-2.5 py-1.5 text-info font-bold">
                    <Cookie className="w-3.5 h-3.5 text-info shrink-0" />
                    <span>{targets.carbsG}g C</span>
                  </div>
                )}
                {targets?.fatG != null && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-danger/20 bg-danger/10 px-2.5 py-1.5 text-danger font-bold">
                    <span className="text-[10px] font-black text-danger">FAT</span>
                    <span>{targets.fatG}g F</span>
                  </div>
                )}
                {targets?.fiberG != null && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-success/20 bg-success/10 px-2.5 py-1.5 text-success font-bold">
                    <Wheat className="w-3.5 h-3.5 text-success shrink-0" />
                    <span>{targets.fiberG}g Fiber</span>
                  </div>
                )}
                {targets?.waterMl != null && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-info/20 bg-info/10 px-2.5 py-1.5 text-info font-bold">
                    <Droplets className="w-3.5 h-3.5 text-info shrink-0" />
                    <span>{targets.waterMl} ml</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps: Created & Updated */}
          <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between text-[11px] font-medium text-muted-foreground/80 gap-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
              Created{" "}
              {new Date(plan.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
              Updated{" "}
              {new Date(plan.updatedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        </Link>
      </div>

      {/* ── Action area (outside the link) ── */}

      {/* DRAFT: Edit · Publish · Archive */}
      {isDraft && !isArchived && (
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onEditDraft?.(plan)}
            className={secondaryBtnCls}
          >
            <Pencil className="h-4 w-4" />
            Edit draft
          </button>
          <button
            type="button"
            onClick={() => onPublish?.(plan)}
            className={brandBtnCls}
          >
            <Send className="h-4 w-4" />
            Publish
          </button>
          <button
            type="button"
            onClick={() => onArchive?.(plan)}
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
            onClick={() => onReschedule?.(plan)}
            className={secondaryBtnCls}
          >
            <CalendarClock className="h-4 w-4" />
            Reschedule
          </button>
          <button
            type="button"
            onClick={() => onCancel?.(plan)}
            className={destructiveBtnCls}
          >
            <XCircle className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onArchive?.(plan)}
            className={secondaryBtnCls}
          >
            <Archive className="h-4 w-4" />
            Archive
          </button>
        </div>
      )}

      {/* ACTIVE: Cancel · Archive */}
      {isActive && (
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onCancel?.(plan)}
            className={destructiveBtnCls}
          >
            <XCircle className="h-4 w-4" />
            Cancel plan
          </button>
          <button
            type="button"
            onClick={() => onArchive?.(plan)}
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
            onClick={() => onArchive?.(plan)}
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
            onClick={() => onArchive?.(plan)}
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
            onClick={() => onUnarchive?.(plan)}
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
