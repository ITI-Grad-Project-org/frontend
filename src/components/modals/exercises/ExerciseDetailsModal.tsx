import { X, DumbbellIcon, PlayCircle, ExternalLink, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Exercise } from "@/types/exercise";

type Props = {
  exercise: Exercise | null;
  onEdit?: (exercise: Exercise) => void;
  onClose: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const categoryStyles: Record<string, string> = {
  strength: "bg-warn/10 text-warn border-warn/20",
  cardio: "bg-danger/10 text-danger border-danger/20",
  mobility: "bg-info/10 text-info border-info/20",
  plyometric: "bg-violet/10 text-violet border-violet/20",
  core: "bg-success/10 text-success border-success/20",
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-background shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 shrink-0 bg-card">
              {thumbnailUrl ? (
                <AvatarImage src={thumbnailUrl} alt={name} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-muted text-muted-foreground">
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
                className="p-2 rounded-xl border border-border cursor-pointer text-muted-foreground hover:text-info hover:bg-info/10 transition-colors shrink-0"
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
            <div className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-border aspect-video bg-card">
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