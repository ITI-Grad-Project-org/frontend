import { Plus, X, Trash2, DumbbellIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type { Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { createExercise, updateExercise } from "@/services/exercises";
import { getApiErrorMessage } from "@/lib/api";
import type { Exercise } from "@/types/exercise";

import {
  addExerciseSchema,
  CATEGORY_OPTIONS,
  MUSCLE_OPTIONS,
  EQUIPMENT_OPTIONS,
  getDefaultExerciseValues,
  type AddExerciseSubmitValues,
} from "@/schemas/addExercise";

// ─── Shared input / select class ──────────────────────────────────────────────

const fieldCls =
  "w-full px-4 h-12 rounded-xl border-2 border-border bg-card text-sm outline-none focus:border-brand transition-colors placeholder:text-muted-foreground";

const selectCls =
  "w-full px-3 h-12 rounded-xl border-2 border-border bg-card text-sm outline-none focus:border-brand transition-colors";

const chipCls =
  "cursor-pointer inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors";

const fieldErrorCls = "border-destructive focus:border-destructive";
const errorMsgCls = "mt-1.5 text-xs text-destructive";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  onClose: () => void;
  /** When provided, the modal operates in edit mode */
  exercise?: Exercise | null;
  onSuccess: (exercise: Exercise) => void;
};

// ─── Field-group sub-components ───────────────────────────────────────────────

function ChipMultiSelect({
  control,
  name,
  options,
  disabled,
}: {
  control: Control<AddExerciseSubmitValues>;
  name: "secondaryMuscles" | "equipment";
  options: readonly { value: string; label: string }[];
  disabled: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const toggle = (value: string) => {
          const selected = field.value as string[];
          const next = selected.includes(value)
            ? selected.filter((v) => v !== value)
            : [...selected, value];
          field.onChange(next);
        };

        return (
          <div className="px-3 py-3 rounded-xl border-2 border-border bg-card focus-within:border-brand transition-colors">
            {field.value.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {field.value.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => toggle(v)}
                    disabled={disabled}
                    className={`${chipCls} border-border bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive`}
                  >
                    {options.find((o) => o.value === v)?.label ?? v}
                    <span aria-hidden className="text-base leading-none">×</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {options
                .filter((o) => !(field.value as string[]).includes(o.value))
                .map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggle(o.value)}
                    disabled={disabled}
                    className={`${chipCls} border-border bg-background hover:border-brand hover:text-foreground`}
                  >
                    <Plus size={10} />
                    {o.label}
                  </button>
                ))}
            </div>
          </div>
        );
      }}
    />
  );
}

// ─── Modal form ───────────────────────────────────────────────────────────────

