// src/pages/Dashboard/NutritionPlanBuilder.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useLocation } from "react-router";
import HorizontalScrollBar from "@/components/HorizontalScrollBar";
import { toast } from "react-toastify";
import {
  DragDropProvider,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/react";
import {
  ArrowLeft,
  CalendarDays,
  Flame,
  AlertTriangle,
  Pencil,
  Archive,
  Apple,
  AlertCircle,
  Loader2,
  GripVertical,
  Plus,
  Trash2,
  Edit3,
  Send,
  Utensils,
  Search,
  Clock,
  MonitorSmartphone,
  Shuffle,
  Activity,
  X,
} from "lucide-react";
import {
  getNutritionPlan,
  archiveNutritionPlan,
  publishNutritionPlan,
  deletePlannedMeal,
  updatePlannedMeal,
  updateNutritionPlanDay,
} from "@/services/nutritionPlans";
import { getApiErrorMessage } from "@/lib/api";
import type {
  NutritionPlanTree,
  NutritionPlanDay,
  NutritionPlanMeal,
  NutritionPlanTargets,
} from "@/types/nutritionPlans";
import { formatNutritionFilterLabel, formatNutritionPlanWindow } from "@/hooks/useNutritionPlansData";
import { useMealsData } from "@/hooks/useMealsData";
import type { Meal } from "@/types/nutrition";
import { UpdateNutritionPlanModal } from "@/components/modals/UpdateNutritionPlanModal";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import AddDayMealModal from "@/components/modals/AddDayMealModal";
import CreateMealAndAddToDayModal from "@/components/modals/CreateMealAndAddToDayModal";
import EditNutritionPlanDayModal from "@/components/modals/EditNutritionPlanDayModal";
import EditPlannedMealModal from "@/components/modals/EditPlannedMealModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Publish Validation Error Parser ────────────────────────────────────────────

function getPublishValidationMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;

  const axiosError = error as { response?: { data?: unknown } };
  const data = axiosError.response?.data;
  if (!data || typeof data !== "object") return null;

  const body = data as {
    message?: string;
    errors?: Array<{
      weekNumber?: number;
      dayNumber?: number;
      scheduledDate?: string;
      issues?: Array<{ code?: string; fields?: string[]; message?: string }>;
    }>;
  };

  if (!Array.isArray(body.errors) || body.errors.length === 0) return null;

  const missingMeals: string[] = [];
  const missingTargets: string[] = [];

  for (const entry of body.errors) {
    const label = `W${entry.weekNumber ?? "?"}D${entry.dayNumber ?? "?"}`;
    for (const issue of entry.issues ?? []) {
      if (issue.code === "missing_planned_meal") missingMeals.push(label);
      if (issue.code === "missing_required_targets") missingTargets.push(label);
    }
  }

  if (missingMeals.length === 0 && missingTargets.length === 0) return null;

  const lines: string[] = ["Can't publish — fix the following:"];

  if (missingMeals.length > 0) {
    const summary =
      missingMeals.length <= 5
        ? missingMeals.join(", ")
        : `${missingMeals.slice(0, 5).join(", ")} +${missingMeals.length - 5} more`;
    lines.push(`• ${missingMeals.length} day(s) have no meals (${summary}) — add meals or mark as flexible.`);
  }

  if (missingTargets.length > 0) {
    const summary =
      missingTargets.length <= 5
        ? missingTargets.join(", ")
        : `${missingTargets.slice(0, 5).join(", ")} +${missingTargets.length - 5} more`;
    lines.push(`• ${missingTargets.length} day(s) are missing macro targets (${summary}) — set protein, carbs & fat targets via Configure Day or plan-level targets.`);
  }

  return lines.join("\n");
}

// ─── Time Formatting ─────────────────────────────────────────────────────────────

