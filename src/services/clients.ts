import { api } from "@/lib/api";
import type { ClientConnection, ClientInvitation } from "@/types/client";

export async function getClients(): Promise<ClientConnection[]> {
  const { data } = await api.get<ClientConnection[]>("/client");
  return data;
}

export async function getClientById(id: string): Promise<ClientConnection> {
  const { data } = await api.get<ClientConnection>(`/client/${id}`);
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
