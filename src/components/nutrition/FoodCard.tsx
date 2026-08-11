// src/components/nutrition/FoodCard.tsx
import { Apple, Pencil, Archive, RotateCcw } from "lucide-react";
import CardMain from "../cards/CardMain";
import type { Food } from "@/types/nutrition";

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
      className="cursor-pointer text-left block w-full rounded-2xl transition-all hover:scale-[1.01] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <CardMain className="p-3.5 sm:p-4 flex-row items-center justify-between gap-4">
        {/* Left section: Icon + Info */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0 bg-success/10 border border-success/20 flex items-center justify-center text-success">
            <Apple className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-foreground truncate" title={name}>
                {name}
              </h3>
              {!isActive && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[10px] font-semibold bg-warn/10 text-warn border border-warn/20">
                  <Archive className="w-2.5 h-2.5 shrink-0" />
                  <span>Archived</span>
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
              {brand && <span className="truncate">{brand} • </span>}
              <span className="font-semibold text-foreground/80">
                {servingSize} {servingUnit}
              </span>
              {(validTags.length > 0 || allergens.length > 0) && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  {validTags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-brand/10 text-brand capitalize"
                    >
                      {t.replace(/_/g, " ")}
                    </span>
                  ))}
                  {allergens.length > 0 && (
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-danger/10 text-danger">
                      {allergens[0]}
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right section: Macros badge + Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Minimal Macros Pill */}
          <div className="hidden sm:flex items-center justify-between gap-1 w-56 shrink-0 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/40 text-xs">
            <div className="flex flex-col items-center leading-none flex-1 min-w-0 px-0.5">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">Cal</span>
              <span className="font-extrabold text-foreground mt-0.5 tabular-nums whitespace-nowrap">{calories}</span>
            </div>
            <div className="w-px h-6 bg-border/60 shrink-0" />
            <div className="flex flex-col items-center leading-none flex-1 min-w-0 px-0.5">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">P</span>
              <span className="font-extrabold text-success mt-0.5 tabular-nums whitespace-nowrap">{proteinG}g</span>
            </div>
            <div className="w-px h-6 bg-border/60 shrink-0" />
            <div className="flex flex-col items-center leading-none flex-1 min-w-0 px-0.5">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">C</span>
              <span className="font-extrabold text-info mt-0.5 tabular-nums whitespace-nowrap">{carbsG}g</span>
            </div>
            <div className="w-px h-6 bg-border/60 shrink-0" />
            <div className="flex flex-col items-center leading-none flex-1 min-w-0 px-0.5">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">F</span>
              <span className="font-extrabold text-warn mt-0.5 tabular-nums whitespace-nowrap">{fatG}g</span>
            </div>
            {fiberG != null && (
              <>
                <div className="w-px h-6 bg-border/60 shrink-0" />
                <div className="flex flex-col items-center leading-none flex-1 min-w-0 px-0.5">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">Fib</span>
                  <span className="font-extrabold text-foreground mt-0.5 tabular-nums whitespace-nowrap">{fiberG}g</span>
                </div>
              </>
            )}
          </div>

          {/* Mobile minimal cal/P badge */}
          <div className="sm:hidden text-right">
            <div className="text-xs font-bold text-foreground">{calories} kcal</div>
            <div className="text-[11px] font-semibold text-success">{proteinG}g P</div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(food);
              }}
              className="cursor-pointer p-1.5 rounded-lg text-muted-foreground hover:text-info hover:bg-info/10 active:scale-95 transition-all"
              title="Edit food"
              aria-label={`Edit ${name}`}
            >
              <Pencil size={15} />
            </button>

            {isActive ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(food);
                }}
                className="cursor-pointer p-1.5 rounded-lg text-muted-foreground hover:text-warn hover:bg-warn/10 active:scale-95 transition-all"
                title="Archive food"
                aria-label={`Archive ${name}`}
              >
                <Archive size={15} />
              </button>
            ) : (
              onUnarchive && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnarchive(food);
                  }}
                  className="cursor-pointer p-1.5 rounded-lg text-muted-foreground hover:text-success hover:bg-success/10 active:scale-95 transition-all"
                  title="Unarchive food"
                  aria-label={`Unarchive ${name}`}
                >
                  <RotateCcw size={15} />
                </button>
              )
            )}
          </div>
        </div>
      </CardMain>
    </div>
  );
}