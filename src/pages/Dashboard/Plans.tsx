import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Ban } from "lucide-react";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { CreatePlanModal } from "@/components/modals/CreatePlanModal";
import { ReschedulePlanModal } from "@/components/modals/ReschedulePlanModal";
import { UpdatePlanModal } from "@/components/modals/UpdatePlanModal";
import { PlansFilters } from "@/components/plans/PlansFilters";
import { PlansHeader } from "@/components/plans/PlansHeader";
import { PlansList } from "@/components/plans/PlansList";
import { PlansStats } from "@/components/plans/PlansStats";
import { usePlansData } from "@/hooks/usePlansData";
import {
    archiveClientProgramDraft,
    cancelClientProgram,
    publishClientProgram,
} from "@/services/plans";
import { getApiErrorMessage } from "@/lib/api";
import type { ClientProgramDraft } from "@/types/plans";

function Plans() {
    const navigate = useNavigate();

    // ── Modal / target state ──────────────────────────────────────────────────
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [draftToEdit, setDraftToEdit] = useState<ClientProgramDraft | null>(null);
    const [programToReschedule, setProgramToReschedule] = useState<ClientProgramDraft | null>(null);

    // Confirm-dialog targets
    const [programToPublish, setProgramToPublish] = useState<ClientProgramDraft | null>(null);
    const [programToCancel, setProgramToCancel] = useState<ClientProgramDraft | null>(null);
    const [programToArchive, setProgramToArchive] = useState<ClientProgramDraft | null>(null);

    // Pending flags
    const [isPublishing, setIsPublishing] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);

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
            toast.error(getApiErrorMessage(error, "Could not publish this plan. Please try again."));
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
            toast.error(getApiErrorMessage(error, "Could not cancel this plan. Please try again."));
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

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <div className="flex flex-col gap-6">
                <PlansHeader
                    onCreateClick={() => setIsCreateModalOpen(true)}
                    disabled={isLoading || clients.length === 0}
                />
                <PlansStats
                    total={stats.total}
                    drafts={stats.drafts}
                    canceled={stats.canceled}
                    activeClients={stats.activeClients}
                />
                <PlansFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onResetFilters={resetFilters}
                    onRefresh={() => void refreshData()}
                    isRefreshing={isRefreshing}
                    totalPrograms={stats.total}
                    filteredPrograms={filteredPrograms.length}
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
                />
            </div>

            {/* ── Modals ── */}
            <CreatePlanModal
                open={isCreateModalOpen}
                clients={clients}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={handleCreated}
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
                        ? `"${programToCancel.name}" will be deactivated. The client will no longer see it. This cannot be undone.`
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
        </>
    );
}

export default Plans;
