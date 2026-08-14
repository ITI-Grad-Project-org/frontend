// src/components/modals/foods/AddEditFoodModal.tsx
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { X, Apple, Plus, Check } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import type { Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Food, CreateFoodDto, UpdateFoodDto, DietaryTag } from "@/types/nutrition";
import { SERVING_UNITS, DIETARY_TAGS } from "@/types/nutrition";
import {
  addEditFoodSchema,
  getFoodDefaults,
  toFoodSubmitDto,
  type AddEditFoodFormValues,
  type AddEditFoodSubmitValues,
} from "@/schemas/food";

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 h-12 border rounded-2xl bg-background outline-none border-border focus:border-brand/50 text-sm font-medium";
const inputErrorCls = "border-destructive focus:border-destructive";
const errorMsgCls = "mt-1 text-xs text-destructive";
const numCls =
  "w-full px-3 h-11 border rounded-xl bg-background outline-none border-border text-sm font-bold";
const numErrorCls = "border-destructive focus:border-destructive";

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

// ─── Dietary tags chip select ─────────────────────────────────────────────────

function DietaryTagSelect({
  control,
  disabled,
}: {
  control: Control<AddEditFoodFormValues, unknown, AddEditFoodSubmitValues>;
  disabled: boolean;
}) {
  return (
    <Controller
      control={control}
      name="dietaryTags"
      render={({ field }) => {
        const toggle = (tag: DietaryTag) => {
          if (tag === "none") {
            field.onChange(field.value.includes("none") ? [] : ["none"]);
            return;
          }
          const next = field.value.filter((t) => t !== "none");
          if (next.includes(tag)) {
            field.onChange(next.filter((t) => t !== tag));
          } else {
            field.onChange([...next, tag]);
          }
        };

        return (
          <div className="flex flex-wrap gap-1.5">
            {DIETARY_TAGS.map((t) => {
              const selected = field.value.includes(t.value);
              return (
                <button
                  key={t.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggle(t.value)}
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
        );
      }}
    />
  );
}

// ─── Allergen tag input ───────────────────────────────────────────────────────

function AllergenInput({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");

  const addAllergen = (raw: string) => {
    const val = raw.trim().toLowerCase();
    if (val && !value.includes(val)) {
      onChange([...value, val]);
    }
    setDraft("");
  };

  const removeAllergen = (a: string) =>
    onChange(value.filter((x) => x !== a));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addAllergen(draft);
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div
      className="flex flex-wrap gap-1.5 min-h-11 px-3 py-2 border rounded-2xl bg-background border-border focus-within:border-brand/50 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((a) => (
        <span
          key={a}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-danger/10 text-danger border border-danger/20"
        >
          {a}
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => { e.stopPropagation(); removeAllergen(a); }}
            className="ml-0.5 hover:text-danger cursor-pointer"
            aria-label={`Remove allergen ${a}`}
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => draft.trim() && addAllergen(draft)}
        placeholder={value.length === 0 ? "e.g. milk, peanuts, soy" : ""}
        className="flex-1 min-w-30 bg-transparent outline-none text-sm"
      />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function AddEditFoodModal({
  open,
  onClose,
  food,
  onSave,
}: AddEditFoodModalProps) {
  const isEditing = !!food;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddEditFoodFormValues, unknown, AddEditFoodSubmitValues>({
    resolver: zodResolver(addEditFoodSchema),
    values: getFoodDefaults(food ?? undefined),
  });

  const [errorMsg, setErrorMsg] = useState("");

  if (!open) return null;

  const onSubmit = async (values: AddEditFoodSubmitValues) => {
    setErrorMsg("");
    try {
      const dto = toFoodSubmitDto(values);
      await onSave(dto, isEditing, food?.id);
      onClose();
    } catch {
      // Handled in parent hook / toast
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg p-6 sm:p-8 my-8 shadow-2xl rounded-4xl bg-card border border-border modal-card text-foreground max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-success/10 text-success border border-success/20">
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

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Name & Brand */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Food Name <span className="text-destructive">*</span>
              </label>
              <input
                maxLength={150}
                placeholder="e.g. Chicken breast"
                className={`${inputCls} ${errors.name ? inputErrorCls : ""}`}
                {...register("name")}
              />
              {errors.name && <p className={errorMsgCls} role="alert">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Brand / Supplier <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <input
                placeholder="e.g. Local Butcher or Brand name"
                className={`${inputCls} ${errors.brand ? inputErrorCls : ""}`}
                {...register("brand")}
              />
              {errors.brand && <p className={errorMsgCls} role="alert">{errors.brand.message}</p>}
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
                  placeholder="100"
                  className={`${numCls} ${errors.servingSize ? numErrorCls : ""}`}
                  {...register("servingSize")}
                />
                {errors.servingSize && <p className={errorMsgCls} role="alert">{errors.servingSize.message}</p>}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Serving Unit <span className="text-destructive">*</span>
                </label>
                <select
                  className="w-full px-3 h-11 border rounded-xl bg-background outline-none border-border text-sm font-semibold cursor-pointer"
                  {...register("servingUnit")}
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
              {(
                [
                  ["calories", "Calories (kcal)", true],
                  ["proteinG", "Protein (g)", true],
                  ["carbsG", "Carbs (g)", true],
                  ["fatG", "Fat (g)", true],
                  ["fiberG", "Fiber (g)", false],
                ] as const
              ).map(([name, label, required]) => (
                <div key={name}>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    {label} {required && <span className="text-destructive">*</span>}
                  </label>
                  <input
                    type="number"
                    step="any"
                    className={`${numCls} ${errors[name] ? numErrorCls : ""}`}
                    {...register(name)}
                  />
                  {errors[name] && <p className={errorMsgCls} role="alert">{errors[name]?.message}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Dietary Tags */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Dietary Tags
            </label>
            <DietaryTagSelect control={control} disabled={isSubmitting} />
            {errors.dietaryTags && <p className={errorMsgCls} role="alert">{errors.dietaryTags.message}</p>}
          </div>

          {/* Allergens */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Allergens <span className="text-muted-foreground font-normal">(type &amp; press Enter or comma)</span>
            </label>
            <Controller
              control={control}
              name="allergens"
              render={({ field }) => (
                <AllergenInput
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer flex items-center justify-center w-full gap-2 font-bold bg-brand text-brand-foreground h-12 rounded-2xl hover:opacity-90 transition-all shadow-md disabled:opacity-50 mt-4"
          >
            <Plus size={18} />
            {isSubmitting
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