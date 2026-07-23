import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { CreatePlanModal } from "@/components/modals/CreatePlanModal";
import { UpdatePlanModal } from "@/components/modals/UpdatePlanModal";
import { PlansFilters } from "@/components/plans/PlansFilters";
import { PlansHeader } from "@/components/plans/PlansHeader";
import { PlansList } from "@/components/plans/PlansList";
import { PlansStats } from "@/components/plans/PlansStats";
import { usePlansData } from "@/hooks/usePlansData";
import { archiveClientProgramDraft } from "@/services/plans";
import { getApiErrorMessage } from "@/lib/api";
import type { ClientProgramDraft } from "@/types/plans";
function Plans() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [draftToEdit, setDraftToEdit] = useState<ClientProgramDraft | null>(null);
    const [draftToDelete, setDraftToDelete] = useState<ClientProgramDraft | null>(null);
    const [isDeletingDraft, setIsDeletingDraft] = useState(false);
    const navigate = useNavigate();
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

    const handleFiltersChange = (next: Partial<typeof filters>) => {
        setFilters((current) => ({ ...current, ...next }));
    };

    const handleCreated = async (draft: ClientProgramDraft) => {
        navigate(`/dashboard/plans/${draft.id}`, {
            state: {
                clientName: clientNameMap.get(draft.membershipId) ?? "Unknown client",
            },
        });
    };

    const handleDraftUpdated = async () => {
        await refreshData();
    };

    const handleDraftDeleted = async () => {
        if (!draftToDelete) {
            return;
        }

        setIsDeletingDraft(true);

        try {
            await archiveClientProgramDraft(draftToDelete.id);
            toast.success("Plan draft archived successfully.");
            setDraftToDelete(null);
            await refreshData();
        } catch (error) {
            toast.error(
                getApiErrorMessage(
                    error,
                    "We could not archive this plan draft. Please try again.",
                ),
            );
        } finally {
            setIsDeletingDraft(false);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-6">
                <PlansHeader onCreateClick={() => setIsCreateModalOpen(true)} disabled={isLoading || clients.length === 0} />
                <PlansStats
                    total={stats.total}
                    drafts={stats.drafts}
                    archived={stats.archived}
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
                    onDeleteDraft={setDraftToDelete}
                />
            </div>

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

            <ConfirmDialog
                open={draftToDelete !== null}
                title="Archive this draft?"
                description="This will remove the draft from normal coach lists. You can publish it later from the draft flow."
                confirmLabel="Archive draft"
                cancelLabel="Cancel"
                pendingLabel="Archiving…"
                isConfirming={isDeletingDraft}
                onConfirm={handleDraftDeleted}
                onCancel={() => setDraftToDelete(null)}
            />
        </>
    );
}

export default Plans;
