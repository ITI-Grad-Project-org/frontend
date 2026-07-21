// src/hooks/useClientsData.ts
import { useState, useEffect, useCallback } from "react";
import {
  getClients,
  getInvitations,
  deleteInvitation,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from "@/services/clients";
import type { ClientConnection, ClientInvitation, JoinRequest } from "@/types/client";
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

  // Join Requests States
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [joinRequestsLoading, setJoinRequestsLoading] = useState<boolean>(false);
  const [joinRequestsError, setJoinRequestsError] = useState<string>("");

  // Action States
  const [invitationToRevoke, setInvitationToRevoke] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);

  const [requestToApprove, setRequestToApprove] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  const [requestToReject, setRequestToReject] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

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

  const fetchJoinRequestsList = useCallback(async (isActive = true) => {
    setJoinRequestsLoading(true);
    setJoinRequestsError("");
    try {
      const data = await getJoinRequests();
      if (isActive) {
        const validRequests = Array.isArray(data) ? data : [];
        setJoinRequests(validRequests);
      }
    } catch (err) {
      if (isActive) {
        setJoinRequestsError(
          getApiErrorMessage(
            err,
            "Failed to load join requests. Please try again.",
          ),
        );
      }
    } finally {
      if (isActive) setJoinRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    fetchClientsList(isActive);
    fetchInvitationsList(isActive);
    fetchJoinRequestsList(isActive);
    return () => {
      isActive = false;
    };
  }, [fetchClientsList, fetchInvitationsList, fetchJoinRequestsList]);

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

  const handleApproveConfirm = async () => {
    if (!requestToApprove) return;
    setIsApproving(true);
    try {
      await approveJoinRequest(requestToApprove);
      toast.success("Request approved successfully!");
      fetchJoinRequestsList(true);
      fetchClientsList(true); // refresh clients
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          "Failed to approve request. Please try again.",
        ),
      );
    } finally {
      setIsApproving(false);
      setRequestToApprove(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!requestToReject) return;
    setIsRejecting(true);
    try {
      await rejectJoinRequest(requestToReject);
      toast.success("Request rejected successfully!");
      fetchJoinRequestsList(true);
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          "Failed to reject request. Please try again.",
        ),
      );
    } finally {
      setIsRejecting(false);
      setRequestToReject(null);
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
    joinRequests: {
      data: joinRequests,
      loading: joinRequestsLoading,
      error: joinRequestsError,
      refetch: fetchJoinRequestsList,
    },
    actions: {
      invitationToRevoke,
      setInvitationToRevoke,
      isRevoking,
      handleRevokeConfirm,

      requestToApprove,
      setRequestToApprove,
      isApproving,
      handleApproveConfirm,

      requestToReject,
      setRequestToReject,
      isRejecting,
      handleRejectConfirm,
    },
  };
}
