// src/components/modals/AddEditFoodModal.tsx
import { useEffect, useState, useRef } from "react";
import { X, Apple, Plus, Check } from "lucide-react";
import type {
  Food,
  CreateFoodDto,
  UpdateFoodDto,
  ServingUnit,
  DietaryTag,
} from "@/types/nutrition";
import { SERVING_UNITS, DIETARY_TAGS } from "@/types/nutrition";

interface AddEditFoodModalProps {
  open: boolean;
  onClose: () => void;
  food?: Food | null;
  onSave: (
    dto: CreateFoodDto | UpdateFoodDto,
    isEditing: boolean,
    foodId?: string
  ) => Promise<void>;
}

export default function AddEditFoodModal({
  open,
  onClose,
  food,
  onSave,
}: AddEditFoodModalProps) {
  const isEditing = !!food;

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [servingSize, setServingSize] = useState<number | "">(100);
  const [servingUnit, setServingUnit] = useState<ServingUnit>("g");
  const [calories, setCalories] = useState<number | "">(165);
  const [proteinG, setProteinG] = useState<number | "">(31);
  const [carbsG, setCarbsG] = useState<number | "">(0);
  const [fatG, setFatG] = useState<number | "">(3.6);
  const [fiberG, setFiberG] = useState<number | "">(0);
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>(["none"]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [allergenInput, setAllergenInput] = useState("");
  const allergenInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (food) {
      setName(food.name || "");
      setBrand(food.brand || "");
      setServingSize(food.servingSize ?? 100);
      setServingUnit(food.servingUnit || "g");
      setCalories(food.calories ?? 0);
      setProteinG(food.proteinG ?? 0);
      setCarbsG(food.carbsG ?? 0);
      setFatG(food.fatG ?? 0);
      setFiberG(food.fiberG ?? 0);
      setDietaryTags(food.dietaryTags?.length ? food.dietaryTags : ["none"]);
      setAllergens(food.allergens ?? []);
      setAllergenInput("");
    } else {
      setName("");
      setBrand("");
      setServingSize(100);
      setServingUnit("g");
      setCalories(165);
      setProteinG(31);
      setCarbsG(0);
      setFatG(3.6);
      setFiberG(0);
      setDietaryTags(["none"]);
      setAllergens([]);
      setAllergenInput("");
    }
    setErrorMsg("");
  }, [food, open]);

  if (!open) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg("Food name is required.");
      return;
    }
    if (trimmedName.length > 150) {
      setErrorMsg("Food name cannot exceed 150 characters.");
      return;
    }
    if (typeof servingSize !== "number" || servingSize <= 0 || servingSize > 1000) {
      setErrorMsg("Serving size must be between 1 and 1000.");
      return;
    }
    if (typeof calories !== "number" || calories < 0 || calories > 2000) {
      setErrorMsg("Calories per serving must be between 0 and 2000.");
      return;
    }
    if (typeof proteinG !== "number" || proteinG < 0 || proteinG > 150) {
      setErrorMsg("Protein must be between 0 and 150g.");
      return;
    }
    if (typeof carbsG !== "number" || carbsG < 0 || carbsG > 300) {
      setErrorMsg("Carbohydrates must be between 0 and 300g.");
      return;
    }
    if (typeof fatG !== "number" || fatG < 0 || fatG > 150) {
      setErrorMsg("Fat must be between 0 and 150g.");
      return;
    }
    if (fiberG !== "" && (typeof fiberG !== "number" || fiberG < 0 || fiberG > 75)) {
      setErrorMsg("Fiber must be between 0 and 75g.");
      return;
    }

    const dto: CreateFoodDto = {
      name: trimmedName,
      brand: brand.trim() || null,
      servingSize,
      servingUnit,
      calories,
      proteinG,
      carbsG,
      fatG,
      fiberG: typeof fiberG === "number" ? fiberG : 0,
      dietaryTags,
      allergens,
    };

    try {
      setSubmitting(true);
      await onSave(dto, isEditing, food?.id);
      onClose();
    } catch {
      // Handled in parent hook / toast
    } finally {
      setSubmitting(false);
    }
  };

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
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Apple className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display">
                {isEditing ? "Edit Food Item" : "Add Food Item"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Define a reference serving ingredient for your library.
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
          <div className="mt-4 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive">
            {errorMsg}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
          {/* Name & Brand */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Food Name <span className="text-destructive">*</span>
              </label>
              <input
                required
                maxLength={150}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chicken breast"
                className="w-full px-4 h-12 border rounded-2xl bg-background outline-none border-border focus:border-brand/50 text-sm font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Brand / Supplier <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Local Butcher or Brand name"
                className="w-full px-4 h-12 border rounded-2xl bg-background outline-none border-border focus:border-brand/50 text-sm font-medium"
              />
            </div>
          </div>

          {/* Reference Serving */}
          <div className="p-4 rounded-3xl bg-muted/40 border border-border/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Reference Serving
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Serving Size <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  max="1000"
                  required
                  value={servingSize}
                  onChange={(e) => setServingSize(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="100"
                  className="w-full px-3 h-11 border rounded-xl bg-background outline-none border-border text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Serving Unit <span className="text-destructive">*</span>
                </label>
                <select
                  value={servingUnit}
                  onChange={(e) => setServingUnit(e.target.value as ServingUnit)}
                  className="w-full px-3 h-11 border rounded-xl bg-background outline-none border-border text-sm font-semibold cursor-pointer"
                >
                  {SERVING_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Macros & Nutrients per serving */}
          <div className="p-4 rounded-3xl bg-muted/40 border border-border/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Nutrition per Reference Serving
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Calories (kcal) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="2000"
                  required
                  value={calories}
                  onChange={(e) => setCalories(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 h-11 border rounded-xl bg-background outline-none border-border text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Protein (g) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="150"
                  required
                  value={proteinG}
                  onChange={(e) => setProteinG(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 h-11 border rounded-xl bg-background outline-none border-border text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Carbs (g) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="300"
                  required
                  value={carbsG}
                  onChange={(e) => setCarbsG(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 h-11 border rounded-xl bg-background outline-none border-border text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Fat (g) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="150"
                  required
                  value={fatG}
                  onChange={(e) => setFatG(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 h-11 border rounded-xl bg-background outline-none border-border text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Fiber (g)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="75"
                  value={fiberG}
                  onChange={(e) => setFiberG(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 h-11 border rounded-xl bg-background outline-none border-border text-sm font-bold"
                />
              </div>
            </div>
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
                    className={`cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${selected
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

          {/* Allergens */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Allergens <span className="text-muted-foreground font-normal">(type &amp; press Enter or comma)</span>
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
                placeholder={allergens.length === 0 ? "e.g. milk, peanuts, soy" : ""}
                className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
              />
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
                ? "Update Food Item"
                : "Create Food Item"}
          </button>
        </form>
      </div>
    </div>
  );
}
