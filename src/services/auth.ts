import { api } from "@/lib/api";
import { googleLogout } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "@/lib/google-oauth";
import type { AuthResponse, LoginPayload, RegisterPayload } from "@/types/auth";

export async function registerCoach(
  payload: RegisterPayload,
): Promise<AuthResponse> {
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

export async function signInWithGoogle(idToken: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(
    "/auth/google",
    { idToken },
    { skipAuth: true },
  );

  return data;
}

export async function requestPasswordReset(email: string) {
  await api.post("/auth/forgot-password", { email }, { skipAuth: true });
}

export async function verifyResetOtp(payload: { email: string; otp: string }) {
  const { data } = await api.post<{ resetToken: string }>(
    "/auth/verify-reset-otp",
    payload,
    { skipAuth: true },
  );

  return data;
}

export async function resetPassword(payload: {
  resetToken: string;
  newPassword: string;
}) {
  await api.post("/auth/reset-password", payload, { skipAuth: true });
}

export async function signOut() {
  await api.post("/auth/logout");

  if (GOOGLE_CLIENT_ID) {
    googleLogout();
  }
}
