import { api } from "@/lib/api";
import type {
  ClientConnection,
  ClientConnectionDetail,
  ClientInvitation,
  ClientMeasurement,
  MeasurementListResponse,
  MeasurementQueryParams,
} from "@/types/client";

export async function getClients(): Promise<ClientConnection[]> {
  const { data } = await api.get<ClientConnection[]>("/client");
  return data;
}

export async function getClientById(id: string): Promise<ClientConnectionDetail> {
  const { data } = await api.get<ClientConnectionDetail>(`/client/${id}`);
  return data;
}

export async function getClientMeasurements(
  clientId: string,
  params: MeasurementQueryParams = {},
): Promise<MeasurementListResponse> {
  const { data } = await api.get<MeasurementListResponse>(
    `/client/${clientId}/measurements`,
    { params },
  );
  return data;
}

export async function getClientMeasurementById(
  clientId: string,
  id: string,
): Promise<ClientMeasurement> {
  const { data } = await api.get<ClientMeasurement>(
    `/client/${clientId}/measurements/${id}`,
  );
  return data;
}

export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/client/${id}`);
}

export async function getInvitations(): Promise<ClientInvitation[]> {
  const { data } = await api.get<ClientInvitation[]>("/invitation");
  return data;
}

export async function getInvitationById(id: string): Promise<ClientInvitation> {
  const { data } = await api.get<ClientInvitation>(`/invitation/${id}`);
  return data;
}

export async function createInvitation(payload: { email: string; name: string }): Promise<ClientInvitation> {
  const { data } = await api.post<ClientInvitation>("/invitation", payload);
  return data;
}

export async function deleteInvitation(id: string): Promise<void> {
  await api.delete(`/invitation/${id}`);
}

export async function getJoinRequests(): Promise<import("@/types/client").JoinRequest[]> {
  const { data } = await api.get<import("@/types/client").JoinRequest[]>("/join-requests");
  return data;
}

export async function approveJoinRequest(id: string): Promise<void> {
  await api.post(`/join-requests/${id}/approve`);
}

export async function rejectJoinRequest(id: string): Promise<void> {
  await api.post(`/join-requests/${id}/reject`);
}
