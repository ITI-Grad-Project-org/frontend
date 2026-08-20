import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  Clock,
  Dumbbell,
  Loader2,
  ThumbsDown,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getExercises } from "@/services/exercises";
import { getMeals } from "@/services/nutrition";
import type {
  AINutritionSuggestionDay,
  AINutritionSuggestionMeal,
  AINutritionSuggestionPlan,
  AIPlanSuggestionDetail,
  AITrainingSuggestionDay,
  AITrainingSuggestionExercise,
  AITrainingSuggestionPlan,
  AITrainingSuggestionSet,
} from "@/types/ai";
import {
  acceptSuggestionSchema,
  defaultAcceptSuggestionValues,
  type AcceptSuggestionFormData,
  type AcceptSuggestionSubmitValues,
} from "@/schemas/ai";

type DecisionHandler = (payload: {
  name: string;
  startDate: string;
}) => Promise<void>;

type Props = {
  detail: AIPlanSuggestionDetail;
  clientName: string;
  accepting: boolean;
  declining: boolean;
  onAccept: DecisionHandler;
  onDecline: (reason: string) => Promise<void>;
};

const fieldCls =
  "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

function kindLabel(kind: AIPlanSuggestionDetail["kind"]) {
  return kind === "training"
    ? { label: "Training", Icon: Dumbbell }
    : { label: "Nutrition", Icon: UtensilsCrossed };
}

function describeTrainingSet(set: AITrainingSuggestionSet): string {
  if (set.durationSeconds) return `${set.durationSeconds}s`;
  const reps =
    set.repsMin !== null && set.repsMax !== null
      ? `${set.repsMin}–${set.repsMax}`
      : set.repsMin ?? set.repsMax;
  return reps !== null ? `${reps} reps` : "";
}

function trainingSetsSummary(exercise: AITrainingSuggestionExercise): string {
  const parts: string[] = [`${exercise.sets.length} set${exercise.sets.length === 1 ? "" : "s"}`];
  const first = exercise.sets[0];
  if (first) {
    const prescription = describeTrainingSet(first);
    if (prescription) parts.push(prescription);
    if (first.intensityType && first.intensityValue !== null) {
      parts.push(`@ ${first.intensityType.toUpperCase()} ${first.intensityValue}`);
    }
  }
  if (exercise.restSeconds > 0) parts.push(`${exercise.restSeconds}s rest`);
  return parts.join(" · ");
}

