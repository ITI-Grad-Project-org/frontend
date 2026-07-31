// src/components/nutrition/FoodCard.tsx
import { Apple, Pencil, Archive, RotateCcw } from "lucide-react";
import CardMain from "../cards/CardMain";
import { Avatar, AvatarFallback } from "../ui/avatar";
import type { Food } from "@/types/nutrition";

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

interface FoodCardProps {
  food: Food;
  onView: (food: Food) => void;
  onEdit: (food: Food) => void;
  onArchive: (food: Food) => void;
  onUnarchive?: (food: Food) => void;
}

export function FoodCard({
  food,
  onView,
  onEdit,
  onArchive,
  onUnarchive,
}: FoodCardProps) {
  const {
    name,
    brand,
    servingSize,
    servingUnit,
    calories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    dietaryTags,
    allergens,
    isActive,
  } = food;

  const validTags = dietaryTags.filter((t) => t !== "none");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(food)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(food);
        }
      }}
      className="cursor-pointer text-left block w-full h-full rounded-3xl transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <CardMain className="h-full justify-between gap-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <Avatar className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shrink-0 bg-emerald-500/10 border border-emerald-500/20">
              <AvatarFallback className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Apple className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-wrap gap-1 items-center justify-end">
              {!isActive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Archive className="w-3 h-3 shrink-0" />
                  <span>Archived</span>
                </span>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(food);
                }}
                className="cursor-pointer p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 active:scale-95 transition-all"
                title="Edit food"
                aria-label={`Edit ${name}`}
              >
                <Pencil size={16} />
              </button>

              {isActive ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(food);
                  }}
                  className="cursor-pointer p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 active:scale-95 transition-all"
                  title="Archive food"
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
                      onUnarchive(food);
                    }}
                    className="cursor-pointer p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 active:scale-95 transition-all"
                    title="Unarchive food"
                    aria-label={`Unarchive ${name}`}
                  >
                    <RotateCcw size={16} />
                  </button>
                )
              )}
            </div>
          </div>

          {/* Title & Brand */}
          <div>
            <h3 className="text-lg font-bold leading-tight text-foreground line-clamp-1" title={name}>
              {name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {brand ? `${brand} • ` : ""}
              <span className="font-semibold text-foreground/80">
                {servingSize} {servingUnit}
              </span>{" "}
              per serving
            </p>
          </div>

          {/* Tags & Allergens */}
          {(validTags.length > 0 || allergens.length > 0) && (
            <div className="flex flex-wrap gap-1">
              {validTags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20 capitalize"
                >
                  {t.replace(/_/g, " ")}
                </span>
              ))}
              {allergens.map((a) => (
                <span
                  key={a}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                >
                  Contains {a}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Macro Stats Grid */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border/60">
          <Stat label="Cal" value={`${calories}`} />
          <Stat label="Protein" value={`${proteinG}g`} />
          <Stat label="Carbs" value={`${carbsG}g`} />
          <Stat label="Fat" value={`${fatG}g`} />
          <Stat label="Fiber" value={fiberG != null ? `${fiberG}g` : "—"} />
        </div>
      </CardMain>
    </div>
  );
}
