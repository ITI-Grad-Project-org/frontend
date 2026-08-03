import { useState } from "react";
import { X, Plus, DumbbellIcon, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
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
  type AddExerciseFormData,
} from "@/schemas/addExercise";

// ─── Shared input / select class ──────────────────────────────────────────────

const fieldCls =
  "w-full px-4 h-12 rounded-xl border-2 border-border bg-card text-sm outline-none focus:border-brand transition-colors placeholder:text-muted-foreground";

const selectCls =
  "w-full px-3 h-12 rounded-xl border-2 border-border bg-card text-sm outline-none focus:border-brand transition-colors";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  onClose: () => void;
  /** When provided, the modal operates in edit mode */
  exercise?: Exercise | null;
  onSuccess: (exercise: Exercise) => void;
};

// ─── Inner Modal Form Component ──────────────────────────────────────────────

function AddExerciseModalContent({
  onClose,
  exercise,
  onSuccess,
}: Omit<Props, "open">) {
  const isEdit = !!exercise;

  // Derive initial values straight into useState
  const [secondaryMuscles, setSecondaryMuscles] = useState<string[]>(
    (exercise?.secondaryMuscles as string[]) ?? []
  );
  const [equipment, setEquipment] = useState<string[]>(
    exercise?.equipment ?? []
  );
  const [instructionSteps, setInstructionSteps] = useState<string[]>(
    exercise?.instructionSteps?.length ? [...exercise.instructionSteps] : [""]
  );
  const [stepsError, setStepsError] = useState("");

  // useForm dynamically syncs initial form values with `values`
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddExerciseFormData>({
    resolver: zodResolver(addExerciseSchema),
    values: {
      name: exercise?.name ?? "",
      category: exercise?.category as AddExerciseFormData["category"],
      primaryMuscle: exercise?.primaryMuscle as AddExerciseFormData["primaryMuscle"],
      thumbnailUrl: exercise?.thumbnailUrl ?? "",
      demoVideoUrl: exercise?.demoVideoUrl ?? "",
      demoGifUrl: exercise?.demoGifUrl ?? "",
    },
  });

  // ── Chip toggles ─────────────────────────────────────────────────────────────

  const toggleMuscle = (m: string) =>
    setSecondaryMuscles((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );

  const toggleEquipment = (e: string) =>
    setEquipment((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    );

  // ── Instruction steps ─────────────────────────────────────────────────────────

  const addStep = () => setInstructionSteps((prev) => {
    if (prev.length >= 10) return prev;
    return [...prev, ""];
  });

  const updateStep = (i: number, value: string) => {
    setInstructionSteps((prev) => prev.map((s, idx) => (idx === i ? value : s)));
    if (value.trim()) setStepsError("");
  };

  const removeStep = (i: number) => {
    if (instructionSteps.length <= 1) return;
    setInstructionSteps((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ── Submit ────────────────────────────────────────────────────────────────────

  const onSubmit = async (data: AddExerciseFormData) => {
    const steps = instructionSteps.filter((s) => s.trim());

    if (steps.length === 0) {
      setStepsError("Add at least one instruction step.");
      return;
    }
    setStepsError("");

    const payload = {
      name: data.name,
      category: data.category,
      primaryMuscle: data.primaryMuscle,
      secondaryMuscles,
      equipment: equipment.length > 0 ? equipment : ["none"],
      instructionSteps: steps,
      thumbnailUrl: data.thumbnailUrl || null,
      demoVideoUrl: data.demoVideoUrl || null,
      demoGifUrl: data.demoGifUrl || null,
    };

    try {
      let result: Exercise;
      if (isEdit && exercise) {
        // result = await updateExercise(exercise.id, payload as ExercisePayload);
        result = await updateExercise(exercise.id, payload);
        toast.success("Exercise updated!");
      } else {
        // result = await createExercise(payload as ExercisePayload);
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
                className={fieldCls}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Category + Primary Muscle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Category *
              </label>
              <select {...register("category")} className={selectCls}>
                <option value="">Select…</option>
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-destructive">Please Select The Exercise Category</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Primary muscle *
              </label>
              <select {...register("primaryMuscle")} className={selectCls}>
                <option value="">Select…</option>
                {MUSCLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.primaryMuscle && (
                <p className="mt-1 text-xs text-destructive">Please Select The Primary Muscle</p>
              )}
            </div>
          </div>

          {/* Secondary Muscles — chips */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Secondary muscles
            </label>
            <div className="px-3 py-3 border-2 rounded-xl border-border bg-card focus-within:border-brand transition-colors">
              {secondaryMuscles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {secondaryMuscles.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMuscle(m)}
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      {MUSCLE_OPTIONS.find((o) => o.value === m)?.label ?? m}
                      <span aria-hidden className="text-base leading-none">×</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {MUSCLE_OPTIONS.filter((o) => !secondaryMuscles.includes(o.value)).map(
                  (o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => toggleMuscle(o.value)}
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-brand hover:text-foreground transition-colors"
                    >
                      <Plus size={10} />
                      {o.label}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Equipment — chips */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Equipment
            </label>
            <div className="px-3 py-3 border-2 rounded-xl border-border bg-card focus-within:border-brand transition-colors">
              {equipment.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {equipment.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => toggleEquipment(e)}
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      {EQUIPMENT_OPTIONS.find((o) => o.value === e)?.label ?? e}
                      <span aria-hidden className="text-base leading-none">×</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {EQUIPMENT_OPTIONS.filter((o) => !equipment.includes(o.value)).map(
                  (o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => toggleEquipment(o.value)}
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-brand hover:text-foreground transition-colors"
                    >
                      <Plus size={10} />
                      {o.label}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Instruction Steps */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Instruction steps <span className="text-destructive">*</span>
                </label>
                {stepsError && (
                  <p className="mt-0.5 text-xs text-destructive">{stepsError}</p>
                )}
              </div>
              <button
                type="button"
                onClick={addStep}
                disabled={instructionSteps.length >= 10}
                className="text-xs font-semibold text-brand hover:opacity-75 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add step
              </button>
            </div>
            <div className={`space-y-2 rounded-xl border-2 p-3 transition-colors ${stepsError ? "border-destructive/40 bg-destructive/5" : "border-transparent"}`}>
              {instructionSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground/50 w-5 text-center shrink-0">
                    {i + 1}
                  </span>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(i, e.target.value)}
                    placeholder={`Step ${i + 1}…`}
                    rows={2}
                    className="flex-1 px-3 py-2.5 rounded-xl border-2 border-border bg-card text-sm outline-none focus:border-brand transition-colors placeholder:text-muted-foreground resize-none leading-relaxed"
                  />
                  {instructionSteps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(i)}
                      className="cursor-pointer p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Media URLs */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Media URLs <span className="font-normal">(optional)</span>
            </label>
            <div className="space-y-2.5">
              {/* Thumbnail Input */}
              <div>
                <label htmlFor="thumbnailUrl" className="block text-xs text-muted-foreground mb-1">
                  Thumbnail URL
                </label>
                <input
                  id="thumbnailUrl"
                  {...register("thumbnailUrl")}
                  placeholder="https://example.com/exercise-thumb.webp"
                  type="url"
                  className={fieldCls}
                />
                {errors.thumbnailUrl && (
                  <p className="mt-1 text-xs text-destructive">{errors.thumbnailUrl.message}</p>
                )}
              </div>

              {/* Video Demo Input */}
              <div>
                <label htmlFor="demoVideoUrl" className="block text-xs text-muted-foreground mb-1">
                  Demo Video URL
                </label>
                <input
                  id="demoVideoUrl"
                  {...register("demoVideoUrl")}
                  placeholder="https://example.com/demo.mp4"
                  type="url"
                  className={fieldCls}
                />
                {errors.demoVideoUrl && (
                  <p className="mt-1 text-xs text-destructive">{errors.demoVideoUrl.message}</p>
                )}
              </div>

              {/* GIF Demo Input */}
              <div>
                <label htmlFor="demoGifUrl" className="block text-xs text-muted-foreground mb-1">
                  Demo GIF URL
                </label>
                <input
                  id="demoGifUrl"
                  {...register("demoGifUrl")}
                  placeholder="https://example.com/demo.gif"
                  type="url"
                  className={fieldCls}
                />
                {errors.demoGifUrl && (
                  <p className="mt-1 text-xs text-destructive">{errors.demoGifUrl.message}</p>
                )}
              </div>
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

// ─── Main Exported Component ─────────────────────────────────────────────────

export default function AddExerciseModal(props: Props) {
  if (!props.open) return null;

  // Passing a dynamic key resets all internal state (secondaryMuscles, steps, etc.) 
  // whenever opening for a different exercise or creating fresh.
  return (
    <AddExerciseModalContent
      key={props.exercise?.id ?? "new-exercise"}
      {...props}
    />
  );
}