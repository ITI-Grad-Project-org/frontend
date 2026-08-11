// src/components/nutrition/MealCard.tsx
import { Utensils, Pencil, Archive, RotateCcw } from "lucide-react";
import CardMain from "../cards/CardMain";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { Meal } from "@/types/nutrition";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center justify-center py-2 px-1 bg-muted/60 rounded-2xl border border-border/40">
      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide">
        {label}
      </span>
      <span className="text-sm font-extrabold text-foreground mt-0.5">{value}</span>
    </div>
  );
}

interface MealCardProps {
  meal: Meal;
  onView: (meal: Meal) => void;
  onEdit: (meal: Meal) => void;
  onArchive: (meal: Meal) => void;
  onUnarchive?: (meal: Meal) => void;
}

export function MealCard({
  meal,
  onView,
  onEdit,
  onArchive,
  onUnarchive,
}: MealCardProps) {
  const {
    name,
    description,
    photoUrl,
    ingredientCount,
    totals,
    dietaryTags,
    effectiveAllergens,
    isActive,
  } = meal;

  const validTags = dietaryTags.filter((t) => t !== "none");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(meal)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(meal);
        }
      }}
      className="cursor-pointer text-left block w-full h-full rounded-3xl transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <CardMain className="h-full justify-between gap-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <Avatar className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-brand/10 border border-brand/20">
              {photoUrl ? (
                <AvatarImage src={photoUrl} alt={name} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-brand/10 text-brand">
                <Utensils className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-wrap gap-1 items-center justify-end">
              {!isActive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[11px] font-semibold bg-warn/10 text-warn border border-warn/20">
                  <Archive className="w-3 h-3 shrink-0" />
                  <span>Archived</span>
                </span>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(meal);
                }}
                className="cursor-pointer p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-info hover:bg-info/10 active:scale-95 transition-all"
                title="Edit meal"
                aria-label={`Edit ${name}`}
              >
                <Pencil size={16} />
              </button>

              {isActive ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(meal);
                  }}
                  className="cursor-pointer p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-warn hover:bg-warn/10 active:scale-95 transition-all"
                  title="Archive meal"
                  aria-label={`Archive ${name}`}
                >
                  <Archive size={16} />
                </button>
              ) : (
                onUnarchive && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnarchive(meal);
                    }}
                    className="cursor-pointer p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-success hover:bg-success/10 active:scale-95 transition-all"
                    title="Unarchive meal"
                    aria-label={`Unarchive ${name}`}
                  >
                    <RotateCcw size={16} />
                  </button>
                )
              )}
            </div>
          </div>

          {/* Title & description & ingredient count */}
          <div>
            <h3 className="text-lg font-bold leading-tight text-foreground line-clamp-2" title={name}>
              {name}
            </h3>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
            <p className="mt-1 text-[11px] font-semibold text-brand">
              {ingredientCount} {ingredientCount === 1 ? "ingredient" : "ingredients"}
            </p>
          </div>

          {/* Tags & Allergens */}
          {(validTags.length > 0 || effectiveAllergens.length > 0) && (
            <div className="flex flex-wrap gap-1">
              {validTags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20 capitalize"
                >
                  {t.replace(/_/g, " ")}
                </span>
              ))}
              {effectiveAllergens.map((a) => (
                <span
                  key={a}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Calculated Totals Grid */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border/60">
          <Stat label="Cal" value={`${totals?.calories ?? 0}`} />
          <Stat label="Protein" value={`${totals?.proteinG ?? 0}g`} />
          <Stat label="Carbs" value={`${totals?.carbsG ?? 0}g`} />
          <Stat label="Fat" value={`${totals?.fatG ?? 0}g`} />
          <Stat label="Fiber" value={totals?.fiberG != null ? `${totals.fiberG}g` : "—"} />
        </div>
      </CardMain>
    </div>
  );
}