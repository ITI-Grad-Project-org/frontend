import { DumbbellIcon, Pencil, Archive, RotateCcw } from "lucide-react";
import CardMain from "./CardMain";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { Exercise } from "@/types/exercise";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const categoryStyles: Record<string, string> = {
  strength: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  cardio: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  mobility: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  plyometric: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  core: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[11px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                <Archive className="w-3 h-3 shrink-0" />
                <span className="hidden xs:inline sm:inline">Archived</span>
              </span>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); onEdit(exercise); }}
              className="cursor-pointer p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 active:scale-95 transition-all"
              title="Edit exercise"
              aria-label={`Edit ${name}`}
            >
              <Pencil size={16} />
            </button>

            {/* Archive button — only shown for active exercises */}
            {isActive ? (
              <button
                onClick={(e) => { e.stopPropagation(); onArchive(exercise); }}
                className="cursor-pointer p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 active:scale-95 transition-all"
                title="Archive exercise"
                aria-label={`Archive ${name}`}
              >
                <Archive size={16} />
              </button>
            ) : (
              onUnarchive && (
                <button
                  onClick={(e) => { e.stopPropagation(); onUnarchive(exercise); }}
                  className="cursor-pointer p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 active:scale-95 transition-all"
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