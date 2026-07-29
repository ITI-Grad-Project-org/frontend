// src/components/modals/MealDetailsModal.tsx
import { X, Utensils, Pencil } from "lucide-react";
import type { Meal } from "@/types/nutrition";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface MealDetailsModalProps {
  meal: Meal | null;
  onClose: () => void;
  onEdit?: (meal: Meal) => void;
}

export default function MealDetailsModal({
  meal,
  onClose,
  onEdit,
}: MealDetailsModalProps) {
  if (!meal) return null;

  const validTags = meal.dietaryTags.filter((t) => t !== "none");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg p-6 sm:p-8 my-8 shadow-2xl rounded-4xl bg-card border border-border animate-in fade-in zoom-in-95 text-foreground max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-14 h-14 rounded-2xl shrink-0 bg-brand/10 border border-brand/20">
              {meal.photoUrl ? (
                <AvatarImage src={meal.photoUrl} alt={meal.name} className="object-cover rounded-2xl" />
              ) : null}
              <AvatarFallback className="rounded-2xl bg-brand/10 text-brand">
                <Utensils className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold font-display line-clamp-1">{meal.name}</h2>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {meal.description || "Reusable meal recipe"}
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

        <div className="mt-6 space-y-6">
          {/* Authoritative Totals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Calculated Total Nutrition
            </h4>
            <div className="grid grid-cols-5 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-brand/10 border border-brand/20">
                <span className="text-[10px] font-bold uppercase text-brand block">
                  Calories
                </span>
                <span className="text-lg font-black text-brand">{meal.totals?.calories ?? 0}</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/60 border border-border/50">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                  Protein
                </span>
                <span className="text-base font-extrabold text-foreground">{meal.totals?.proteinG ?? 0}g</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/60 border border-border/50">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                  Carbs
                </span>
                <span className="text-base font-extrabold text-foreground">{meal.totals?.carbsG ?? 0}g</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/60 border border-border/50">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                  Fat
                </span>
                <span className="text-base font-extrabold text-foreground">{meal.totals?.fatG ?? 0}g</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/60 border border-border/50">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                  Fiber
                </span>
                <span className="text-base font-extrabold text-foreground">
                  {meal.totals?.fiberG != null ? `${meal.totals.fiberG}g` : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Ordered Recipe Ingredients */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Ingredients ({meal.ingredientCount})
            </h4>
            {meal.ingredients?.length ? (
              <div className="space-y-2">
                {meal.ingredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-foreground block">
                        {ing.position}. {ing.food.name}
                      </span>
                      <span className="text-muted-foreground">
                        {ing.amount} {ing.servingUnit}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-foreground block">
                        {ing.nutrients?.calories ?? 0} kcal
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {ing.nutrients?.proteinG ?? 0}g P • {ing.nutrients?.carbsG ?? 0}g C • {ing.nutrients?.fatG ?? 0}g F{ing.nutrients?.fiberG != null ? ` • ${ing.nutrients.fiberG}g Fiber` : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No ingredient breakdown available.</p>
            )}
          </div>

          {/* Prep Notes */}
          {meal.prepNotes && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Preparation Notes
              </h4>
              <p className="text-xs text-foreground bg-muted/30 p-3 rounded-2xl border border-border/50 whitespace-pre-wrap">
                {meal.prepNotes}
              </p>
            </div>
          )}

          {/* Tags & Effective Allergens */}
          {(validTags.length > 0 || meal.effectiveAllergens?.length > 0) && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Dietary & Allergen Properties
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
                {meal.effectiveAllergens?.map((a) => (
                  <span
                    key={a}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  >
                    Allergen: {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Status:{" "}
              <strong className={meal.isActive ? "text-emerald-600" : "text-amber-600"}>
                {meal.isActive ? "Active" : "Archived"}
              </strong>
            </span>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(meal);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-brand text-brand-foreground rounded-xl hover:opacity-90 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Meal Recipe
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
