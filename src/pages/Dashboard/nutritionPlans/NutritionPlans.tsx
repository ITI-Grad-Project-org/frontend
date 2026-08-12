// src/pages/Dashboard/NutritionPlans.tsx
import { useState } from "react";
import { toast } from "react-toastify";
import { Ban } from "lucide-react";
import { ConfirmDialog } from "@/components/modals/common/ConfirmDialog";
import { CreateNutritionPlanModal } from "@/components/modals/nutritionPlans/CreateNutritionPlanModal";
import { UpdateNutritionPlanModal } from "@/components/modals/nutritionPlans/UpdateNutritionPlanModal";
import { RescheduleNutritionPlanModal } from "@/components/modals/nutritionPlans/RescheduleNutritionPlanModal";
import { NutritionPlansFilters } from "@/components/nutritionPlans/NutritionPlansFilters";
import { NutritionPlansHeader } from "@/components/nutritionPlans/NutritionPlansHeader";
import { NutritionPlansList } from "@/components/nutritionPlans/NutritionPlansList";
import { NutritionPlansStats } from "@/components/nutritionPlans/NutritionPlansStats";
import { useNutritionPlansData } from "@/hooks/nutritionPlans/useNutritionPlansData";
import {
  archiveNutritionPlan,
  cancelNutritionPlan,
  publishNutritionPlan,
  unarchiveNutritionPlan,
} from "@/services/nutritionPlans";
import { getApiErrorMessage } from "@/lib/api";
import type { NutritionPlanSummary } from "@/types/nutritionPlans";

