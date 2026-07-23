import { useState } from "react";
import { useNavigate } from "react-router";
import { CreatePlanModal } from "@/components/modals/CreatePlanModal";
import { PlansFilters } from "@/components/plans/PlansFilters";
import { PlansHeader } from "@/components/plans/PlansHeader";
import { PlansList } from "@/components/plans/PlansList";
import { PlansStats } from "@/components/plans/PlansStats";
import { usePlansData } from "@/hooks/usePlansData";
import type { ClientProgramDraft } from "@/types/plans";
function Plans() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
                />
            </div>

            <CreatePlanModal
                open={isCreateModalOpen}
                clients={clients}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={handleCreated}
            />
        </>
    );
}

export default Plans;
