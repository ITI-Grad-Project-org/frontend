import { useState } from "react";
import { UserRoundPlus } from "lucide-react";
import InviteClientModal from "@/components/modals/InviteClientModal";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { useClientsData } from "@/hooks/useClientsData";

import { ClientsTab } from "@/components/clients/ClientsTab";
import { InvitationsTab } from "@/components/clients/InvitationsTab";
import { RequestsTab } from "@/components/clients/RequestsTab";

export type TabType = "clients" | "invitations" | "requests";

export default function Clients() {
  const [activeTab, setActiveTab] = useState<TabType>("clients");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const { clients, invitations, actions } = useClientsData();

  const TABS: { id: TabType; label: string; count?: number }[] = [
    { id: "clients", label: "Active Clients", count: clients.data.length },
    { id: "invitations", label: "Invitations", count: invitations.data.length },
    { id: "requests", label: "Client Requests", count: 0 },
  ];

  const activeTabClasses = "px-5 py-2.5 text-sm font-bold bg-ink text-ink-foreground rounded-xl transition-all shadow-sm";
  const inactiveTabClasses = "px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted/65 hover:text-foreground rounded-xl transition-all cursor-pointer";

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
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold bg-brand text-brand-foreground rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm w-full sm:w-auto"
        >
          <UserRoundPlus className="w-4 h-4" strokeWidth={2.5} />
          <span>Invite Client</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-muted/30 border border-border/80 rounded-2xl w-fit mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? activeTabClasses : inactiveTabClasses}
          >
            {tab.label} {tab.count !== undefined ? `(${tab.count})` : ""}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === "clients" && (
        <ClientsTab
          data={clients.data}
          loading={clients.loading}
          error={clients.error}
          onRetry={() => clients.refetch(true)}
        />
      )}

      {activeTab === "invitations" && (
        <InvitationsTab
          data={invitations.data}
          loading={invitations.loading}
          error={invitations.error}
          onRetry={() => invitations.refetch(true)}
          onRevoke={(id) => actions.setInvitationToRevoke(id)}
        />
      )}

      {activeTab === "requests" && <RequestsTab />}

      {/* Modals & Dialogs */}
      <InviteClientModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => {
          invitations.refetch(true);
          setActiveTab("invitations");
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
    </>
  );
}