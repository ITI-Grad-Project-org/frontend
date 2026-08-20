import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Ban } from "lucide-react";
import { ConfirmDialog } from "@/components/modals/common/ConfirmDialog";
import { AIPlanFlowModal } from "@/components/modals/ai/AIPlanFlowModal";
import { CreatePlanModal } from "@/components/modals/plans/CreatePlanModal";
import { ReschedulePlanModal } from "@/components/modals/plans/ReschedulePlanModal";
import { UpdatePlanModal } from "@/components/modals/plans/UpdatePlanModal";
import { PlansFilters } from "@/components/plans/PlansFilters";
import { PlansHeader } from "@/components/plans/PlansHeader";
import { PlansList } from "@/components/plans/PlansList";
import { PlansStats } from "@/components/plans/PlansStats";
import { PlansCharts } from "@/components/plans/PlansCharts";
import { usePlansData } from "@/hooks/plans/usePlansData";
import {
    archiveClientProgramDraft,
    cancelClientProgram,
    publishClientProgram,
    unarchiveClientProgram,
} from "@/services/plans";
import { getApiErrorMessage } from "@/lib/api";
import type { ClientProgramDraft } from "@/types/plans";
import type { NutritionPlanSummary } from "@/types/nutritionPlans";

function Plans() {
    const navigate = useNavigate();

    // ── Modal / target state ──────────────────────────────────────────────────
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAICreateModalOpen, setIsAICreateModalOpen] = useState(false);
    const [draftToEdit, setDraftToEdit] = useState<ClientProgramDraft | null>(null);
    const [programToReschedule, setProgramToReschedule] = useState<ClientProgramDraft | null>(null);

    // Confirm-dialog targets
    const [programToPublish, setProgramToPublish] = useState<ClientProgramDraft | null>(null);
    const [programToCancel, setProgramToCancel] = useState<ClientProgramDraft | null>(null);
    const [programToArchive, setProgramToArchive] = useState<ClientProgramDraft | null>(null);
    const [programToUnarchive, setProgramToUnarchive] = useState<ClientProgramDraft | null>(null);

    // Pending flags
    const [isPublishing, setIsPublishing] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [isUnarchiving, setIsUnarchiving] = useState(false);

    // ── Data hook ─────────────────────────────────────────────────────────────
    const {
        clients,
        filteredPrograms,
        stats,
        filters,
        setFilters,
        isLoading,
        loadError,
        isRefreshing,
        refreshData,
        resetFilters,
        clientNameMap,
    } = usePlansData();

    // ── Filter helpers ────────────────────────────────────────────────────────
    const handleFiltersChange = (next: Partial<typeof filters>) => {
        setFilters((current) => ({ ...current, ...next }));
    };

    // ── Create ────────────────────────────────────────────────────────────────
    const handleCreated = async (draft: ClientProgramDraft) => {
        navigate(`/dashboard/plans/${draft.id}`, {
            state: {
                clientName: clientNameMap.get(draft.membershipId) ?? "Unknown client",
            },
        });
    };

    const handleAICreated = async (created: ClientProgramDraft | NutritionPlanSummary) => {
        const isTraining = "programType" in created && created.programType === "client";
        if (isTraining) {
            navigate(`/dashboard/plans/${created.id}`, {
                state: {
                    clientName: clientNameMap.get(created.membershipId) ?? "Unknown client",
                },
            });
        } else {
            navigate(`/dashboard/nutrition-plans/${created.id}`, {
                state: {
                    clientName: clientNameMap.get(created.membershipId) ?? "Unknown client",
                },
            });
        }
    };

    // ── Edit draft (metadata only) ────────────────────────────────────────────
    const handleDraftUpdated = async () => {
        await refreshData();
    };

    // ── Publish ───────────────────────────────────────────────────────────────
    const handlePublishConfirm = async () => {
        if (!programToPublish) return;
        setIsPublishing(true);
        try {
            await publishClientProgram(programToPublish.id);
            toast.success("Plan published successfully.");
            setProgramToPublish(null);
            await refreshData();
        } catch (error) {
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (status === 400) {
                toast.error("Some days are missing exercises. Open the plan builder and fill every non-rest day before publishing.");
            } else if (status === 409) {
                toast.error(getApiErrorMessage(error, "This plan can't be published — it may already be published or its dates overlap another plan for this client."));
            } else {
                toast.error(getApiErrorMessage(error, "Could not publish this plan. Please try again."));
            }
        } finally {
            setIsPublishing(false);
        }
    };

    // ── Reschedule (handled inside modal) ────────────────────────────────────
    const handleRescheduled = async () => {
        await refreshData();
    };

    // ── Cancel ────────────────────────────────────────────────────────────────
    const handleCancelConfirm = async () => {
        if (!programToCancel) return;
        setIsCancelling(true);
        try {
            await cancelClientProgram(programToCancel.id);
            toast.success("Plan cancelled.");
            setProgramToCancel(null);
            await refreshData();
        } catch (error) {
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (status === 409) {
                toast.error("This plan is already cancelled.");
                setProgramToCancel(null);
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
        if (!programToArchive) return;
        setIsArchiving(true);
        try {
            await archiveClientProgramDraft(programToArchive.id);
            toast.success("Plan archived.");
            setProgramToArchive(null);
            await refreshData();
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Could not archive this plan. Please try again."));
        } finally {
            setIsArchiving(false);
        }
    };

    // ── Unarchive ─────────────────────────────────────────────────────────────
    const handleUnarchiveConfirm = async () => {
        if (!programToUnarchive) return;
        setIsUnarchiving(true);
        try {
            await unarchiveClientProgram(programToUnarchive.id);
            toast.success("Plan restored to your coach list.");
            setProgramToUnarchive(null);
            await refreshData();
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Could not unarchive this plan. Please try again."));
        } finally {
            setIsUnarchiving(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <div className="flex flex-col gap-6">
                <PlansHeader
                    onCreateClick={() => setIsCreateModalOpen(true)}
                    onAICreateClick={() => setIsAICreateModalOpen(true)}
                    disabled={isLoading || clients.length === 0}
                />
                <PlansStats
                    total={stats.total}
                    drafts={stats.drafts}
                    canceled={stats.canceled}
                    activeClients={stats.activeClients}
                />
                <PlansCharts programs={filteredPrograms} />
                <PlansFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onResetFilters={resetFilters}
                    onRefresh={() => void refreshData()}
                    isRefreshing={isRefreshing}
                    totalPrograms={stats.total}
                    filteredPrograms={filteredPrograms.length}
                    clients={clients}
                />
                <PlansList
                    programs={filteredPrograms}
                    clientNameMap={clientNameMap}
                    loading={isLoading}
                    error={loadError}
                    onEditDraft={setDraftToEdit}
                    onPublish={setProgramToPublish}
                    onReschedule={setProgramToReschedule}
                    onCancel={setProgramToCancel}
                    onArchive={setProgramToArchive}
                    onUnarchive={setProgramToUnarchive}
                />
            </div>

            {/* ── Modals ── */}
            <CreatePlanModal
                open={isCreateModalOpen}
                clients={clients}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={handleCreated}
            />

            <AIPlanFlowModal
                open={isAICreateModalOpen}
                clients={clients}
                defaultKind="training"
                onClose={() => setIsAICreateModalOpen(false)}
                onCreated={handleAICreated}
            />

            <UpdatePlanModal
                open={draftToEdit !== null}
                program={draftToEdit}
                onClose={() => setDraftToEdit(null)}
                onUpdated={handleDraftUpdated}
            />

            <ReschedulePlanModal
                open={programToReschedule !== null}
                program={programToReschedule}
                onClose={() => setProgramToReschedule(null)}
                onRescheduled={handleRescheduled}
            />

            {/* ── Confirm dialogs ── */}
            <ConfirmDialog
                open={programToPublish !== null}
                title="Publish this plan?"
                description={
                    programToPublish
                        ? `"${programToPublish.name}" will be sent to ${clientNameMap.get(programToPublish.membershipId) ?? "the client"}. You can still cancel it afterwards.`
                        : ""
                }
                confirmLabel="Publish plan"
                cancelLabel="Not yet"
                pendingLabel="Publishing…"
                isConfirming={isPublishing}
                onConfirm={handlePublishConfirm}
                onCancel={() => setProgramToPublish(null)}
            />

            <ConfirmDialog
                open={programToCancel !== null}
                title="Cancel this plan?"
                description={
                    programToCancel
                        ? programToCancel.status === "draft"
                            ? `"${programToCancel.name}" is a draft and has never been sent to the client. Cancelling closes it without publishing. This cannot be undone.`
                            : programToCancel.schedulePhase === "active"
                                ? `"${programToCancel.name}" is currently active. Cancelling will immediately remove it from the client's plan, calendar, and day screens. This cannot be undone.`
                                : `"${programToCancel.name}" will be deactivated and removed from the client's view. This cannot be undone.`
                        : ""
                }
                confirmLabel="Cancel plan"
                cancelLabel="Keep plan"
                pendingLabel="Cancelling…"
                isConfirming={isCancelling}
                onConfirm={handleCancelConfirm}
                onCancel={() => setProgramToCancel(null)}
                icon={<Ban className="h-6 w-6" />}
            />

            <ConfirmDialog
                open={programToArchive !== null}
                title="Archive this plan?"
                description={
                    programToArchive
                        ? `"${programToArchive.name}" will be hidden from the normal coach list. ${programToArchive.status === "published" ? "The client can still see it — cancel it first if you want to remove it from their view." : "You can still find it by filtering for archived plans."}`
                        : ""
                }
                confirmLabel="Archive"
                cancelLabel="Cancel"
                pendingLabel="Archiving…"
                isConfirming={isArchiving}
                onConfirm={handleArchiveConfirm}
                onCancel={() => setProgramToArchive(null)}
            />

            <ConfirmDialog
                open={programToUnarchive !== null}
                title="Restore this plan?"
                description={
                    programToUnarchive
                        ? `"${programToUnarchive.name}" will be restored and visible again in your coach list.`
                        : ""
                }
                confirmLabel="Restore plan"
                cancelLabel="Cancel"
                pendingLabel="Restoring…"
                isConfirming={isUnarchiving}
                onConfirm={handleUnarchiveConfirm}
                onCancel={() => setProgramToUnarchive(null)}
            />
        </>
    );
}

export default Plans;