function TrainingPlanPanel({
  plan,
  exerciseNameMap,
}: {
  plan: AITrainingSuggestionPlan;
  exerciseNameMap: Map<string, string>;
}) {
  const days = plan.week?.days ?? [];
  const exerciseCount = days.reduce(
    (sum, day) => sum + (day.isRestDay ? 0 : day.exercises.length),
    0,
  );

  return (
    <div className="space-y-3">
      {days.map((day: AITrainingSuggestionDay) => (
        <div
          key={day.dayNumber}
          className="rounded-2xl border border-border bg-card/60 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-foreground">
              Day {day.dayNumber}
              {day.name ? <span className="text-muted-foreground"> · {day.name}</span> : null}
            </h4>
            {day.isRestDay ? (
              <span className="rounded-full bg-info/15 px-2.5 py-0.5 text-[11px] font-semibold text-info">
                Rest / active recovery
              </span>
            ) : (
              <span className="rounded-full bg-border px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {day.exercises.length} exercise{day.exercises.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {day.notes ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{day.notes}</p>
          ) : null}

          {!day.isRestDay && day.exercises.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {day.exercises.map((exercise) => (
                <li
                  key={`${day.dayNumber}-${exercise.position}`}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="font-semibold text-foreground">
                    {exercise.supersetGroup !== null ? (
                      <span className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand/15 text-[10px] font-bold text-brand">
                        S{exercise.supersetGroup}
                      </span>
                    ) : null}
                    {exerciseNameMap.get(exercise.exerciseId) ?? "Exercise"}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {trainingSetsSummary(exercise)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {day.exercises.some((e) => e.coachNotes) ? (
            <p className="mt-2.5 rounded-xl bg-brand/5 px-3 py-2 text-[11px] italic leading-relaxed text-foreground/80">
              {day.exercises
                .map((e) => (e.coachNotes ? `${exerciseNameMap.get(e.exerciseId) ?? "Exercise"}: ${e.coachNotes}` : null))
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}
        </div>
      ))}

      {exerciseCount === 0 ? (
        <p className="rounded-2xl border border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
          This program contains no exercises yet.
        </p>
      ) : null}
    </div>
  );
}

function mealSlotLabel(slot: string): string {
  return slot.replace(/_/g, " ");
}

function NutritionPlanPanel({
  plan,
  mealNameMap,
}: {
  plan: AINutritionSuggestionPlan;
  mealNameMap: Map<string, string>;
}) {
  const targets = plan.targets;
  const days = plan.week?.days ?? [];
  const mealCount = days.reduce((sum, day) => sum + day.meals.length, 0);

  const targetChips: Array<{ label: string; value: string }> = [];
  if (targets.calories != null) targetChips.push({ label: "Calories", value: `${targets.calories} kcal` });
  if (targets.proteinG != null) targetChips.push({ label: "Protein", value: `${targets.proteinG} g` });
  if (targets.carbsG != null) targetChips.push({ label: "Carbs", value: `${targets.carbsG} g` });
  if (targets.fatG != null) targetChips.push({ label: "Fat", value: `${targets.fatG} g` });
  if (targets.fiberG != null) targetChips.push({ label: "Fiber", value: `${targets.fiberG} g` });
  if (targets.waterMl != null) targetChips.push({ label: "Water", value: `${targets.waterMl} ml` });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {targetChips.map((chip) => (
          <div key={chip.label} className="rounded-xl border border-border bg-card/60 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {chip.label}
            </p>
            <p className="mt-0.5 text-sm font-bold text-foreground">{chip.value}</p>
          </div>
        ))}
      </div>

      {days.map((day: AINutritionSuggestionDay) => (
        <div
          key={day.dayNumber}
          className="rounded-2xl border border-border bg-card/60 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-foreground">Day {day.dayNumber}</h4>
            <span className="rounded-full bg-border px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {day.meals.length} meal{day.meals.length === 1 ? "" : "s"}
            </span>
          </div>

          {day.notes ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{day.notes}</p>
          ) : null}

          <ul className="mt-3 space-y-1.5">
            {day.meals.map((meal: AINutritionSuggestionMeal) => (
              <li key={`${day.dayNumber}-${meal.position}`} className="text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold capitalize text-foreground">
                    {mealSlotLabel(meal.slot)}
                    {meal.sourceMealId && mealNameMap.has(meal.sourceMealId) ? (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        — {mealNameMap.get(meal.sourceMealId)}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {meal.suggestedTime ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meal.suggestedTime}
                      </span>
                    ) : null}
                    {meal.servings != null ? (
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 font-semibold text-brand">
                        ×{Number(meal.servings.toFixed(1))}
                      </span>
                    ) : null}
                  </span>
                </div>
                {meal.coachNotes ? (
                  <p className="mt-1 text-[11px] italic leading-relaxed text-muted-foreground">
                    {meal.coachNotes}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {mealCount === 0 ? (
        <p className="rounded-2xl border border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
          This plan contains no meals yet.
        </p>
      ) : null}
    </div>
  );
}

function ConstraintsStrip({ detail }: { detail: AIPlanSuggestionDetail }) {
  const constraintChips: ReactNode[] = [];
  const goal = detail.constraints?.goal;
  if (goal) constraintChips.push(<span key="goal">{goal.replace(/_/g, " ")}</span>);
  if (detail.constraints?.durationWeeks != null) {
    constraintChips.push(
      <span key="weeks">
        {detail.constraints.durationWeeks} week{detail.constraints.durationWeeks === 1 ? "" : "s"}
      </span>,
    );
  }
  if (detail.kind === "training" && detail.constraints?.daysPerWeek != null) {
    constraintChips.push(<span key="days">{detail.constraints.daysPerWeek} days/week</span>);
  }
  if (detail.library?.counts.exercises != null) {
    constraintChips.push(
      <span key="exercises">{detail.library.counts.exercises} exercises in library</span>,
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {constraintChips.map((chip, index) => (
        <span
          key={index}
          className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold text-muted-foreground"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

export function AIPlanSuggestionReview({
  detail,
  clientName,
  accepting,
  declining,
  onAccept,
  onDecline,
}: Props) {
  const [decision, setDecision] = useState<"none" | "accept" | "decline">("none");
  const [declineReason, setDeclineReason] = useState("");

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises", { aiSuggestionNameMap: true }],
    queryFn: () => getExercises({}),
    staleTime: 5 * 60_000,
  });
  const { data: meals = [] } = useQuery({
    queryKey: ["meals", { aiSuggestionNameMap: true }],
    queryFn: () => getMeals({}),
    staleTime: 5 * 60_000,
  });

  const exerciseNameMap = new Map(exercises.map((e) => [e.id, e.name]));
  const mealNameMap = new Map(meals.map((m) => [m.id, m.name]));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AcceptSuggestionFormData, unknown, AcceptSuggestionSubmitValues>({
    resolver: zodResolver(acceptSuggestionSchema),
    defaultValues: { ...defaultAcceptSuggestionValues, name: detail.plan?.name ?? "" },
  });

  const { label, Icon } = kindLabel(detail.kind);
  const planName = detail.plan?.name ?? "AI suggestion";
  const hasWarnings = (detail.warningCounts?.error ?? 0) > 0;

  const submitAccept = handleSubmit((values) => {
    void onAccept(values).then(() => {
      setDecision("none");
      reset({ ...defaultAcceptSuggestionValues, name: detail.plan?.name ?? "" });
    });
  });

  const submitDecline = () => {
    void onDecline(declineReason.trim() || "No reason given");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Suggestion header */}
      <div className="border-b border-border p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/12 px-2.5 py-1 text-[11px] font-bold text-brand">
                <Icon className="h-3.5 w-3.5" />
                {label} suggestion
              </span>
              {hasWarnings ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-warn/15 px-2.5 py-1 text-[11px] font-semibold text-warn">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {detail.warningCounts.error} issue{detail.warningCounts.error === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground">{planName}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Drafted for {clientName} · {detail.constraints?.goal ? "goal: " : ""}
              {detail.constraints?.goal?.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <ConstraintsStrip detail={detail} />
        </div>

        {detail.plan?.description ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {detail.plan.description}
          </p>
        ) : null}
      </div>

      {/* Plan body */}
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {detail.plan ? (
          detail.kind === "training" ? (
            <TrainingPlanPanel
              plan={detail.plan as AITrainingSuggestionPlan}
              exerciseNameMap={exerciseNameMap}
            />
          ) : (
            <NutritionPlanPanel
              plan={detail.plan as AINutritionSuggestionPlan}
              mealNameMap={mealNameMap}
            />
          )
        ) : (
          <p className="rounded-2xl border border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
            This suggestion does not have a generated plan yet.
          </p>
        )}

        {detail.plan?.progression?.note ? (
          <div className="rounded-2xl bg-brand/8 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand">
              Progression
            </p>
            <p className="mt-1 text-xs leading-relaxed text-foreground/80">
              {detail.plan.progression.note}
            </p>
          </div>
        ) : null}
      </div>

      {/* Decision footer */}
      <div className="border-t border-border p-5">
        {decision === "none" ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {declining ? null : (
              <button
                type="button"
                onClick={() => {
                  setDecision("accept");
                  reset({
                    ...defaultAcceptSuggestionValues,
                    name: detail.plan?.name ?? "",
                  });
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
              >
                <Check className="h-4 w-4" />
                Accept suggestion
              </button>
            )}
            <button
              type="button"
              onClick={() => setDecision("decline")}
              disabled={accepting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ThumbsDown className="h-4 w-4" />
              Decline
            </button>
          </div>
        ) : decision === "accept" ? (
          <form onSubmit={submitAccept} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Plan name *
                </span>
                <input {...register("name")} placeholder="Name for the created plan" className={fieldCls} />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Start date *
                </span>
                <input {...register("startDate")} type="date" className={fieldCls} />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-destructive">{errors.startDate.message}</p>
                )}
              </label>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setDecision("none")}
                disabled={accepting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={accepting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {accepting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Building plan…
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Create plan
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Why are you declining?{" "}
                <span className="font-normal text-muted-foreground/70">
                  (this becomes the seed for the next generation)
                </span>
              </span>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={3}
                placeholder="Too much pressing volume for a shoulder that is still settling…"
                disabled={declining}
                className={`${fieldCls} min-h-20 resize-y`}
              />
            </label>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setDecision("none")}
                disabled={declining}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
              >
                Back
              </button>
              <button
                type="button"
                onClick={submitDecline}
                disabled={declining}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-danger/40 bg-danger/10 px-5 py-3 text-sm font-semibold text-danger transition hover:bg-danger/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {declining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Declining…
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    Decline suggestion
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}