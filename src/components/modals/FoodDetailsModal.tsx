// src/components/modals/FoodDetailsModal.tsx
import { useState } from "react";
import { X, Apple, Calculator, Pencil } from "lucide-react";
import type { Food } from "@/types/nutrition";

interface FoodDetailsModalProps {
  food: Food | null;
  onClose: () => void;
  onEdit?: (food: Food) => void;
}

export default function FoodDetailsModal({
  food,
  onClose,
  onEdit,
}: FoodDetailsModalProps) {
  const [calcAmount, setCalcAmount] = useState<number | "">(150);

  if (!food) return null;

  const currentCalc = typeof calcAmount === "number" && calcAmount > 0 ? calcAmount : food.servingSize;
  const ratio = food.servingSize > 0 ? currentCalc / food.servingSize : 1;

  const scaledCal = Math.round(food.calories * ratio * 10) / 10;
  const scaledProtein = Math.round(food.proteinG * ratio * 10) / 10;
  const scaledCarbs = Math.round(food.carbsG * ratio * 10) / 10;
  const scaledFat = Math.round(food.fatG * ratio * 10) / 10;
  const scaledFiber = food.fiberG != null ? Math.round(food.fiberG * ratio * 10) / 10 : null;

  const validTags = food.dietaryTags.filter((t) => t !== "none");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-6 my-8 shadow-2xl rounded-4xl bg-card border border-border animate-in fade-in zoom-in-95 text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-success/10 text-success border border-success/20">
              <Apple className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display line-clamp-1">{food.name}</h2>
              <p className="text-xs text-muted-foreground">
                {food.brand ? `${food.brand} • ` : ""}Reference serving: {food.servingSize} {food.servingUnit}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors border rounded-xl cursor-pointer hover:bg-muted border-border text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* Reference Macros */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Reference Serving Nutrition ({food.servingSize} {food.servingUnit})
            </h4>
            <div className="grid grid-cols-5 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-muted/60 border border-border/50">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                  Calories
                </span>
                <span className="text-base font-extrabold text-foreground">{food.calories}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-muted/60 border border-border/50">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                  Protein
                </span>
                <span className="text-base font-extrabold text-foreground">{food.proteinG}g</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-muted/60 border border-border/50">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                  Carbs
                </span>
                <span className="text-base font-extrabold text-foreground">{food.carbsG}g</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-muted/60 border border-border/50">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                  Fat
                </span>
                <span className="text-base font-extrabold text-foreground">{food.fatG}g</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/60 border border-border/50">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                  Fiber
                </span>
                <span className="text-base font-extrabold text-foreground">
                  {food.fiberG != null ? `${food.fiberG}g` : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Scaled Serving Calculator */}
          <div className="p-4 rounded-3xl bg-brand/5 border border-brand/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand">
                <Calculator className="w-4 h-4" />
                <span>Portion Calculator</span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                Scaling Preview
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Client eats:</span>
              <input
                type="number"
                step="any"
                min="1"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-24 px-3 py-1.5 border rounded-xl bg-background text-sm font-bold border-border outline-none"
              />
              <span className="text-sm font-bold text-foreground">{food.servingUnit}</span>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center pt-2 border-t border-brand/20">
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground block">Calories</span>
                <span className="text-sm font-black text-brand">{scaledCal} kcal</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground block">Protein</span>
                <span className="text-sm font-black text-foreground">{scaledProtein}g</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground block">Carbs</span>
                <span className="text-sm font-black text-foreground">{scaledCarbs}g</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground block">Fat</span>
                <span className="text-sm font-black text-foreground">{scaledFat}g</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground block">Fiber</span>
                <span className="text-sm font-black text-foreground">{scaledFiber != null ? `${scaledFiber}g` : "—"}</span>
              </div>
            </div>
          </div>

          {/* Tags & Allergens */}
          {(validTags.length > 0 || food.allergens.length > 0) && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Properties
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {validTags.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-brand/10 text-brand border border-brand/20 capitalize"
                  >
                    {t.replace(/_/g, " ")}
                  </span>
                ))}
                {food.allergens.map((a) => (
                  <span
                    key={a}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-danger/10 text-danger border border-danger/20"
                  >
                    Contains {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status & Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Status:{" "}
              <strong className={food.isActive ? "text-success" : "text-warn"}>
                {food.isActive ? "Active" : "Archived"}
              </strong>
            </span>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(food);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-brand text-brand-foreground rounded-xl hover:opacity-90 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Food Item
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}