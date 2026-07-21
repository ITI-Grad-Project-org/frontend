// src/hooks/useClientsData.ts
import { useState, useEffect, useCallback } from "react";
import {
  getClients,
  getInvitations,
  deleteInvitation,
} from "@/services/clients";
import type { ClientConnection, ClientInvitation } from "@/types/client";
import { getApiErrorMessage } from "@/lib/api";
import { toast } from "react-toastify";

export function useClientsData() {
  // Client States
  const [clients, setClients] = useState<ClientConnection[]>([]);
  const [clientsLoading, setClientsLoading] = useState<boolean>(true);
  const [clientsError, setClientsError] = useState<string>("");

  // Invitation States
  const [invitations, setInvitations] = useState<ClientInvitation[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState<boolean>(false);
  const [invitationsError, setInvitationsError] = useState<string>("");

  // Action States
  const [invitationToRevoke, setInvitationToRevoke] = useState<string | null>(
    null,
  );
  const [isRevoking, setIsRevoking] = useState<boolean>(false);

  const fetchClientsList = useCallback(async (isActive = true) => {
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
          getApiErrorMessage(err, "Failed to load clients. Please try again."),
        );
      }
    } finally {
      if (isActive) setClientsLoading(false);
    }
  }, []);

  const fetchInvitationsList = useCallback(async (isActive = true) => {
    setInvitationsLoading(true);
    setInvitationsError("");
    try {
      const data = await getInvitations();
      if (isActive) {
        const validInvites = Array.isArray(data)
          ? [...data].sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            )
          : [];
        setInvitations(validInvites);
      }
    } catch (err) {
      if (isActive) {
        setInvitationsError(
          getApiErrorMessage(
            err,
            "Failed to load invitations. Please try again.",
          ),
        );
      }
    } finally {
      if (isActive) setInvitationsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    fetchClientsList(isActive);
    fetchInvitationsList(isActive);
    return () => {
      isActive = false;
    };
  }, [fetchClientsList, fetchInvitationsList]);

  const handleRevokeConfirm = async () => {
    if (!invitationToRevoke) return;
    setIsRevoking(true);
    try {
      await deleteInvitation(invitationToRevoke);
      toast.success("Invitation revoked successfully!");
      fetchInvitationsList(true);
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          "Failed to revoke invitation. Please try again.",
        ),
      );
    } finally {
      setIsRevoking(false);
      setInvitationToRevoke(null);
    }
  };

  return {
    clients: {
      data: clients,
      loading: clientsLoading,
      error: clientsError,
      refetch: fetchClientsList,
    },
    invitations: {
      data: invitations,
      loading: invitationsLoading,
      error: invitationsError,
      refetch: fetchInvitationsList,
    },
    actions: {
      invitationToRevoke,
      setInvitationToRevoke,
      isRevoking,
      handleRevokeConfirm,
    },
  };
}