function AddExerciseModalContent({
  onClose,
  exercise,
  onSuccess,
}: Omit<Props, "open">) {
  const isEdit = !!exercise;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddExerciseSubmitValues>({
    resolver: zodResolver(addExerciseSchema),
    values: getDefaultExerciseValues(exercise ?? undefined),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "instructionSteps",
  });

  const onSubmit = async (data: AddExerciseSubmitValues) => {
    const payload = {
      name: data.name,
      category: data.category,
      primaryMuscle: data.primaryMuscle,
      secondaryMuscles: data.secondaryMuscles,
      equipment: data.equipment.length > 0 ? data.equipment : ["none"],
      instructionSteps: data.instructionSteps.map((s) => s.value),
      thumbnailUrl: data.thumbnailUrl || null,
      demoVideoUrl: data.demoVideoUrl || null,
      demoGifUrl: data.demoGifUrl || null,
    };

    try {
      let result: Exercise;
      if (isEdit && exercise) {
        result = await updateExercise(exercise.id, payload);
        toast.success("Exercise updated!");
      } else {
        result = await createExercise(payload);
        toast.success("Exercise added to library!");
      }
      onSuccess(result);
      onClose();
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          `Failed to ${isEdit ? "update" : "create"} exercise. Please try again.`,
        ),
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-background shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Sticky header ───────────────────────────────────────────────── */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-2xl font-bold">
              {isEdit ? "Edit Exercise" : "Add to Library"}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {isEdit
                ? "Update the exercise details."
                : "Create a new exercise available to every plan."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-border cursor-pointer hover:bg-muted transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable form ─────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-y-auto flex-1 p-6 space-y-5"
        >
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Exercise name *
            </label>
            <div className="flex gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-border bg-muted text-muted-foreground shrink-0">
                <DumbbellIcon size={20} />
              </div>
              <input
                {...register("name")}
                placeholder="e.g. Romanian Deadlift"
                className={`${fieldCls} ${errors.name ? fieldErrorCls : ""}`}
              />
            </div>
            {errors.name && (
              <p className={errorMsgCls} role="alert">{errors.name.message}</p>
            )}
          </div>

          {/* Category + Primary Muscle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Category *
              </label>
              <select {...register("category")} className={`${selectCls} ${errors.category ? fieldErrorCls : ""}`}>
                <option value="">Select…</option>
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.category && (
                <p className={errorMsgCls} role="alert">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Primary muscle *
              </label>
              <select {...register("primaryMuscle")} className={`${selectCls} ${errors.primaryMuscle ? fieldErrorCls : ""}`}>
                <option value="">Select…</option>
                {MUSCLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.primaryMuscle && (
                <p className={errorMsgCls} role="alert">{errors.primaryMuscle.message}</p>
              )}
            </div>
          </div>

          {/* Secondary Muscles — chips */}
          <FieldGroup
            label="Secondary muscles"
            error={errors.secondaryMuscles?.message}
          >
            <ChipMultiSelect
              control={control}
              name="secondaryMuscles"
              options={MUSCLE_OPTIONS}
              disabled={isSubmitting}
            />
          </FieldGroup>

          {/* Equipment — chips */}
          <FieldGroup
            label="Equipment"
            error={errors.equipment?.message}
          >
            <ChipMultiSelect
              control={control}
              name="equipment"
              options={EQUIPMENT_OPTIONS}
              disabled={isSubmitting}
            />
          </FieldGroup>

          {/* Instruction Steps */}
          <FieldGroup
            label="Instruction steps *"
            error={errors.instructionSteps?.root?.message}
          >
            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground/50 w-5 text-center shrink-0">
                    {i + 1}
                  </span>
                  <input
                    {...register(`instructionSteps.${i}.value`)}
                    placeholder={`Step ${i + 1}…`}
                    disabled={isSubmitting}
                    className={`flex-1 px-3 py-2.5 rounded-xl border-2 border-border bg-card text-sm outline-none focus:border-brand transition-colors placeholder:text-muted-foreground ${errors.instructionSteps?.[i]?.value ? fieldErrorCls : ""}`}
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      disabled={isSubmitting}
                      className="cursor-pointer p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ value: "" })}
                disabled={isSubmitting || fields.length >= 10}
                className="text-xs font-semibold text-brand hover:opacity-75 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add step
              </button>
            </div>
          </FieldGroup>

          {/* Media URLs */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Media URLs <span className="font-normal">(optional)</span>
            </label>
            <div className="space-y-2.5">
              {(
                [
                  ["thumbnailUrl", "Thumbnail URL", "https://example.com/exercise-thumb.webp"],
                  ["demoVideoUrl", "Demo Video URL", "https://example.com/demo.mp4"],
                  ["demoGifUrl", "Demo GIF URL", "https://example.com/demo.gif"],
                ] as const
              ).map(([name, label, placeholder]) => (
                <div key={name}>
                  <label htmlFor={name} className="block text-xs text-muted-foreground mb-1">
                    {label}
                  </label>
                  <input
                    id={name}
                    {...register(name)}
                    placeholder={placeholder}
                    type="url"
                    className={`${fieldCls} ${errors[name] ? fieldErrorCls : ""}`}
                  />
                  {errors[name] && (
                    <p className={errorMsgCls} role="alert">{errors[name]?.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-1 pb-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer flex items-center justify-center w-full gap-2 font-semibold bg-ink text-ink-foreground h-12 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                isEdit ? "Saving…" : "Adding…"
              ) : (
                <>
                  <Plus size={18} />
                  {isEdit ? "Save changes" : "Save exercise"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldGroup({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className={errorMsgCls} role="alert">{error}</p>}
    </div>
  );
}

// ─── Main Exported Component ─────────────────────────────────────────────────

export default function AddExerciseModal(props: Props) {
  if (!props.open) return null;

  return (
    <AddExerciseModalContent
      key={props.exercise?.id ?? "new-exercise"}
      {...props}
    />
  );
}