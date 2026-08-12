// src/hooks/useClientsData.ts
import { useCallback, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getClients,
  getInvitations,
  deleteInvitation,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from "@/services/clients";
import { getApiErrorMessage } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import { toast } from "react-toastify";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

const invalidate = (...keys: string[]) => {
  for (const key of keys) void queryClient.invalidateQueries({ queryKey: [key] });
};

export function useClientsData() {
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const data = await getClients();
      return Array.isArray(data) ? data.filter((conn) => conn && conn.client) : [];
    },
  });

  const invitationsQuery = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const data = await getInvitations();
      return Array.isArray(data)
        ? [...data].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )
        : [];
    },
  });

  const joinRequestsQuery = useQuery({
    queryKey: ["join-requests"],
    queryFn: async () => {
      const data = await getJoinRequests();
      return Array.isArray(data) ? data : [];
    },
  });

  const revokeInvitation = useMutation({
    mutationFn: (id: string) => deleteInvitation(id),
    onSuccess: () => {
      toast.success("Invitation revoked successfully!");
      invalidate("invitations");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Failed to revoke invitation. Please try again."),
      ),
  });

  const approveRequest = useMutation({
    mutationFn: (id: string) => approveJoinRequest(id),
    onSuccess: () => {
      toast.success("Request approved successfully!");
      invalidate("join-requests", "clients");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Failed to approve request. Please try again."),
      ),
  });

  const rejectRequest = useMutation({
    mutationFn: (id: string) => rejectJoinRequest(id),
    onSuccess: () => {
      toast.success("Request rejected successfully!");
      invalidate("join-requests");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Failed to reject request. Please try again."),
      ),
  });

  const [invitationToRevoke, setInvitationToRevoke] = useState<string | null>(null);
  const [requestToApprove, setRequestToApprove] = useState<string | null>(null);
  const [requestToReject, setRequestToReject] = useState<string | null>(null);

  const handleRevokeConfirm = useCallback(async () => {
    if (!invitationToRevoke) return;
    await revokeInvitation.mutateAsync(invitationToRevoke);
    setInvitationToRevoke(null);
  }, [invitationToRevoke, revokeInvitation]);

  const handleApproveConfirm = useCallback(async () => {
    if (!requestToApprove) return;
    await approveRequest.mutateAsync(requestToApprove);
    setRequestToApprove(null);
  }, [requestToApprove, approveRequest]);

  const handleRejectConfirm = useCallback(async () => {
    if (!requestToReject) return;
    await rejectRequest.mutateAsync(requestToReject);
    setRequestToReject(null);
  }, [requestToReject, rejectRequest]);

  return {
    clients: {
      data: clientsQuery.data ?? [],
      loading: clientsQuery.isLoading,
      error: toError(clientsQuery.error, "Failed to load clients. Please try again."),
      refetch: () => void clientsQuery.refetch(),
    },
    invitations: {
      data: invitationsQuery.data ?? [],
      loading: invitationsQuery.isLoading,
      error: toError(invitationsQuery.error, "Failed to load invitations. Please try again."),
      refetch: () => void invitationsQuery.refetch(),
    },
    joinRequests: {
      data: joinRequestsQuery.data ?? [],
      loading: joinRequestsQuery.isLoading,
      error: toError(joinRequestsQuery.error, "Failed to load join requests. Please try again."),
      refetch: () => void joinRequestsQuery.refetch(),
    },
    actions: {
      invitationToRevoke,
      setInvitationToRevoke,
      isRevoking: revokeInvitation.isPending,
      handleRevokeConfirm,

      requestToApprove,
      setRequestToApprove,
      isApproving: approveRequest.isPending,
      handleApproveConfirm,

      requestToReject,
      setRequestToReject,
      isRejecting: rejectRequest.isPending,
      handleRejectConfirm,
    },
  };
}