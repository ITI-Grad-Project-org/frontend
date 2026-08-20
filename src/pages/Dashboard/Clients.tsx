import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CreditCard, UserRoundPlus } from "lucide-react";
import InviteClientModal from "@/components/modals/clients/InviteClientModal";
import { CreatePlanModal } from "@/components/modals/plans/CreatePlanModal";
import { CreateNutritionPlanModal } from "@/components/modals/nutritionPlans/CreateNutritionPlanModal";
import { ConfirmDialog } from "@/components/modals/common/ConfirmDialog";
import { useClientsData } from "@/hooks/clients/useClientsData";

import { ClientsTab } from "@/components/clients/ClientsTab";
import { ClientsCharts } from "@/components/clients/ClientsCharts";
import { InvitationsTab } from "@/components/clients/InvitationsTab";
import { RequestsTab } from "@/components/clients/RequestsTab";
import { BillingUpgradePanel } from "@/components/billing/BillingUpgradePanel";
import { invalidateBillingSummary, useBillingSummary } from "@/hooks/billing/useBilling";

export type TabType = "clients" | "invitations" | "requests";

export default function Clients() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tab = searchParams.get("tab");
    return tab === "invitations" || tab === "requests" ? tab : "clients";
  });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [isCreateNutritionPlanModalOpen, setIsCreateNutritionPlanModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string>("Unknown client");
  const navigate = useNavigate();
  const billing = useBillingSummary();

  const showClientUpgrade = billing.billing?.canAddActiveClient === false;
  const handleClientLimitReached = () => {
    setIsInviteModalOpen(false);
    void billing.refetch();
    window.setTimeout(() => {
      document.getElementById("client-upgrade")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const { clients, invitations, joinRequests, actions } = useClientsData({
    onClientLimitReached: handleClientLimitReached,
  });

  const TABS: { id: TabType; label: string; count?: number }[] = [
    { id: "clients", label: "Active Clients", count: clients.data.length },
    { id: "invitations", label: "Invitations", count: invitations.data.length },
    { id: "requests", label: "Clients Requests", count: joinRequests.data.length },
  ];

  const activeTabClasses = "px-5 py-2.5 text-sm font-bold bg-ink text-ink-foreground rounded-xl transition-all shadow-sm";
  const inactiveTabClasses = "px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted/65 hover:text-foreground rounded-xl transition-all cursor-pointer";

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    if (tab === "clients") next.delete("tab");
    else next.set("tab", tab);
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black font-display text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your active coaching clients and outgoing invitations.
          </p>
        </div>
        <button
          onClick={() => {
            if (showClientUpgrade) {
              document.getElementById("client-upgrade")?.scrollIntoView({ behavior: "smooth", block: "start" });
              return;
            }
            setIsInviteModalOpen(true);
          }}
          disabled={billing.isLoading}
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold bg-brand text-brand-foreground rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm w-full sm:w-auto"
        >
          {showClientUpgrade ? <CreditCard className="w-4 h-4" strokeWidth={2.5} /> : <UserRoundPlus className="w-4 h-4" strokeWidth={2.5} />}
          <span>{showClientUpgrade ? "Upgrade to add clients" : "Invite Client"}</span>
        </button>
      </div>

      {showClientUpgrade ? (
        <div id="client-upgrade" className="mb-8 scroll-mt-6">
          <BillingUpgradePanel reason="client-limit" returnTo="/dashboard/clients" />
        </div>
      ) : null}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-muted/30 border border-border/80 rounded-2xl w-fit mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={activeTab === tab.id ? activeTabClasses : inactiveTabClasses}
          >
            {tab.label} {tab.count !== undefined && tab.count > 0 ? `(${tab.count})` : ""}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === "clients" && (
        <div className="flex flex-col gap-8">
          <ClientsCharts connections={clients.data} />
          <ClientsTab
          data={clients.data}
          loading={clients.loading}
          error={clients.error}
          onRetry={() => clients.refetch()}
          onClientDeleted={() => {
            clients.refetch();
            void invalidateBillingSummary();
          }}
          onCreatePlan={(connection) => {
            setSelectedClientId(connection.id);
            const fullName = `${connection.client.firstName || ""} ${connection.client.lastName || ""}`.trim();
            setSelectedClientName(fullName || connection.client.email || "Unknown client");
            setIsCreatePlanModalOpen(true);
          }}
          onCreateNutritionPlan={(connection) => {
            setSelectedClientId(connection.id);
            const fullName = `${connection.client.firstName || ""} ${connection.client.lastName || ""}`.trim();
            setSelectedClientName(fullName || connection.client.email || "Unknown client");
            setIsCreateNutritionPlanModalOpen(true);
          }}
          onMessageClient={(connection) => {
            navigate(`/dashboard/chat/${connection.client.id}`);
          }}
        />
        </div>
      )}

      {activeTab === "invitations" && (
        <InvitationsTab
          data={invitations.data}
          loading={invitations.loading}
          error={invitations.error}
          onRetry={() => invitations.refetch()}
          onRevoke={(id) => actions.setInvitationToRevoke(id)}
        />
      )}

      {activeTab === "requests" && (
        <RequestsTab
          data={joinRequests.data}
          loading={joinRequests.loading}
          error={joinRequests.error}
          onRetry={() => joinRequests.refetch()}
          onApprove={(id) => actions.setRequestToApprove(id)}
          onReject={(id) => actions.setRequestToReject(id)}
        />
      )}

      {/* Modals & Dialogs */}
      <InviteClientModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => {
          invitations.refetch();
          void invalidateBillingSummary();
          setActiveTab("invitations");
        }}
        onClientLimitReached={handleClientLimitReached}
      />

      <CreatePlanModal
        open={isCreatePlanModalOpen}
        clients={clients.data}
        selectedClientId={selectedClientId}
        onClose={() => {
          setIsCreatePlanModalOpen(false);
          setSelectedClientId(null);
          setSelectedClientName("Unknown client");
        }}
        onCreated={(draft) => {
          navigate(`/dashboard/plans/${draft.id}`, {
            state: {
              clientName: selectedClientName,
            },
          });
        }}
      />

      <CreateNutritionPlanModal
        open={isCreateNutritionPlanModalOpen}
        clients={clients.data}
        selectedClientId={selectedClientId}
        onClose={() => {
          setIsCreateNutritionPlanModalOpen(false);
          setSelectedClientId(null);
          setSelectedClientName("Unknown client");
        }}
        onCreated={(draft) => {
          navigate(`/dashboard/nutrition-plans/${draft.id}`, {
            state: {
              clientName: selectedClientName,
            },
          });
        }}
      />

      <ConfirmDialog
        open={actions.invitationToRevoke !== null}
        title="Revoke Invitation?"
        description="Are you sure you want to revoke this pending invitation? The invite link will no longer be valid."
        confirmLabel="Revoke"
        isConfirming={actions.isRevoking}
        onConfirm={actions.handleRevokeConfirm}
        onCancel={() => actions.setInvitationToRevoke(null)}
      />

      <ConfirmDialog
        open={actions.requestToApprove !== null}
        title="Approve Request?"
        description="Are you sure you want to approve this client request? They will become an active client."
        confirmLabel="Approve"
        isConfirming={actions.isApproving}
        onConfirm={actions.handleApproveConfirm}
        onCancel={() => actions.setRequestToApprove(null)}
      />

      <ConfirmDialog
        open={actions.requestToReject !== null}
        title="Reject Request?"
        description="Are you sure you want to reject this client request?"
        confirmLabel="Reject"
        isConfirming={actions.isRejecting}
        onConfirm={actions.handleRejectConfirm}
        onCancel={() => actions.setRequestToReject(null)}
      />
    </>
  );
}
