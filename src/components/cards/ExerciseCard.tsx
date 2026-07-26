import { DumbbellIcon, Pencil, Trash2 } from "lucide-react";
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
  onDelete: (exercise: Exercise) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExerciseCard({ exercise, onClick, onEdit, onDelete }: Props) {
  const {
    thumbnailUrl,
    name,
    category,
    primaryMuscle,
    secondaryMuscles,
    equipment,
  } = exercise;

  const visibleSecondary = secondaryMuscles.slice(0, 3);
  const extraCount = secondaryMuscles.length - visibleSecondary.length;
  const hasEquipment = equipment.length > 0 && !(equipment.length === 1 && equipment[0] === "none");

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
      className="cursor-pointer text-left block w-full h-full rounded-3xl transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <CardMain className="h-full justify-start gap-4">
        {/* Top row — thumbnail + actions */}
        <div className="flex items-start justify-between">
          <Avatar className="w-14 h-14 rounded-2xl shrink-0 bg-white">
            {thumbnailUrl ? (
              <AvatarImage
                src={thumbnailUrl}
                alt={name}
                className="object-cover rounded-2xl"
              />
            ) : null}
            <AvatarFallback className="rounded-2xl bg-muted text-muted-foreground">
              <DumbbellIcon className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>

          <div className="flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(exercise); }}
              className="cursor-pointer p-2 rounded-xl text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 active:scale-95 transition-all"
              title="Edit exercise"
              aria-label={`Edit ${name}`}
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(exercise); }}
              className="cursor-pointer p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
              title="Delete exercise"
              aria-label={`Delete ${name}`}
            >
              <Trash2 size={16} />
            </button>
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