const formatTo12Hour = (time24: string) => {
  if (!time24) return "";
  const [hoursStr, minutesStr = "00"] = time24.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

// ─── DnD & Component Helper Types ───────────────────────────────────────────────

function getOverlayMeal(data: unknown): Meal | null {
  if (!data || typeof data !== "object") return null;
  const item = data as Record<string, unknown>;
  if (item.kind === "library-meal" && item.meal) {
    return item.meal as Meal;
  }
  return null;
}

function getOverlayDisplayMeal(data: unknown): { name: string; slot?: string } | null {
  if (!data || typeof data !== "object") return null;
  const item = data as Record<string, unknown>;

  if (item.kind === "library-meal" && item.meal) {
    const meal = item.meal as Meal;
    return { name: meal.name };
  }

  if (item.kind === "planned-meal" && item.meal) {
    const meal = item.meal as NutritionPlanMeal;
    return { name: meal.mealName, slot: meal.slot ?? undefined };
  }

  return null;
}

// ─── Library Meal Card (Side Menu) ──────────────────────────────────────────────

function LibraryMealCard({ meal }: { meal: Meal }) {
  const { ref: dragRef, isDragging } = useDraggable({
    id: `library-meal-${meal.id}`,
    data: { kind: "library-meal" as const, meal },
  });

  return (
    <div
      className={`group flex items-center gap-2 rounded-2xl border bg-card p-3 shadow-xs transition hover:border-success/40 ${isDragging ? "border-brand bg-brand/5 opacity-40" : "border-border"
        }`}
    >
      <button
        ref={dragRef}
        type="button"
        className="shrink-0 cursor-grab touch-none p-1 text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
        aria-label={`Drag ${meal.name}`}
      >
        <GripVertical className="size-4" />
      </button>

      <div className="min-w-0 flex-1 select-none">
        <p className="font-semibold text-xs text-foreground truncate">{meal.name}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {meal.ingredientCount || meal.ingredients?.length || 0} items · {meal.totals?.calories || 0} kcal
        </p>
      </div>
    </div>
  );
}

// ─── Planned Meal Card (Inside Day) ─────────────────────────────────────────────

function PlannedMealCard({
  meal,
  dayId,
  onEdit,
  onDelete,
}: {
  meal: NutritionPlanMeal;
  dayId: string;
  onEdit: (meal: NutritionPlanMeal) => void;
  onDelete: (meal: NutritionPlanMeal) => void;
}) {
  const { ref: dragRef, isDragging } = useDraggable({
    id: `planned-meal-${meal.id}`,
    data: { kind: "planned-meal" as const, meal, dayId },
  });
  const { ref: dropRef, isDropTarget } = useDroppable({
    id: `planned-meal-target-${meal.id}`,
    data: { kind: "planned-meal" as const, meal, dayId },
  });

  return (
    <div
      ref={dropRef}
      className={`flex flex-col gap-2 rounded-2xl border p-3 bg-card shadow-xs transition ${isDragging
        ? "border-brand opacity-50"
        : isDropTarget
          ? "border-brand bg-brand/5"
          : "border-border/80 hover:border-border"
        }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            ref={dragRef}
            type="button"
            className="cursor-grab touch-none p-1 text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="size-3.5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                {meal.slot || "Meal"}
              </span>
              {meal.suggestedTime && (
                <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatTo12Hour(meal.suggestedTime)}
                </span>
              )}
            </div>
            <h4 className="mt-1 text-xs font-bold text-foreground truncate">{meal.mealName}</h4>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(meal)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            aria-label={`Edit ${meal.mealName}`}
          >
            <Edit3 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(meal)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
            aria-label={`Delete ${meal.mealName}`}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Foods summary */}
      {meal.foods && meal.foods.length > 0 && (
        <div className="mt-1 space-y-1 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
          {meal.foods.map((food) => (
            <div key={food.id} className="flex items-center justify-between gap-1">
              <span className="truncate">• {food.foodName}</span>
              <span className="font-semibold text-foreground/90 shrink-0">
                {food.amount}{food.servingUnit}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Meal totals */}
      {meal.totals && (
        <div className="mt-1 pt-1.5 flex items-center justify-between text-[11px] font-bold text-muted-foreground border-t border-border/30">
          <span className="text-brand">{meal.totals.calories} kcal</span>
          <span>P: {meal.totals.proteinG}g</span>
          <span>C: {meal.totals.carbsG}g</span>
          <span>F: {meal.totals.fatG}g</span>
        </div>
      )}

      {meal.coachNotes && (
        <p className="mt-1 text-[11px] italic text-muted-foreground/80 bg-muted/30 p-1.5 rounded-lg">
          "{meal.coachNotes}"
        </p>
      )}
    </div>
  );
}

// ─── Reorder helper ──────────────────────────────────────────────────────────────

function reorderPlannedMeals(
  meals: NutritionPlanMeal[],
  draggedId: string,
  targetId: string,
): NutritionPlanMeal[] {
  const ordered = meals.slice().sort((a, b) => (a.position || 0) - (b.position || 0));
  const fromIndex = ordered.findIndex((m) => m.id === draggedId);
  const toIndex = ordered.findIndex((m) => m.id === targetId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return ordered;
  const [moved] = ordered.splice(fromIndex, 1);
  ordered.splice(toIndex, 0, moved);
  return ordered.map((m, i) => ({ ...m, position: i + 1 }));
}

// ─── Day Card Component ─────────────────────────────────────────────────────────

function DayCard({
  day,
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
  const targetCalories = effectiveTargets.calories || 0;
  const prescribedCalories = prescribedTotals.calories || 0;
  // const calorieDiff = prescribedCalories - targetCalories;
  const calorieDiff = Number((prescribedCalories - targetCalories).toFixed(2));
  const isExceedingCalories = targetCalories > 0 && prescribedCalories > targetCalories;

  return (
    <section
      ref={dropRef}
      className={`flex h-200 w-84 shrink-0 flex-col overflow-hidden rounded-3xl border p-4 shadow-xs transition ${isDropTarget ? "border-brand bg-brand/5" : "border-border bg-card"
        }`}
    >
      {/* Day Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
          <div className="p-2 rounded-xl bg-background/80 border border-border/50">
            <span className="block text-[9px] font-semibold text-muted-foreground uppercase">Target</span>
            <span className="mt-0.5 block font-extrabold text-foreground">
              {targetCalories ? `${targetCalories}` : "—"}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-background/80 border border-border/50">
            <span className="block text-[9px] font-semibold text-muted-foreground uppercase">Prescribed</span>
            <span className="mt-0.5 block font-extrabold text-warn">
              {prescribedCalories}
            </span>
          </div>

          <div
            className={`p-2 rounded-xl border ${isExceedingCalories
              ? "bg-warn/20 border-warn/30 text-warn"
              : calorieDiff < 0
                ? "bg-info/10 border-info/20 text-info"
                : "bg-success/10 border-success/20 text-success"
              }`}
          >
            <span className="block text-[9px] font-semibold uppercase opacity-80">Difference</span>
            <span className="mt-0.5 block font-black">
              {calorieDiff > 0 ? `+${calorieDiff}` : calorieDiff} kcal
            </span>
          </div>
        </div>

        {/* Macros Breakdown */}
        <div className="mt-2.5 pt-2 border-t border-border/40 grid grid-cols-3 gap-1 text-[11px] text-center font-medium text-muted-foreground">
          <span>P: {prescribedTotals.proteinG}g / {effectiveTargets.proteinG ?? "—"}g</span>
          <span>C: {prescribedTotals.carbsG}g / {effectiveTargets.carbsG ?? "—"}g</span>
          <span>F: {prescribedTotals.fatG}g / {effectiveTargets.fatG ?? "—"}g</span>
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

// ─── Main NutritionPlanBuilder Page Component ───────────────────────────────────

export default function NutritionPlanBuilder() {
  const daysScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const { planId } = useParams<{ planId: string }>();
  const location = useLocation();
  const stateClientName = (location.state as { clientName?: string } | null)?.clientName;

  const [tree, setTree] = useState<NutritionPlanTree | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeekId, setSelectedWeekId] = useState<string>("");
  const [reorderingDayId, setReorderingDayId] = useState<string | null>(null);

  // Mobile detection — same pattern as PlanBuilder
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 1024px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Side-drawer slot filter (client-side label matching)
  const [slotFilter, setSlotFilter] = useState<string>("");

  // Modals & Target States
  const [isEditMetadataOpen, setIsEditMetadataOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Publish Dialog State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Builder Action Modals
  const [pendingDropMeal, setPendingDropMeal] = useState<{
    meal: Meal;
    dayId: string;
    dayLabel: string;
    defaultPosition: number;
  } | null>(null);

  const [createMealTarget, setCreateMealTarget] = useState<{
    dayId: string;
    dayLabel: string;
    defaultPosition: number;
  } | null>(null);

  const [dayToEdit, setDayToEdit] = useState<NutritionPlanDay | null>(null);
  const [mealToEdit, setMealToEdit] = useState<NutritionPlanMeal | null>(null);
  const [mealToDelete, setMealToDelete] = useState<NutritionPlanMeal | null>(null);

  // Meals library side-menu hook
  const { filteredMeals, loading: mealsLoading, filters: mealFilters, handleFiltersChange } = useMealsData();

  // Slot label chips shown in the sidebar (client-side filter by meal name keywords)
  const SLOT_CHIPS = [
    { label: "Breakfast", keywords: ["breakfast", "oats", "egg", "toast", "morning"] },
    { label: "Lunch", keywords: ["lunch", "chicken", "rice", "bowl", "wrap"] },
    { label: "Dinner", keywords: ["dinner", "beef", "salmon", "potato", "steak"] },
    { label: "Snack", keywords: ["snack", "yogurt", "bar", "nut", "fruit"] },
    { label: "Pre-WO", keywords: ["pre", "workout", "shake", "banana", "energy"] },
    { label: "Post-WO", keywords: ["post", "recovery", "protein", "whey"] },
  ] as const;

  const displayedMeals = useMemo(() => {
    if (!slotFilter) return filteredMeals;
    const chip = SLOT_CHIPS.find((c) => c.label === slotFilter);
    if (!chip) return filteredMeals;
    return filteredMeals.filter((m) =>
      chip.keywords.some((kw) =>
        m.name.toLowerCase().includes(kw) ||
        (m.description ?? "").toLowerCase().includes(kw),
      ),
    );
  }, [filteredMeals, slotFilter]);

  const fetchTree = async () => {
    if (!planId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNutritionPlan(planId);
      setTree(data);
      if (data.weeks?.length > 0) {
        setSelectedWeekId((curr) => (curr && data.weeks.some((w) => w.id === curr) ? curr : data.weeks[0].id));
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to load nutrition plan builder.");
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, [planId]);

  // ─── Local tree updaters (avoid full re-fetch for meal-level changes) ──────

  const localAddMealToDay = (dayId: string, plannedMeal: NutritionPlanMeal) => {
    setTree((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weeks: prev.weeks.map((week) => ({
          ...week,
          days: week.days.map((day) =>
            day.id === dayId
              ? {
                ...day,
                meals: [...(day.meals || []), plannedMeal].sort(
                  (a, b) => (a.position || 0) - (b.position || 0),
                ),
              }
              : day,
          ),
        })),
      };
    });
  };

  const localUpdateMeal = (updatedMeal: NutritionPlanMeal) => {
    setTree((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weeks: prev.weeks.map((week) => ({
          ...week,
          days: week.days.map((day) => ({
            ...day,
            meals: (day.meals || []).map((m) =>
              m.id === updatedMeal.id ? updatedMeal : m,
            ),
          })),
        })),
      };
    });
  };

  const localDeleteMeal = (mealId: string) => {
    setTree((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weeks: prev.weeks.map((week) => ({
          ...week,
          days: week.days.map((day) => ({
            ...day,
            meals: (day.meals || []).filter((m) => m.id !== mealId),
          })),
        })),
      };
    });
  };

  const localUpdateDay = (updatedDay: NutritionPlanDay) => {
    setTree((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weeks: prev.weeks.map((week) => ({
          ...week,
          days: week.days.map((day) =>
            day.id === updatedDay.id ? updatedDay : day,
          ),
        })),
      };
    });
  };

  const activeWeek = useMemo(() => {
    if (!tree?.weeks?.length) return null;
    return tree.weeks.find((w) => w.id === selectedWeekId) || tree.weeks[0];
  }, [tree, selectedWeekId]);

  // ─── DnD Event Handlers ─────────────────────────────────────────────────────

  const handleDragEnd = (event: any) => {
    if (event.canceled) return;
    const { source, target } = event.operation;
    if (!source || !target) return;

    const sourceData = source.data as Record<string, unknown>;
    const targetData = target.data as Record<string, unknown>;

    // ── Case 1: Library meal → day drop ────────────────────────────────────────
    const overlayMeal = getOverlayMeal(sourceData);
    if (overlayMeal) {
      if (targetData?.kind === "day" && targetData.dayId) {
        const targetDay = activeWeek?.days.find((d) => d.id === targetData.dayId);
        if (targetDay) {
          setPendingDropMeal({
            meal: overlayMeal,
            dayId: targetDay.id,
            dayLabel: `Day ${targetDay.dayNumber} (${targetDay.scheduledDate})`,
            defaultPosition: (targetDay.meals?.length || 0) + 1,
          });
        }
      }
      return;
    }

    // ── Case 2: Planned meal → planned meal (same-day reorder) ─────────────────
    if (
      sourceData?.kind === "planned-meal" &&
      targetData?.kind === "planned-meal"
    ) {
      const draggedMeal = sourceData.meal as NutritionPlanMeal;
      const targetMeal = targetData.meal as NutritionPlanMeal;
      const draggedDayId = sourceData.dayId as string;
      const targetDayId = targetData.dayId as string;

      if (!draggedMeal || !targetMeal || draggedMeal.id === targetMeal.id) return;
      // Only handle same-day reordering
      if (draggedDayId !== targetDayId) return;

      const currentDay = activeWeek?.days.find((d) => d.id === draggedDayId);
      if (!currentDay || !currentDay.meals) return;

      const reordered = reorderPlannedMeals(currentDay.meals, draggedMeal.id, targetMeal.id);
      const newPosition = reordered.find((m) => m.id === draggedMeal.id)?.position ?? 1;

      // Snapshot for rollback
      const snapshot = currentDay.meals.slice();

      // Optimistic update
      setTree((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          weeks: prev.weeks.map((week) => ({
            ...week,
            days: week.days.map((day) =>
              day.id === draggedDayId
                ? { ...day, meals: reordered }
                : day,
            ),
          })),
        };
      });

      setReorderingDayId(draggedDayId);
      void (async () => {
        try {
          await updatePlannedMeal(tree!.id, draggedMeal.id, { position: newPosition });
        } catch (err) {
          // Roll back
          setTree((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              weeks: prev.weeks.map((week) => ({
                ...week,
                days: week.days.map((day) =>
                  day.id === draggedDayId ? { ...day, meals: snapshot } : day,
                ),
              })),
            };
          });
          toast.error(getApiErrorMessage(err, "Could not reorder this meal."));
        } finally {
          setReorderingDayId(null);
        }
      })();
    }
  };

  // ─── Action Handlers ────────────────────────────────────────────────────────

  const handlePublishConfirm = async () => {
    if (!tree) return;
    setIsPublishing(true);
    try {
      await publishNutritionPlan(tree.id);
      toast.success("Nutrition plan published successfully.");
      setIsPublishModalOpen(false);
      await fetchTree();
    } catch (err) {
      const validationMessage = getPublishValidationMessage(err);
      toast.error(validationMessage ?? getApiErrorMessage(err, "Could not publish plan. Every day must contain valid food prescriptions."), {
        autoClose: validationMessage ? 8000 : 5000,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!tree) return;
    setIsArchiving(true);
    try {
      await archiveNutritionPlan(tree.id);
      toast.success("Nutrition plan archived.");
      setIsArchiveModalOpen(false);
      await fetchTree();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not archive plan."));
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDeletePlannedMealConfirm = async () => {
    if (!tree || !mealToDelete) return;
    const deletedMeal = mealToDelete;
    try {
      await deletePlannedMeal(tree.id, deletedMeal.id);
      toast.success("Planned meal removed.");
      setMealToDelete(null);
      localDeleteMeal(deletedMeal.id);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete planned meal."));
    }
  };

  const handleToggleFlexibleDay = async (day: NutritionPlanDay) => {
    if (!tree) return;
    const next = !day.isFlexibleDay;
    // Optimistic update
    localUpdateDay({ ...day, isFlexibleDay: next });
    try {
      const updated = await updateNutritionPlanDay(tree.id, day.id, { isFlexibleDay: next });
      localUpdateDay(updated);
    } catch (err) {
      // Roll back
      localUpdateDay(day);
      toast.error(getApiErrorMessage(err, "Could not update flexible day status."));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-sm font-medium text-muted-foreground">Loading nutrition plan builder…</p>
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="p-6 text-center rounded-3xl border border-border bg-card">
        <AlertCircle className="w-8 h-8 mx-auto text-destructive" />
        <h2 className="mt-3 text-xl font-bold text-foreground">Could not load nutrition plan</h2>
        <p className="mt-1 text-sm text-muted-foreground">{error || "Plan not found."}</p>
        <Link
          to="/dashboard/nutrition-plans"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-semibold border rounded-2xl border-border hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Nutrition Plans
        </Link>
      </div>
    );
  }

  // ── Mobile guard ──────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand/10 text-brand">
          <MonitorSmartphone className="size-8" />
        </div>
        <div className="max-w-xs">
          <h2 className="text-xl font-black tracking-tight text-foreground">
            Best on a larger screen
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The Nutrition Plan Builder uses an advanced drag-and-drop meal editor designed for
            precision. For the best experience, open it on a tablet or desktop.
          </p>
        </div>
        <Link
          to="/dashboard/nutrition-plans"
          className="inline-flex items-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          ← Back to plans
        </Link>
      </div>
    );
  }

  const clientName =
    stateClientName ||
    (tree.membership?.client
      ? `${tree.membership.client.firstName || ""} ${tree.membership.client.lastName || ""}`.trim() ||
      tree.membership.client.email
      : "Client");

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard/nutrition-plans"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Nutrition Plans
          </Link>
        </div>

        {/* Header Banner */}
        <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-brand/10 text-brand">
                  {tree.status}
                </span>
                {tree.schedulePhase && (
                  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-success/10 text-success">
                    {tree.schedulePhase}
                  </span>
                )}
                {tree.isArchived && (
                  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-muted text-muted-foreground">
                    Archived
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-3xl font-black text-foreground">{tree.name}</h1>
              <p className="mt-1 text-sm font-medium text-muted-foreground">Client: {clientName}</p>
              {tree.description && <p className="mt-2 text-sm text-foreground/80 max-w-3xl">{tree.description}</p>}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Link
                to={`/dashboard/nutrition-plans/${planId}/logs`}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border rounded-2xl border-border hover:bg-muted transition"
              >
                <Activity className="w-4 h-4" /> View Logs
              </Link>
              {tree.status === "draft" && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsPublishModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-brand text-brand-foreground rounded-2xl hover:opacity-95 transition shadow-sm"
                  >
                    <Send className="w-4 h-4" /> Publish Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditMetadataOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border rounded-2xl border-border hover:bg-muted transition"
                  >
                    <Pencil className="w-4 h-4" /> Edit Metadata
                  </button>
                </>
              )}
              {!tree.isArchived && (
                <button
                  type="button"
                  onClick={() => setIsArchiveModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border rounded-2xl border-border hover:bg-muted transition"
                >
                  <Archive className="w-4 h-4" /> Archive
                </button>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid gap-4 pt-4 border-t border-border/60 sm:grid-cols-3 text-xs">
            <div>
              <span className="font-semibold uppercase tracking-wider text-muted-foreground">Goal</span>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {tree.goal ? formatNutritionFilterLabel(tree.goal) : "General Health"}
              </p>
            </div>
            <div>
              <span className="font-semibold uppercase tracking-wider text-muted-foreground">Duration</span>
              <p className="mt-0.5 text-sm font-medium text-foreground">{tree.durationWeeks} Weeks</p>
            </div>
            <div>
              <span className="font-semibold uppercase tracking-wider text-muted-foreground">Date Window</span>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {formatNutritionPlanWindow(tree.startDate, tree.endDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Target Macros Card */}
        {tree.targets && (
          <div className="p-6 rounded-3xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-brand" />
              <h2 className="text-lg font-bold text-foreground">Daily Nutritional Targets</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Calories</span>
                <p className="mt-1 text-lg font-black text-brand">{tree.targets.calories ?? "—"} kcal</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Protein</span>
                <p className="mt-1 text-lg font-black text-foreground">{tree.targets.proteinG ?? "—"}g</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Carbs</span>
                <p className="mt-1 text-lg font-black text-foreground">{tree.targets.carbsG ?? "—"}g</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Fat</span>
                <p className="mt-1 text-lg font-black text-foreground">{tree.targets.fatG ?? "—"}g</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Fiber</span>
                <p className="mt-1 text-lg font-black text-foreground">{tree.targets.fiberG ?? "—"}g</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Water</span>
                <p className="mt-1 text-lg font-black text-info">{tree.targets.waterMl ?? "—"} ml</p>
              </div>
            </div>
          </div>
        )}

        {/* Client Dietary Profile & Warnings */}
        {(tree.clientDietaryProfile || (tree.warnings && tree.warnings.length > 0)) && (
          <div className="grid gap-4 md:grid-cols-2">
            {tree.clientDietaryProfile && (
              <div className="p-5 rounded-3xl border border-border bg-card">
                <h3 className="text-sm font-bold text-foreground mb-2">Client Dietary Profile</h3>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">Preferences:</span>{" "}
                    {tree.clientDietaryProfile.dietaryPreferences?.join(", ") || "None declared"}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Allergies:</span>{" "}
                    {tree.clientDietaryProfile.allergies?.join(", ") || "None declared"}
                  </p>
                </div>
              </div>
            )}

            {tree.warnings && tree.warnings.length > 0 && (
              <div className="p-5 rounded-3xl border border-warn/20 bg-chip-yellow/30">
                <div className="flex items-center gap-2 text-warn mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <h3 className="text-sm font-bold">Dietary Advisory Warnings</h3>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground h-16 overflow-y-auto overscroll-contain">
                  {tree.warnings.map((w, idx) => (
                    <li key={idx}>• {w.message}</li>
                  ))}
                </ul>
              </div>
            )}


          </div>
        )}

        {/* Main Builder Area: Meals Side Drawer + 7 Day Schedule Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 items-start">
          {/* Side Drawer: Meals Library — wider at lg:col-span-2 */}
          <aside className="lg:col-span-2 p-5 rounded-3xl border border-border bg-card shadow-sm space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Utensils className="w-4 h-4 text-brand" /> Meals Library
              </h3>
              <span className="text-xs font-semibold text-muted-foreground">
                {displayedMeals.length} meal{displayedMeals.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search meals..."
                value={mealFilters.search}
                onChange={(e) => handleFiltersChange({ search: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl bg-background border-border outline-none focus:border-brand"
              />
            </div>

            {/* Dietary Tag Filter */}
            <div>
              <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Dietary Tag
              </label>
              <select
                value={mealFilters.dietaryTag}
                onChange={(e) => handleFiltersChange({ dietaryTag: e.target.value as any })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-brand"
              >
                <option value="">All tags</option>
                <option value="halal">Halal</option>
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="gluten_free">Gluten-Free</option>
                <option value="keto">Keto</option>
                <option value="low_carb">Low Carb</option>
              </select>
            </div>

            {/* Slot / Category chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Meal Category
                </span>
                {slotFilter && (
                  <button
                    type="button"
                    onClick={() => setSlotFilter("")}
                    className="flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["Breakfast", "Lunch", "Dinner", "Snack", "Pre-WO", "Post-WO"] as const).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSlotFilter((prev) => (prev === label ? "" : label))}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${slotFilter === label
                      ? "bg-brand text-brand-foreground shadow-sm"
                      : "bg-muted/60 border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Meals List */}
            <div className="space-y-2 max-h-[40rem] overflow-y-auto pr-1">
              {mealsLoading ? (
                <div className="flex items-center justify-center p-6 text-xs text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading meals…
                </div>
              ) : displayedMeals.length > 0 ? (
                displayedMeals.map((meal) => <LibraryMealCard key={meal.id} meal={meal} />)
              ) : (
                <p className="text-xs text-center text-muted-foreground p-4">No meals found.</p>
              )}
            </div>
          </aside>

          {/* 7 Days Schedule Area */}
          <main className="lg:col-span-5 space-y-4">
            {/* Week Selector — matches Exercise Plan Builder */}
            {tree.weeks && tree.weeks.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card px-4 py-3 shadow-(--shadow-card)">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Weeks
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose the week you want to edit.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {activeWeek && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      {activeWeek.days?.length || 0} days
                    </div>
                  )}
                  <Select
                    value={selectedWeekId}
                    onValueChange={setSelectedWeekId}
                    disabled={!tree.weeks.length}
                  >
                    <SelectTrigger className="min-w-44 rounded-2xl border-border bg-background px-4 py-2.5">
                      <SelectValue placeholder="Select week" />
                    </SelectTrigger>
                    <SelectContent>
                      {tree.weeks.map((week) => (
                        <SelectItem key={week.id} value={week.id}>
                          Week {week.weekNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* 7 Day Cards Row / Scrollable */}
            {activeWeek ? (
              <div className="space-y-3">
                <HorizontalScrollBar scrollContainerRef={daysScrollContainerRef} />
                <div ref={daysScrollContainerRef} className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {activeWeek.days && activeWeek.days.length > 0 ? (
                    activeWeek.days.map((day) => (
                      <DayCard
                        key={day.id}
                        day={day}
                        planId={tree.id}
                        planTargets={tree.targets}
                        onEditDay={(d) => setDayToEdit(d)}
                        onCreateMeal={(d) =>
                          setCreateMealTarget({
                            dayId: d.id,
                            dayLabel: `Day ${d.dayNumber} (${d.scheduledDate})`,
                            defaultPosition: (d.meals?.length || 0) + 1,
                          })
                        }
                        onEditMeal={(m) => setMealToEdit(m)}
                        onDeleteMeal={(m) => setMealToDelete(m)}
                        onToggleFlexible={handleToggleFlexibleDay}
                        isReordering={reorderingDayId === day.id}
                      />
                    ))
                  ) : (
                    <div className="p-8 text-center rounded-3xl border border-border bg-card w-full">
                      <p className="text-xs text-muted-foreground">No days configured for this week.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-3xl border border-border bg-card">
                <Apple className="w-8 h-8 mx-auto text-muted-foreground/60" />
                <p className="mt-2 text-sm text-muted-foreground">No weeks generated for this plan draft.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Drag Overlay for Feedback */}
      <DragOverlay>
        {(source) => {
          const meal = getOverlayDisplayMeal(source.data);
          if (!meal) return null;
          return (
            <div className="flex items-center gap-2 rounded-2xl border border-brand bg-card p-3 shadow-xl opacity-90 cursor-grabbing">
              <GripVertical className="size-4 text-brand shrink-0" />
              <div className="min-w-0">
                {meal.slot && (
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-success">
                    {meal.slot}
                  </span>
                )}
                <p className="font-semibold text-xs text-foreground truncate">{meal.name}</p>
              </div>
            </div>
          );
        }}
      </DragOverlay>

      {/* Edit Plan Metadata Modal */}
      {tree && (
        <UpdateNutritionPlanModal
          open={isEditMetadataOpen}
          plan={tree}
          onClose={() => setIsEditMetadataOpen(false)}
          onUpdated={fetchTree}
        />
      )}

      {/* Add Day Meal Modal (From Drag or Add) */}
      {pendingDropMeal && (
        <AddDayMealModal
          open={pendingDropMeal !== null}
          planId={tree.id}
          dayId={pendingDropMeal.dayId}
          dayLabel={pendingDropMeal.dayLabel}
          meal={pendingDropMeal.meal}
          defaultPosition={pendingDropMeal.defaultPosition}
          onClose={() => setPendingDropMeal(null)}
          onAdded={(plannedMeal) => {
            if (pendingDropMeal) localAddMealToDay(pendingDropMeal.dayId, plannedMeal);
            setPendingDropMeal(null);
          }}
        />
      )}

      {/* Create Library Meal & Add To Day Modal */}
      {createMealTarget && (
        <CreateMealAndAddToDayModal
          open={createMealTarget !== null}
          planId={tree.id}
          dayId={createMealTarget.dayId}
          dayLabel={createMealTarget.dayLabel}
          defaultPosition={createMealTarget.defaultPosition}
          onClose={() => setCreateMealTarget(null)}
          onCreated={({ plannedMeal }) => {
            if (createMealTarget) localAddMealToDay(createMealTarget.dayId, plannedMeal);
            setCreateMealTarget(null);
          }}
        />
      )}

      {/* Edit Nutrition Day Modal */}
      {dayToEdit && (
        <EditNutritionPlanDayModal
          open={dayToEdit !== null}
          planId={tree.id}
          day={dayToEdit}
          onClose={() => setDayToEdit(null)}
          onUpdated={(updatedDay) => {
            localUpdateDay(updatedDay);
            setDayToEdit(null);
          }}
        />
      )}

      {/* Edit Planned Meal Modal */}
      {mealToEdit && (
        <EditPlannedMealModal
          open={mealToEdit !== null}
          planId={tree.id}
          plannedMeal={mealToEdit}
          onClose={() => setMealToEdit(null)}
          onUpdated={(updatedMeal) => {
            localUpdateMeal(updatedMeal);
            setMealToEdit(null);
          }}
        />
      )}

      {/* Confirm Delete Planned Meal Dialog */}
      <ConfirmDialog
        open={mealToDelete !== null}
        title="Remove planned meal?"
        description={
          mealToDelete
            ? `"${mealToDelete.mealName}" will be removed from this day. The reusable meal in your library will not be deleted.`
            : ""
        }
        confirmLabel="Remove meal"
        cancelLabel="Cancel"
        pendingLabel="Removing…"
        isConfirming={false}
        onConfirm={handleDeletePlannedMealConfirm}
        onCancel={() => setMealToDelete(null)}
      />

      {/* Confirm Publish Plan Dialog */}
      <ConfirmDialog
        open={isPublishModalOpen}
        title="Publish this nutrition plan?"
        description={
          tree
            ? `"${tree.name}" will be published and sent to ${clientName}. Every day must contain valid meals before publishing.`
            : ""
        }
        confirmLabel="Publish plan"
        cancelLabel="Not yet"
        pendingLabel="Publishing…"
        isConfirming={isPublishing}
        onConfirm={handlePublishConfirm}
        onCancel={() => setIsPublishModalOpen(false)}
      />

      {/* Confirm Archive Dialog */}
      <ConfirmDialog
        open={isArchiveModalOpen}
        title="Archive this plan?"
        description={
          tree
            ? `"${tree.name}" will be hidden from the normal coach list. You can restore it anytime.`
            : ""
        }
        confirmLabel="Archive plan"
        cancelLabel="Cancel"
        pendingLabel="Archiving…"
        isConfirming={isArchiving}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setIsArchiveModalOpen(false)}
      />
    </DragDropProvider>
  );
}
