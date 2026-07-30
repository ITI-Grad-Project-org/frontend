// src/pages/Dashboard/NutritionPlanBuilder.tsx
import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Calendar,
  Flame,
  Droplets,
  AlertTriangle,
  Pencil,
  Archive,
  ChevronDown,
  ChevronUp,
  Apple,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getNutritionPlan, archiveNutritionPlan } from "@/services/nutritionPlans";
import { getApiErrorMessage } from "@/lib/api";
import type { NutritionPlanTree } from "@/types/nutritionPlans";
import { formatNutritionFilterLabel, formatNutritionPlanWindow } from "@/hooks/useNutritionPlansData";
import { UpdateNutritionPlanModal } from "@/components/modals/UpdateNutritionPlanModal";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";

export default function NutritionPlanBuilder() {
  const { planId } = useParams<{ planId: string }>();
  const location = useLocation();
  const stateClientName = (location.state as { clientName?: string } | null)?.clientName;

  const [tree, setTree] = useState<NutritionPlanTree | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Accordion state for weeks
  const [openWeeks, setOpenWeeks] = useState<Record<string, boolean>>({});

  const fetchTree = async () => {
    if (!planId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNutritionPlan(planId);
      setTree(data);
      // Open week 1 by default if available
      if (data.weeks?.length > 0) {
        setOpenWeeks({ [data.weeks[0].id]: true });
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to load nutrition plan details.");
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, [planId]);

  const toggleWeek = (weekId: string) => {
    setOpenWeeks((prev) => ({ ...prev, [weekId]: !prev[weekId] }));
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

  const clientName =
    stateClientName ||
    (tree.membership?.client
      ? `${tree.membership.client.firstName || ""} ${tree.membership.client.lastName || ""}`.trim() ||
        tree.membership.client.email
      : "Client");

  return (
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
                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-600">
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

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {tree.status === "draft" && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border rounded-2xl border-border hover:bg-muted transition"
              >
                <Pencil className="w-4 h-4" /> Edit metadata
              </button>
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
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-foreground">Daily Nutritional Targets</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Calories</span>
              <p className="mt-1 text-lg font-black text-amber-600">{tree.targets.calories ?? "—"} kcal</p>
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
              <p className="mt-1 text-lg font-black text-blue-500">{tree.targets.waterMl ?? "—"} ml</p>
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
            <div className="p-5 rounded-3xl border border-amber-400/30 bg-amber-500/5">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="text-sm font-bold">Dietary Advisory Warnings</h3>
              </div>
              <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
                {tree.warnings.map((w, idx) => (
                  <li key={idx}>• {w.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Weeks & Days Tree */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Plan Schedule ({tree.weeks?.length || 0} Weeks)</h2>
        </div>

        {tree.weeks && tree.weeks.length > 0 ? (
          tree.weeks.map((week) => {
            const isOpen = !!openWeeks[week.id];
            return (
              <div key={week.id} className="rounded-3xl border border-border bg-card overflow-hidden">
                {/* Week Header */}
                <button
                  type="button"
                  onClick={() => toggleWeek(week.id)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-foreground hover:bg-muted/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand/10 text-brand text-sm">
                      W{week.weekNumber}
                    </span>
                    <div>
                      <span className="text-base font-bold">Week {week.weekNumber}</span>
                      <p className="text-xs font-normal text-muted-foreground">
                        {week.days?.length || 0} Dated Days
                      </p>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </button>

                {/* Week Days List */}
                {isOpen && (
                  <div className="p-5 pt-0 border-t border-border/50 space-y-3">
                    {week.days && week.days.length > 0 ? (
                      week.days.map((day) => (
                        <div key={day.id} className="p-4 rounded-2xl border border-border/70 bg-background/50 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                Day {day.dayNumber} · {day.scheduledDate}
                              </p>
                              {day.isFlexibleDay && (
                                <span className="text-xs text-muted-foreground font-medium">Flexible Day</span>
                              )}
                            </div>
                          </div>

                          {/* Prescribed totals */}
                          {day.prescribedTotals && (
                            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                              <span>{day.prescribedTotals.calories} kcal</span>
                              <span>P: {day.prescribedTotals.proteinG}g</span>
                              <span>C: {day.prescribedTotals.carbsG}g</span>
                              <span>F: {day.prescribedTotals.fatG}g</span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground py-2">No days in this week.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center rounded-3xl border border-border bg-card">
            <Apple className="w-8 h-8 mx-auto text-muted-foreground/60" />
            <p className="mt-2 text-sm text-muted-foreground">No weeks generated for this plan draft.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {tree && (
        <UpdateNutritionPlanModal
          open={isEditModalOpen}
          plan={tree}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={fetchTree}
        />
      )}

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
    </div>
  );
}
