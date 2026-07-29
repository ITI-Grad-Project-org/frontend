// src/components/modals/AddEditMealModal.tsx
import { useEffect, useState, useRef } from "react";
import { X, Utensils, Plus, Trash2, Check, AlertCircle } from "lucide-react";
import type {
  Meal,
  Food,
  CreateMealDto,
  UpdateMealDto,
  ReplaceMealItemsDto,
  MealItemDto,
  DietaryTag,
} from "@/types/nutrition";
import { DIETARY_TAGS } from "@/types/nutrition";

interface RecipeRow {
  foodId: string;
  amount: number | "";
}

interface AddEditMealModalProps {
  open: boolean;
  onClose: () => void;
  meal?: Meal | null;
  availableFoods: Food[];
  onSave: (
    metaDto: CreateMealDto | UpdateMealDto,
    recipeDto: ReplaceMealItemsDto,
    isEditing: boolean,
    mealId?: string
  ) => Promise<void>;
}

export default function AddEditMealModal({
  open,
  onClose,
  meal,
  availableFoods,
  onSave,
}: AddEditMealModalProps) {
  const isEditing = !!meal;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [prepNotes, setPrepNotes] = useState("");
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>(["none"]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [allergenInput, setAllergenInput] = useState("");
  const allergenInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<RecipeRow[]>([{ foodId: "", amount: 100 }]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (meal) {
      setName(meal.name || "");
      setDescription(meal.description || "");
      setPhotoUrl(meal.photoUrl || "");
      setPrepNotes(meal.prepNotes || "");
      setDietaryTags(meal.dietaryTags?.length ? meal.dietaryTags : ["none"]);
      setAllergens(meal.additionalAllergens ?? []);
      setAllergenInput("");
      if (meal.ingredients?.length) {
        setRows(
          meal.ingredients.map((ing) => ({
            foodId: ing.food.id,
            amount: ing.amount,
          }))
        );
      } else {
        setRows([{ foodId: "", amount: 100 }]);
      }
    } else {
      setName("");
      setDescription("");
      setPhotoUrl("");
      setPrepNotes("");
      setDietaryTags(["none"]);
      setAllergens([]);
      setAllergenInput("");
      setRows([{ foodId: "", amount: 100 }]);
    }
    setErrorMsg("");
  }, [meal, open]);

  if (!open) return null;

  const toggleDietaryTag = (tag: DietaryTag) => {
    if (tag === "none") {
      setDietaryTags(["none"]);
      return;
    }
    let updated = dietaryTags.filter((t) => t !== "none");
    if (updated.includes(tag)) {
      updated = updated.filter((t) => t !== tag);
    } else {
      updated.push(tag);
    }
    setDietaryTags(updated.length ? updated : ["none"]);
  };

  const addAllergen = (raw: string) => {
    const val = raw.trim().toLowerCase();
    if (val && !allergens.includes(val)) {
      setAllergens((prev) => [...prev, val]);
    }
    setAllergenInput("");
  };

  const removeAllergen = (a: string) =>
    setAllergens((prev) => prev.filter((x) => x !== a));

  const handleAllergenKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addAllergen(allergenInput);
    } else if (e.key === "Backspace" && !allergenInput && allergens.length > 0) {
      setAllergens((prev) => prev.slice(0, -1));
    }
  };

  const addRow = () => {
    if (rows.length >= 20) {
      setErrorMsg("A meal cannot exceed 20 ingredients.");
      return;
    }
    setRows([...rows, { foodId: "", amount: 100 }]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof RecipeRow, value: string | number) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  // Estimate client-side live preview totals
  let estimatedCal = 0;
  let estimatedProtein = 0;
  let estimatedCarbs = 0;
  let estimatedFat = 0;

  rows.forEach((row) => {
    if (!row.foodId || typeof row.amount !== "number" || row.amount <= 0) return;
    const food = availableFoods.find((f) => f.id === row.foodId);
    if (!food || food.servingSize <= 0) return;
    const ratio = row.amount / food.servingSize;
    estimatedCal += food.calories * ratio;
    estimatedProtein += food.proteinG * ratio;
    estimatedCarbs += food.carbsG * ratio;
    estimatedFat += food.fatG * ratio;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg("Meal name is required.");
      return;
    }
    if (trimmedName.length > 150) {
      setErrorMsg("Meal name cannot exceed 150 characters.");
      return;
    }
    if (description.length > 2000) {
      setErrorMsg("Description cannot exceed 2000 characters.");
      return;
    }
    if (prepNotes.length > 5000) {
      setErrorMsg("Preparation notes cannot exceed 5000 characters.");
      return;
    }

    // Validate rows
    if (rows.length < 1 || rows.length > 20) {
      setErrorMsg("Meal must contain between 1 and 20 ingredients.");
      return;
    }

    const items: MealItemDto[] = [];
    const usedFoodIds = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.foodId) {
        setErrorMsg(`Please select a food item for ingredient #${i + 1}.`);
        return;
      }
      if (usedFoodIds.has(r.foodId)) {
        setErrorMsg("Each food item can only be added once per meal recipe.");
        return;
      }
      usedFoodIds.add(r.foodId);

      if (typeof r.amount !== "number" || r.amount <= 0 || r.amount > 1500) {
        setErrorMsg(`Amount for ingredient #${i + 1} must be between 1 and 1500.`);
        return;
      }

      items.push({
        foodId: r.foodId,
        amount: r.amount,
      });
    }

    if (isEditing) {
      const updateMetaDto: UpdateMealDto = {
        name: trimmedName,
        description: description.trim() || null,
        photoUrl: photoUrl.trim() || null,
        prepNotes: prepNotes.trim() || null,
        dietaryTags,
        allergens,
      };
      const recipeDto: ReplaceMealItemsDto = { items };
      try {
        setSubmitting(true);
        await onSave(updateMetaDto, recipeDto, true, meal?.id);
        onClose();
      } catch {
        // Handled in parent hook
      } finally {
        setSubmitting(false);
      }
    } else {
      const createMetaDto: CreateMealDto = {
        name: trimmedName,
        description: description.trim() || null,
        photoUrl: photoUrl.trim() || null,
        prepNotes: prepNotes.trim() || null,
        dietaryTags,
        allergens,
        items,
      };
      const recipeDto: ReplaceMealItemsDto = { items };
      try {
        setSubmitting(true);
        await onSave(createMetaDto, recipeDto, false);
        onClose();
      } catch {
        // Handled in parent hook
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl p-6 sm:p-8 my-8 shadow-2xl rounded-4xl bg-card border border-border animate-in fade-in zoom-in-95 text-foreground max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand/10 text-brand border border-brand/20">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display">
                {isEditing ? "Edit Meal Recipe" : "Create Reusable Meal"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Combine food library items into a reusable recipe.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 transition-colors border rounded-xl cursor-pointer hover:bg-muted border-border text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-5">
          {/* Basic Metadata */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Meal Recipe Name <span className="text-destructive">*</span>
              </label>
              <input
                required
                maxLength={150}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chicken and Brown Rice Bowl"
                className="w-full px-4 h-12 border rounded-2xl bg-background outline-none border-border focus:border-brand/50 text-sm font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Description <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <input
                maxLength={2000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. High protein post-workout lunch recipe"
                className="w-full px-4 h-11 border rounded-2xl bg-background outline-none border-border focus:border-brand/50 text-sm"
              />
            </div>
          </div>

          {/* Recipe Ingredients Builder */}
          <div className="p-4 sm:p-5 rounded-3xl bg-muted/30 border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Recipe Ingredients ({rows.length} / 20)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select active foods from your food library and specify quantities.
                </p>
              </div>
              <button
                type="button"
                onClick={addRow}
                disabled={rows.length >= 20}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-brand text-brand-foreground rounded-xl hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Ingredient
              </button>
            </div>

            {availableFoods.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-600 dark:text-amber-400">
                No active food items found in your library. Please create food items first in the "Food Items" tab.
              </div>
            ) : (
              <div className="space-y-2.5">
                {rows.map((row, idx) => {
                  const selectedFood = availableFoods.find((f) => f.id === row.foodId);
                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-2xl bg-background border border-border"
                    >
                      <span className="text-xs font-bold text-muted-foreground w-6 shrink-0 text-center">
                        #{idx + 1}
                      </span>

                      {/* Food Selector */}
                      <select
                        required
                        value={row.foodId}
                        onChange={(e) => updateRow(idx, "foodId", e.target.value)}
                        className="flex-1 px-3 h-10 border rounded-xl bg-card border-border text-xs font-semibold outline-none cursor-pointer"
                      >
                        <option value="">-- Select food item --</option>
                        {availableFoods.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} {f.brand ? `(${f.brand})` : ""} — {f.servingSize} {f.servingUnit} ({f.calories} kcal)
                          </option>
                        ))}
                      </select>

                      {/* Amount Input */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="number"
                          step="any"
                          min="0.1"
                          max="1500"
                          required
                          value={row.amount}
                          onChange={(e) =>
                            updateRow(
                              idx,
                              "amount",
                              e.target.value === "" ? "" : Number(e.target.value)
                            )
                          }
                          placeholder="Amount"
                          className="w-24 px-3 h-10 border rounded-xl bg-card border-border text-xs font-bold outline-none"
                        />
                        <span className="text-xs font-semibold text-muted-foreground min-w-[36px]">
                          {selectedFood ? selectedFood.servingUnit : "unit"}
                        </span>
                      </div>

                      {/* Delete row */}
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all cursor-pointer self-end sm:self-center"
                          title="Remove ingredient"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Live estimated totals */}
            <div className="p-3 rounded-2xl bg-card border border-border/80 flex items-center justify-between text-xs">
              <span className="font-bold text-muted-foreground">
                Estimated Totals:
              </span>
              <div className="flex gap-3 font-extrabold text-foreground">
                <span>{Math.round(estimatedCal)} kcal</span>
                <span className="text-emerald-600">{Math.round(estimatedProtein * 10) / 10}g P</span>
                <span className="text-amber-600">{Math.round(estimatedCarbs * 10) / 10}g C</span>
                <span className="text-rose-600">{Math.round(estimatedFat * 10) / 10}g F</span>
              </div>
            </div>
          </div>

          {/* Prep notes & photo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Photo URL <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <input
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://cdn.example.com/meal.jpg"
                className="w-full px-4 h-11 border rounded-2xl bg-background outline-none border-border focus:border-brand/50 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Meal-level Allergens <span className="text-muted-foreground font-normal">(type &amp; press Enter or comma)</span>
              </label>
              <div
                className="flex flex-wrap gap-1.5 min-h-[44px] px-3 py-2 border rounded-2xl bg-background border-border focus-within:border-brand/50 cursor-text"
                onClick={() => allergenInputRef.current?.focus()}
              >
                {allergens.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  >
                    {a}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeAllergen(a); }}
                      className="ml-0.5 hover:text-rose-800 cursor-pointer"
                      aria-label={`Remove allergen ${a}`}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                <input
                  ref={allergenInputRef}
                  value={allergenInput}
                  onChange={(e) => setAllergenInput(e.target.value)}
                  onKeyDown={handleAllergenKeyDown}
                  onBlur={() => allergenInput.trim() && addAllergen(allergenInput)}
                  placeholder={allergens.length === 0 ? "e.g. sesame, mustard" : ""}
                  className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Preparation Notes <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              maxLength={5000}
              value={prepNotes}
              onChange={(e) => setPrepNotes(e.target.value)}
              placeholder="e.g. Grill chicken for 12 mins. Boil rice separately..."
              className="w-full p-3 border rounded-2xl bg-background outline-none border-border focus:border-brand/50 text-sm resize-none"
            />
          </div>

          {/* Dietary Tags */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Dietary Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_TAGS.map((t) => {
                const selected = dietaryTags.includes(t.value);
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => toggleDietaryTag(t.value)}
                    className={`cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                      selected
                        ? "bg-brand text-brand-foreground border-brand"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer flex items-center justify-center w-full gap-2 font-bold bg-brand text-brand-foreground h-12 rounded-2xl hover:opacity-90 transition-all shadow-md disabled:opacity-50 mt-4"
          >
            <Plus size={18} />
            {submitting
              ? "Saving..."
              : isEditing
              ? "Update Meal Recipe"
              : "Create Meal Recipe"}
          </button>
        </form>
      </div>
    </div>
  );
}
