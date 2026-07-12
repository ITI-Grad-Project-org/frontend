import { api } from "@/lib/api";
import type { Coach, UpdateCoachPayload } from "@/types/auth";

export async function getCoachProfile() {
    const { data } = await api.get<Coach>("/coaches/me");
    return data;
}

export async function updateCoachProfile(id: string, payload: UpdateCoachPayload) {
    const { data } = await api.patch<Coach>(`/coaches/${id}`, payload);
    return data;
}

export async function deleteCoachProfile(id: string) {
    await api.delete(`/coaches/${id}`);
}
