import { api } from "@/lib/api";
import type { AuthResponse, LoginPayload, RegisterPayload } from "@/types/auth";

export async function registerCoach(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/register", payload, {
        skipAuth: true,
    });

    return data;
}

export async function signIn(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", payload, {
        skipAuth: true,
    });

    return data;
}

export async function requestPasswordReset(email: string) {
    await api.post("/auth/forgot-password", { email }, { skipAuth: true });
}

export async function signOut() {
    await api.post("/auth/logout");
}
