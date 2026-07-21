import { useEffect, useState } from "react";
import ClientCard from "@/components/ClientCard";
import InviteClientModal from "@/components/InviteClientModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { getClients, getInvitations, deleteInvitation } from "@/services/clients";
import type { ClientConnection, ClientInvitation } from "@/types/client";
import { getApiErrorMessage } from "@/lib/api";
import { RefreshCw, UserRoundPlus, Mail, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import ClientCardSkeleton from "@/components/ClientCardSkeleton";
import InvitationSkeleton from "@/components/InvitationSkeleton";



function Clients() {
  const [activeTab, setActiveTab] = useState<"clients" | "invitations">("clients");

  // Clients states
  const [clients, setClients] = useState<ClientConnection[]>([]);
  const [clientsLoading, setClientsLoading] = useState<boolean>(true);
  const [clientsError, setClientsError] = useState<string>("");

  // Invitations states
  const [invitations, setInvitations] = useState<ClientInvitation[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState<boolean>(false);
  const [invitationsError, setInvitationsError] = useState<string>("");

  // Action states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [invitationToRevoke, setInvitationToRevoke] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);

  const fetchClientsList = async (isActive = true) => {
    setClientsLoading(true);
    setClientsError("");

    try {
      const data = await getClients();

      if (isActive) {
        const validClients = Array.isArray(data)
          ? data.filter((conn) => conn && conn.client)
          : [];

        setClients(validClients);
      }
    } catch (err) {
      if (isActive) {
        setClientsError(
          getApiErrorMessage(err, "Failed to load clients. Please try again.")
        );
      }
    } finally {
      if (isActive) {
        setClientsLoading(false);
      }
    }
  };

  const fetchInvitationsList = async (isActive = true) => {
    setInvitationsLoading(true);
    setInvitationsError("");

    try {
      const data = await getInvitations();

      if (isActive) {
        const validInvites = Array.isArray(data)
          ? [...data].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          : [];

        setInvitations(validInvites);
      }
    } catch (err) {
      if (isActive) {
        setInvitationsError(
          getApiErrorMessage(err, "Failed to load invitations. Please try again.")
        );
      }
    } finally {
      if (isActive) {
        setInvitationsLoading(false);
      }
    }
  };

  useEffect(() => {
    let isActive = true;
    fetchClientsList(isActive);
    fetchInvitationsList(isActive);
    return () => {
      isActive = false;
    };
  }, []);

  const handleRevokeConfirm = async () => {
    if (!invitationToRevoke) return;
    setIsRevoking(true);
    try {
      await deleteInvitation(invitationToRevoke);
      toast.success("Invitation revoked successfully!");
      fetchInvitationsList(true);
    } catch (err) {
      const errMsg = getApiErrorMessage(err, "Failed to revoke invitation. Please try again.");
      toast.error(errMsg);
    } finally {
      setIsRevoking(false);
      setInvitationToRevoke(null);
    }
  };

  const getInviteStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "revoked":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default: // pending
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
  };

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

      {/* Tabs list */}
      <div className="flex items-center gap-2 p-1.5 bg-muted/30 border border-border/80 rounded-2xl w-fit mb-8">
        <button
          onClick={() => setActiveTab("clients")}
          className={activeTab === "clients" ? activeTabClasses : inactiveTabClasses}
        >
          Active Clients ({clients.length})
        </button>
        <button
          onClick={() => setActiveTab("invitations")}
          className={activeTab === "invitations" ? activeTabClasses : inactiveTabClasses}
        >
          Invitations ({invitations.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "clients" ? (
        // Clients Tab
        clientsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ClientCardSkeleton />
            <ClientCardSkeleton />
            <ClientCardSkeleton />
          </div>
        ) : clientsError ? (
          <div className="flex flex-col items-center justify-center p-8 border border-destructive/25 rounded-3xl bg-destructive/5 text-center min-h-75">
            <p role="alert" className="text-lg font-medium text-destructive mb-2">
              Error loading clients
            </p>
            <p className="text-sm text-muted-foreground max-w-md mb-6">{clientsError}</p>
            <button
              onClick={() => fetchClientsList(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-ink text-ink-foreground font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center duration-500 border border-dashed min-h-75 border-border rounded-3xl bg-muted/20 animate-in fade-in">
            <p className="text-lg font-medium text-muted-foreground">No clients found</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              When clients accept your invitations, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {clients.map((connection) => (
              <ClientCard key={connection.id} connection={connection} />
            ))}
          </div>
        )
      ) : (
        // Invitations Tab
        invitationsLoading ? (
          <div className="flex flex-col gap-4">
            <InvitationSkeleton />
            <InvitationSkeleton />
            <InvitationSkeleton />
          </div>
        ) : invitationsError ? (
          <div className="flex flex-col items-center justify-center p-8 border border-destructive/25 rounded-3xl bg-destructive/5 text-center min-h-75">
            <p role="alert" className="text-lg font-medium text-destructive mb-2">
              Error loading invitations
            </p>
            <p className="text-sm text-muted-foreground max-w-md mb-6">{invitationsError}</p>
            <button
              onClick={() => fetchInvitationsList(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-ink text-ink-foreground font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center duration-500 border border-dashed min-h-75 border-border rounded-3xl bg-muted/20 animate-in fade-in">
            <p className="text-lg font-medium text-muted-foreground">No invitations found</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Invite clients by their email addresses to connect them to your studio.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {invitations.map((invite) => (
              <div
                key={invite.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border border-border bg-card rounded-2xl shadow-sm transition-all duration-300 hover:shadow"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-muted-foreground/80 shrink-0">
                    <Mail className="w-5.5 h-5.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="font-bold text-foreground ">{invite.clientName}</p>
                    <p className="text-sm text-muted-foreground ">{invite.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-stretch sm:self-auto justify-between sm:justify-end">
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${getInviteStatusStyles(
                      invite.status
                    )}`}
                  >
                    {invite.status.toLowerCase() === "pending" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    )}
                    {invite.status}
                  </span>

                  {/* Sent Date */}
                  <span className="text-xs text-muted-foreground/90 whitespace-nowrap">
                    {new Date(invite.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>

                  {/* Actions */}
                  {invite.status.toLowerCase() === "pending" ? (
                    <button
                      onClick={() => setInvitationToRevoke(invite.id)}
                      className="cursor-pointer p-2.5 rounded-xl text-rose-500 border border-transparent hover:bg-rose-500/10 hover:border-rose-500/20 active:scale-[0.95] transition-all"
                      title="Revoke invitation"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  ) : (
                    <div className="" aria-hidden="true" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Invite Client Modal */}
      <InviteClientModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => {
          fetchInvitationsList(true);
          setActiveTab("invitations");
        }}
      />

      {/* Revoke Confirmation Dialog */}
      <ConfirmDialog
        open={invitationToRevoke !== null}
        title="Revoke Invitation?"
        description="Are you sure you want to revoke this pending invitation? The invite link will no longer be valid."
        confirmLabel="Revoke"
        isConfirming={isRevoking}
        onConfirm={handleRevokeConfirm}
        onCancel={() => setInvitationToRevoke(null)}
      />
    </>
  );
}

export default Clients;