export default function NutritionPlans() {
  // ── Modal / target state ──────────────────────────────────────────────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [draftToEdit, setDraftToEdit] = useState<NutritionPlanSummary | null>(null);
  const [planToReschedule, setPlanToReschedule] = useState<NutritionPlanSummary | null>(null);

  // Confirm-dialog targets
  const [planToPublish, setPlanToPublish] = useState<NutritionPlanSummary | null>(null);
  const [planToCancel, setPlanToCancel] = useState<NutritionPlanSummary | null>(null);
  const [planToArchive, setPlanToArchive] = useState<NutritionPlanSummary | null>(null);
  const [planToUnarchive, setPlanToUnarchive] = useState<NutritionPlanSummary | null>(null);

  // Pending flags
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isUnarchiving, setIsUnarchiving] = useState(false);

  // ── Data hook ─────────────────────────────────────────────────────────────
  const {
    clients,
    filteredPlans,
    stats,
    filters,
    setFilters,
    isLoading,
    loadError,
    isRefreshing,
    refreshData,
    resetFilters,
    clientNameMap,
  } = useNutritionPlansData();

  // ── Filter helpers ────────────────────────────────────────────────────────
  const handleFiltersChange = (next: Partial<typeof filters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreated = async () => {
    await refreshData();
  };

  // ── Edit draft (metadata & targets) ───────────────────────────────────────
  const handleDraftUpdated = async () => {
    await refreshData();
  };

  // ── Publish ───────────────────────────────────────────────────────────────
  const handlePublishConfirm = async () => {
    if (!planToPublish) return;
    setIsPublishing(true);
    try {
      await publishNutritionPlan(planToPublish.id);
      toast.success("Nutrition plan published successfully.");
      setPlanToPublish(null);
      await refreshData();
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 400) {
        toast.error(
          getApiErrorMessage(
            error,
            "Every day must contain valid food prescriptions before publishing.",
          ),
        );
      } else if (status === 409) {
        toast.error(
          getApiErrorMessage(
            error,
            "This plan can't be published — it may already be published or its dates overlap another plan for this client.",
          ),
        );
      } else {
        toast.error(getApiErrorMessage(error, "Could not publish this plan. Please try again."));
      }
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Reschedule ────────────────────────────────────────────────────────────
  const handleRescheduled = async () => {
    await refreshData();
  };

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancelConfirm = async () => {
    if (!planToCancel) return;
    setIsCancelling(true);
    try {
      await cancelNutritionPlan(planToCancel.id);
      toast.success("Nutrition plan cancelled.");
      setPlanToCancel(null);
      await refreshData();
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        toast.error(
          getApiErrorMessage(
            error,
            "Only scheduled or active published client nutrition plans can be cancelled.",
          ),
        );
        setPlanToCancel(null);
        await refreshData();
      } else {
        toast.error(getApiErrorMessage(error, "Could not cancel this plan. Please try again."));
      }
    } finally {
      setIsCancelling(false);
    }
  };

  // ── Archive ───────────────────────────────────────────────────────────────
  const handleArchiveConfirm = async () => {
    if (!planToArchive) return;
    setIsArchiving(true);
    try {
      await archiveNutritionPlan(planToArchive.id);
      toast.success("Nutrition plan archived.");
      setPlanToArchive(null);
      await refreshData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not archive this plan. Please try again."));
    } finally {
      setIsArchiving(false);
    }
  };

  // ── Unarchive ─────────────────────────────────────────────────────────────
  const handleUnarchiveConfirm = async () => {
    if (!planToUnarchive) return;
    setIsUnarchiving(true);
    try {
      await unarchiveNutritionPlan(planToUnarchive.id);
      toast.success("Nutrition plan restored to your coach list.");
      setPlanToUnarchive(null);
      await refreshData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not restore this plan. Please try again."));
    } finally {
      setIsUnarchiving(false);
    }
  };

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.membershipId !== "all" ||
    filters.status !== "all" ||
    filters.goal !== "all" ||
    filters.isArchived ||
    filters.showCancelled;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-col gap-6">
        <NutritionPlansHeader
          onCreateClick={() => setIsCreateModalOpen(true)}
          disabled={isLoading || clients.length === 0}
        />
        <NutritionPlansStats
          total={stats.total}
          drafts={stats.drafts}
          canceled={stats.canceled}
          activeClients={stats.activeClients}
        />
        <NutritionPlansFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onResetFilters={resetFilters}
          onRefresh={() => void refreshData()}
          isRefreshing={isRefreshing}
          totalPlans={stats.total}
          filteredPlans={filteredPlans.length}
          clients={clients}
        />
        <NutritionPlansList
          plans={filteredPlans}
          clientNameMap={clientNameMap}
          loading={isLoading}
          error={loadError}
          hasActiveFilters={hasActiveFilters}
          onEditDraft={setDraftToEdit}
          onPublish={setPlanToPublish}
          onReschedule={setPlanToReschedule}
          onCancel={setPlanToCancel}
          onArchive={setPlanToArchive}
          onUnarchive={setPlanToUnarchive}
          onRetry={() => void refreshData()}
        />
      </div>

      {/* ── Modals ── */}
      <CreateNutritionPlanModal
        open={isCreateModalOpen}
        clients={clients}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreated}
      />

      <UpdateNutritionPlanModal
        open={draftToEdit !== null}
        plan={draftToEdit}
        onClose={() => setDraftToEdit(null)}
        onUpdated={handleDraftUpdated}
      />

      <RescheduleNutritionPlanModal
        open={planToReschedule !== null}
        plan={planToReschedule}
        onClose={() => setPlanToReschedule(null)}
        onRescheduled={handleRescheduled}
      />

      {/* ── Confirm dialogs ── */}
      <ConfirmDialog
        open={planToPublish !== null}
        title="Publish this plan?"
        description={
          planToPublish
            ? `"${planToPublish.name}" will be published and sent to ${clientNameMap.get(planToPublish.membershipId) ?? "the client"}. You can still cancel it afterwards.`
            : ""
        }
        confirmLabel="Publish plan"
        cancelLabel="Not yet"
        pendingLabel="Publishing…"
        isConfirming={isPublishing}
        onConfirm={handlePublishConfirm}
        onCancel={() => setPlanToPublish(null)}
      />

      <ConfirmDialog
        open={planToCancel !== null}
        title="Cancel this plan?"
        description={
          planToCancel
            ? planToCancel.schedulePhase === "active"
              ? `"${planToCancel.name}" is currently active. Cancelling will immediately stop new day logs. This cannot be undone.`
              : `"${planToCancel.name}" will be deactivated and removed from the client's view. This cannot be undone.`
            : ""
        }
        confirmLabel="Cancel plan"
        cancelLabel="Keep plan"
        pendingLabel="Cancelling…"
        isConfirming={isCancelling}
        onConfirm={handleCancelConfirm}
        onCancel={() => setPlanToCancel(null)}
        icon={<Ban className="h-6 w-6" />}
      />

      <ConfirmDialog
        open={planToArchive !== null}
        title="Archive this plan?"
        description={
          planToArchive
            ? `"${planToArchive.name}" will be hidden from the normal coach list. ${planToArchive.status === "published" ? "The client can still see it — cancel it first if you want to remove it from their view." : "You can still find it by filtering for archived plans."}`
            : ""
        }
        confirmLabel="Archive"
        cancelLabel="Cancel"
        pendingLabel="Archiving…"
        isConfirming={isArchiving}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setPlanToArchive(null)}
      />

      <ConfirmDialog
        open={planToUnarchive !== null}
        title="Restore this plan?"
        description={
          planToUnarchive
            ? `"${planToUnarchive.name}" will be restored and visible again in your normal coach list.`
            : ""
        }
        confirmLabel="Restore plan"
        cancelLabel="Cancel"
        pendingLabel="Restoring…"
        isConfirming={isUnarchiving}
        onConfirm={handleUnarchiveConfirm}
        onCancel={() => setPlanToUnarchive(null)}
      />
    </>
  );
}
