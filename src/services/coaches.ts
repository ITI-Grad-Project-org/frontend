import { api } from "@/lib/api";
import type { Coach, UpdateCoachPayload } from "@/types/auth";

export async function getCoachProfile() {
  const { data } = await api.get<Coach>("/coaches/me");
  return data;
}

export async function updateCoachProfile(payload: UpdateCoachPayload) {
  const { data } = await api.patch<Coach>(`/coaches/me`, payload);
  return data;
}

export async function deleteCoachProfile() {
  await api.delete(`/coaches/me`);
}
