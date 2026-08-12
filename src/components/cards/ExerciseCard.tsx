import { DumbbellIcon, Pencil, Archive, RotateCcw } from "lucide-react";
import CardMain from "./CardMain";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { Exercise } from "@/types/exercise";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const categoryStyles: Record<string, string> = {
  strength: "bg-warn/10 text-warn border-warn/20",
  cardio: "bg-danger/10 text-danger border-danger/20",
  mobility: "bg-info/10 text-info border-info/20",
  plyometric: "bg-violet/10 text-violet border-violet/20",
  core: "bg-success/10 text-success border-success/20",
};

const fallbackCategoryStyle = "bg-muted text-muted-foreground border-border";

function toLabel(value: string) {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  exercise: Exercise;
  onClick: (exercise: Exercise) => void;
  onEdit: (exercise: Exercise) => void;
  /** Triggers the archive confirmation. Hidden for already-archived exercises. */
  onArchive: (exercise: Exercise) => void;
  /** Triggers unarchiving the exercise. Shown for archived exercises. */
  onUnarchive?: (exercise: Exercise) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExerciseCard({ exercise, onClick, onEdit, onArchive, onUnarchive }: Props) {
  const {
    thumbnailUrl,
    name,
    category,
    primaryMuscle,
    secondaryMuscles,
    equipment,
    isActive,
  } = exercise;

  const visibleSecondary = secondaryMuscles.slice(0, 3);
  const extraCount = secondaryMuscles.length - visibleSecondary.length;
  const hasEquipment = equipment.length > 0 && !(equipment.length === 1 && equipment[0] === "none");

  // Archived cards get a muted/faded look with a dashed border
  const cardWrapperCls = isActive
    ? "cursor-pointer text-left block w-full h-full rounded-3xl transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    : "cursor-pointer text-left block w-full h-full rounded-3xl transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View ${name}`}
      onClick={() => onClick(exercise)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(exercise);
        }
      }}
      className={cardWrapperCls}
    >
      <CardMain className="h-full justify-start gap-4">
        {/* Top row — thumbnail + actions */}
        <div className="flex items-start justify-between gap-2">
          <Avatar className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shrink-0 bg-white">
            {thumbnailUrl ? (
              <AvatarImage
                src={thumbnailUrl}
                alt={name}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                width={48}
                height={48}
                className="object-cover rounded-full"
              />
            ) : null}
            <AvatarFallback className="rounded-full bg-muted text-muted-foreground">
              <DumbbellIcon className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-wrap gap-1 items-center justify-end">
            {/* Archived Status Badge */}
            {!isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[11px] font-semibold bg-danger/10 text-danger border border-danger/20">
                <Archive className="w-3 h-3 shrink-0" />
                <span className="hidden xs:inline sm:inline">Archived</span>
              </span>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); onEdit(exercise); }}
              className="cursor-pointer p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-info hover:bg-info/10 active:scale-95 transition-all"
              title="Edit exercise"
              aria-label={`Edit ${name}`}
            >
              <Pencil size={16} />
            </button>

            {/* Archive button — only shown for active exercises */}
            {isActive ? (
              <button
                onClick={(e) => { e.stopPropagation(); onArchive(exercise); }}
                className="cursor-pointer p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-warn hover:bg-warn/10 active:scale-95 transition-all"
                title="Archive exercise"
                aria-label={`Archive ${name}`}
              >
                <Archive size={16} />
              </button>
            ) : (
              onUnarchive && (
                <button
                  onClick={(e) => { e.stopPropagation(); onUnarchive(exercise); }}
                  className="cursor-pointer p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-success hover:bg-success/10 active:scale-95 transition-all"
                  title="Unarchive exercise"
                  aria-label={`Unarchive ${name}`}
                >
                  <RotateCcw size={16} />
                </button>
              )
            )}
          </div>
        </div>

        {/* Name + muscle + category */}
        <div>
          <h3 className="text-lg font-bold leading-tight text-foreground line-clamp-1" title={name}>
            {name}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{toLabel(primaryMuscle)}</p>
          <span
            className={`inline-flex items-center mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${categoryStyles[category] ?? fallbackCategoryStyle
              }`}
          >
            {toLabel(category)}
          </span>
        </div>

        {/* Secondary muscles */}
        {visibleSecondary.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
              Also targets
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {visibleSecondary.map((m) => (
                <span
                  key={m}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {toLabel(m)}
                </span>
              ))}
              {extraCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  +{extraCount}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Equipment */}
        {hasEquipment && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
              Equipment
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {equipment.map((e) => (
                <span
                  key={e}
                  className="text-xs px-2 py-0.5 rounded-full border border-border bg-muted/40 text-muted-foreground"
                >
                  {toLabel(e)}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardMain>
    </div>
  );
}