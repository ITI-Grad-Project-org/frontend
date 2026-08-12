import { useMemo } from "react";
import { Link } from "react-router";
import { useDroppable } from "@dnd-kit/react";
import {
  Activity,
  AlertTriangle,
  Pencil,
  Plus,
  Shuffle,
  Utensils,
} from "lucide-react";
import type {
  NutritionPlanDay,
  NutritionPlanMeal,
  NutritionPlanTargets,
} from "@/types/nutritionPlans";
import { PlannedMealCard } from "./PlannedMealCard";

export function DayCard({
  day,
  weekNumber,
  planId,
  planTargets,
  onEditDay,
  onCreateMeal,
  onEditMeal,
  onDeleteMeal,
  onToggleFlexible,
  isReordering,
}: {
  day: NutritionPlanDay;
  weekNumber: number;
  planId: string;
  planTargets?: NutritionPlanTargets | null;
  onEditDay: (day: NutritionPlanDay) => void;
  onCreateMeal: (day: NutritionPlanDay) => void;
  onEditMeal: (meal: NutritionPlanMeal) => void;
  onDeleteMeal: (meal: NutritionPlanMeal) => void;
  onToggleFlexible: (day: NutritionPlanDay) => void;
  isReordering: boolean;
}) {
  const { ref: dropRef, isDropTarget } = useDroppable({
    id: `day-${day.id}`,
    data: { kind: "day" as const, dayId: day.id },
  });

  // Calculate effective targets for this day
  const effectiveTargets = useMemo(() => {
    return {
      calories: day.targetOverrides?.calories ?? planTargets?.calories ?? null,
      proteinG: day.targetOverrides?.proteinG ?? planTargets?.proteinG ?? null,
      carbsG: day.targetOverrides?.carbsG ?? planTargets?.carbsG ?? null,
      fatG: day.targetOverrides?.fatG ?? planTargets?.fatG ?? null,
      fiberG: day.targetOverrides?.fiberG ?? planTargets?.fiberG ?? null,
      waterMl: day.targetOverrides?.waterMl ?? planTargets?.waterMl ?? null,
    };
  }, [day.targetOverrides, planTargets]);

  // Compute prescribed totals from planned meals
  const prescribedTotals = useMemo(() => {
    if (day.prescribedTotals) return day.prescribedTotals;
    let calories = 0;
    let proteinG = 0;
    let carbsG = 0;
    let fatG = 0;
    let fiberG = 0;

    (day.meals || []).forEach((m) => {
      if (m.totals) {
        calories += m.totals.calories || 0;
        proteinG += m.totals.proteinG || 0;
        carbsG += m.totals.carbsG || 0;
        fatG += m.totals.fatG || 0;
        fiberG += m.totals.fiberG || 0;
      }
    });

    return { calories, proteinG, carbsG, fatG, fiberG };
  }, [day.meals, day.prescribedTotals]);

  // Calorie target vs prescribed difference
  const targetCalories = Math.round(effectiveTargets.calories || 0);
  const prescribedCalories = Math.round(prescribedTotals.calories || 0);
  const calorieDiff = Math.round(prescribedCalories - targetCalories);
  const isExceedingCalories = targetCalories > 0 && prescribedCalories > targetCalories;

  const formatCalories = (n: number) => n.toLocaleString();

  return (
    <section
      ref={dropRef}
      className={`flex h-200 w-84 shrink-0 flex-col overflow-hidden rounded-3xl border p-4 shadow-xs transition ${isDropTarget ? "border-brand bg-brand/5" : "border-border bg-card"
        }`}
    >
      {/* Day Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Week {weekNumber}
          </span>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Day {day.dayNumber}
          </span>
          <h3 className="text-base font-bold text-foreground">
            {day.scheduledDate}
          </h3>
        </div>

        <span
          className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${day.isFlexibleDay
            ? "bg-violet/10 text-violet border-violet/20"
            : "bg-success/10 text-success border-success/20"
            }`}
        >
          {day.isFlexibleDay ? "Flexible Day" : "Structured"}
        </span>
        <Link
          to={`/dashboard/nutrition-plans/${planId}/days/${day.id}/log`}
          className="ml-1 inline-flex items-center justify-center size-7 rounded-xl border border-border text-muted-foreground hover:border-brand/40 hover:bg-brand/10 hover:text-brand transition"
          title="View day log"
          aria-label={`View log for Day ${day.dayNumber}`}
        >
          <Activity className="size-3.5" />
        </Link>
      </div>

      {/* Quick Action Buttons */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEditDay(day)}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted"
        >
          <Pencil className="w-3.5 h-3.5" /> Configure Day
        </button>
        <button
          type="button"
          onClick={() => onCreateMeal(day)}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted"
        >
          <Plus className="w-3.5 h-3.5 text-brand" /> New Meal
        </button>
        <button
          type="button"
          onClick={() => onToggleFlexible(day)}
          className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-semibold transition ${day.isFlexibleDay
            ? "border-violet/40 bg-violet/10 text-violet hover:bg-violet/20"
            : "border-border bg-background text-muted-foreground hover:border-violet/40 hover:text-violet"
            }`}
          title={day.isFlexibleDay ? "Switch to structured day" : "Mark as flexible day"}
        >
          <Shuffle className="w-3.5 h-3.5" />
          {day.isFlexibleDay ? "Flexible" : "Set Flexible"}
        </button>
      </div>

      {/* Target & Prescribed Variance Info Box (REQ: 3 Info Values: Target, Prescribed, Difference) */}
      <div
        className={`mt-4 p-3.5 rounded-2xl border transition-colors ${isExceedingCalories
          ? "border-warn/40 bg-warn/10"
          : "border-border/60 bg-muted/20"
          }`}
      >
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
            Day Calorie Target & Variance
          </span>
          {isExceedingCalories && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-warn bg-warn/20 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" /> Exceeds Target
            </span>
          )}
        </div>

        {/* 3 Info Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-background/80 border border-border/50 min-w-0">
            <span className="block text-[9px] font-semibold text-muted-foreground uppercase">Target</span>
            <span className="mt-0.5 block font-extrabold text-foreground tabular-nums whitespace-nowrap overflow-hidden text-ellipsis"
              title={formatCalories(targetCalories)}
            >
              {targetCalories ? formatCalories(targetCalories) : "—"}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-background/80 border border-border/50 min-w-0">
            <span className="block text-[9px] font-semibold text-muted-foreground uppercase">Prescribed</span>
            <span className="mt-0.5 block font-extrabold text-warn tabular-nums whitespace-nowrap overflow-hidden text-ellipsis"
              title={formatCalories(prescribedCalories)}
            >
              {formatCalories(prescribedCalories)}
            </span>
          </div>

          <div
            className={`p-2 rounded-xl border min-w-0 ${isExceedingCalories
              ? "bg-warn/20 border-warn/30 text-warn"
              : calorieDiff < 0
                ? "bg-info/10 border-info/20 text-info"
                : "bg-success/10 border-success/20 text-success"
              }`}
          >
            <span className="block text-[9px] font-semibold uppercase opacity-80">Difference</span>
            <span className="mt-0.5 block font-black tabular-nums whitespace-nowrap overflow-hidden text-ellipsis"
              title={`${calorieDiff > 0 ? "+" : ""}${formatCalories(calorieDiff)} kcal`}
            >
              {calorieDiff > 0 ? `+${formatCalories(calorieDiff)}` : formatCalories(calorieDiff)} kcal
            </span>
          </div>
        </div>

        {/* Macros Breakdown */}
        <div className="mt-2.5 pt-2 border-t border-border/40 grid grid-cols-3 gap-1 text-[11px] text-center font-medium text-muted-foreground min-w-0">
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">P: {Math.round(prescribedTotals.proteinG)}g / {effectiveTargets.proteinG ?? "—"}g</span>
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">C: {Math.round(prescribedTotals.carbsG)}g / {effectiveTargets.carbsG ?? "—"}g</span>
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">F: {Math.round(prescribedTotals.fatG)}g / {effectiveTargets.fatG ?? "—"}g</span>
        </div>
      </div>

      {/* Planned Meals Drop Container */}
      <div className="mt-4 relative flex-1 flex flex-col gap-2.5 overflow-y-auto overscroll-y-contain rounded-2xl border border-dashed border-border/70 bg-muted/10 p-2.5">
        {isReordering && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-[2px]">
            <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm border border-border">
              <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Saving order…
            </div>
          </div>
        )}
        {day.meals && day.meals.length > 0 ? (
          day.meals
            .slice()
            .sort((a, b) => (a.position || 0) - (b.position || 0))
            .map((meal) => (
              <PlannedMealCard
                key={meal.id}
                meal={meal}
                dayId={day.id}
                onEdit={onEditMeal}
                onDelete={onDeleteMeal}
              />
            ))
        ) : (
          <div className="m-auto text-center p-4">
            <Utensils className="w-6 h-6 mx-auto text-muted-foreground/50" />
            <p className="mt-2 text-xs text-muted-foreground">
              Drop library meals here
            </p>
          </div>
        )}
      </div>
    </section>
  );
}