// src/pages/Dashboard/NutritionPlanBuilder.tsx
import { useEffect, useRef, useState } from "react";
import { useParams, Link, useLocation } from "react-router";
import HorizontalScrollBar from "@/components/HorizontalScrollBar";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
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
  Send,
  Activity,
  MonitorSmartphone,
} from "lucide-react";
import { formatNutritionFilterLabel, formatNutritionPlanWindow } from "@/hooks/nutritionPlans/useNutritionPlansData";
import type { NutritionPlanDay, NutritionPlanMeal } from "@/types/nutritionPlans";
import type { Meal } from "@/types/nutrition";
import { UpdateNutritionPlanModal } from "@/components/modals/nutritionPlans/UpdateNutritionPlanModal";
import { ConfirmDialog } from "@/components/modals/common/ConfirmDialog";
import AddDayMealModal from "@/components/modals/nutritionPlans/AddDayMealModal";
import CreateMealAndAddToDayModal from "@/components/modals/nutritionPlans/CreateMealAndAddToDayModal";
import EditNutritionPlanDayModal from "@/components/modals/nutritionPlans/EditNutritionPlanDayModal";
import EditPlannedMealModal from "@/components/modals/nutritionPlans/EditPlannedMealModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DayCard } from "@/components/nutritionPlans/builder/DayCard";
import { MealsLibrarySidebar } from "@/components/nutritionPlans/builder/MealsLibrarySidebar";
import {
  getOverlayDisplayMeal,
  getOverlayMeal,
} from "@/components/nutritionPlans/builder/builder-utils";
import { useNutritionPlanBuilderData } from "@/hooks/nutritionPlans/useNutritionPlanBuilderData";

export default function NutritionPlanBuilder() {
  const daysScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const { planId } = useParams<{ planId: string }>();
  const location = useLocation();
  const stateClientName = (location.state as { clientName?: string } | null)?.clientName;

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

  // Bumped after creating a meal so the (lazily loaded) meals library refetches
  const [libraryVersion, setLibraryVersion] = useState(0);

  // Modals & Target States
  const [isEditMetadataOpen, setIsEditMetadataOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Publish Dialog State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

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

  const {
    tree,
    isLoading,
    error,
    selectedWeekId,
    setSelectedWeekId,
    activeWeek,
    reorderingDayId,
    isPublishing,
    isArchiving,
    fetchTree,
    addMealToDay,
    updateMeal,
    updateDay,
    handlePlannedMealDrag,
    publishPlan,
    archivePlan,
    deletePlannedMeal,
    toggleFlexibleDay,
  } = useNutritionPlanBuilderData(planId);

  const handleDragEnd = (event: any) => {
    if (event.canceled) return;
    const { source, target } = event.operation;
    if (!source || !target) return;

    const sourceData = source.data as Record<string, unknown>;
    const targetData = target.data as Record<string, unknown>;

    // ── Case 1: Library meal → day drop ──────────────────────────────────────
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

    // ── Case 2: Planned meal → planned meal (same-day reorder) ───────────────
    if (
      sourceData?.kind === "planned-meal" &&
      targetData?.kind === "planned-meal"
    ) {
      const draggedMeal = sourceData.meal as NutritionPlanMeal;
      const targetMeal = targetData.meal as NutritionPlanMeal;
      const draggedDayId = sourceData.dayId as string;
      const targetDayId = targetData.dayId as string;

      handlePlannedMealDrag(draggedMeal, targetMeal, draggedDayId, targetDayId);
    }
  };

  const handlePublishConfirm = async () => {
    const ok = await publishPlan();
    if (ok) setIsPublishModalOpen(false);
  };

  const handleArchiveConfirm = async () => {
    const ok = await archivePlan();
    if (ok) setIsArchiveModalOpen(false);
  };

  const handleDeletePlannedMealConfirm = async () => {
    if (!mealToDelete) return;
    const ok = await deletePlannedMeal(mealToDelete);
    if (ok) setMealToDelete(null);
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

  // ── Mobile guard ───────────────────────────────────────────────────────────
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
            <MealsLibrarySidebar refreshVersion={libraryVersion} />
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
                        weekNumber={activeWeek.weekNumber}
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
                        onToggleFlexible={(day) => void toggleFlexibleDay(day)}
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
            if (pendingDropMeal) addMealToDay(pendingDropMeal.dayId, plannedMeal);
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
            if (createMealTarget) addMealToDay(createMealTarget.dayId, plannedMeal);
            setCreateMealTarget(null);
            setLibraryVersion((v) => v + 1);
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
            updateDay(updatedDay);
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
            updateMeal(updatedMeal);
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
        onConfirm={() => void handleDeletePlannedMealConfirm()}
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
        onConfirm={() => void handlePublishConfirm()}
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
        onConfirm={() => void handleArchiveConfirm()}
        onCancel={() => setIsArchiveModalOpen(false)}
      />
    </DragDropProvider>
  );
}