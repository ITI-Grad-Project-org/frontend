import { api } from "@/lib/api";
import type {
  ClientConnection,
  ClientConnectionDetail,
  ClientInvitation,
  ClientMeasurement,
  MeasurementListResponse,
  MeasurementQueryParams,
  PendingMeasurementReviewsResponse,
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

/** GET /measurements/reviews/pending — unreviewed measurements across the tenant */
export async function getPendingMeasurementReviews(
  params: MeasurementQueryParams = {},
): Promise<PendingMeasurementReviewsResponse> {
  const { data } = await api.get<PendingMeasurementReviewsResponse>(
    "/measurements/reviews/pending",
    { params },
  );
  return data;
}

export async function reviewMeasurement(
  measurementId: string,
  coachFeedback: string,
): Promise<void> {
  await api.patch(`/measurements/${measurementId}/review`, { coachFeedback });
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
