import { X, DumbbellIcon, PlayCircle, ExternalLink, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { Exercise } from "@/types/exercise";

type Props = {
  exercise: Exercise | null;
  onEdit?: (exercise: Exercise) => void;
  onClose: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const categoryStyles: Record<string, string> = {
  strength: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  cardio: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  mobility: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  plyometric: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  core: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

function toLabel(value: string) {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExerciseDetailsModal({ exercise, onEdit, onClose }: Props) {
  if (!exercise) return null;

  const {
    name,
    category,
    primaryMuscle,
    secondaryMuscles,
    equipment,
    instructionSteps,
    thumbnailUrl,
    demoVideoUrl,
    demoGifUrl,
  } = exercise;

  const hasEquipment = equipment.length > 0 && !(equipment.length === 1 && equipment[0] === "none");
  // const mediaUrl = demoVideoUrl || demoGifUrl; // prefer video over gif for link

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-background shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 rounded-xl shrink-0 bg-white">
              {thumbnailUrl ? (
                <AvatarImage src={thumbnailUrl} alt={name} className="object-cover rounded-xl" />
              ) : null}
              <AvatarFallback className="rounded-xl bg-muted text-muted-foreground">
                <DumbbellIcon className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold leading-tight">{name}</h2>
              <span
                className={`inline-flex items-center mt-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${categoryStyles[category] ?? ""}`}
              >
                {toLabel(category)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(exercise)}
                className="p-2 rounded-xl border border-border cursor-pointer text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors shrink-0"
                title="Edit exercise"
              >
                <Pencil size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-border cursor-pointer hover:bg-muted transition-colors shrink-0"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Modal Body ─────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">

          {demoGifUrl && (
            <div className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-border aspect-video bg-white">
              <img
                src={demoGifUrl}
                alt={`${name} demonstration`}
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </div>
          )}
          {demoVideoUrl && (
            <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <PlayCircle className="h-8 w-8 text-brand" />
                <div>
                  <p className="text-sm font-semibold">
                    Demo Video
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Watch how to perform this exercise
                  </p>
                </div>
              </div>

              <a
                href={demoVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          )}

          {/* Muscles */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Primary Muscle</h4>
              <span className="inline-flex items-center text-sm font-medium px-3 py-1 rounded-full bg-brand/10 text-brand border border-brand/20">
                {toLabel(primaryMuscle)}
              </span>
            </div>
            {secondaryMuscles.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Secondary Muscles</h4>
                <div className="flex flex-wrap gap-1.5">
                  {secondaryMuscles.map(m => (
                    <span key={m} className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-foreground border border-border">
                      {toLabel(m)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Equipment */}
          {hasEquipment && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Equipment</h4>
              <div className="flex flex-wrap gap-1.5">
                {equipment.map(e => (
                  <span key={e} className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-card border border-border text-foreground shadow-sm">
                    {toLabel(e)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {instructionSteps.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Instructions</h4>
              <ul className="space-y-3">
                {instructionSteps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <p className="leading-relaxed text-foreground/90 mt-0.5">{step}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}