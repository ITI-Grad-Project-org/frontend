import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth-store";
import { getRefreshToken } from "@/lib/token-session";
import type { TokenResponse } from "@/types/auth";

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    _retry?: boolean;
  }
}

type AuthenticatedRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuth?: boolean;
};

let refreshPromise: Promise<string> | null = null;

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ?? "https://api.20.54.71.51.nip.io",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const authenticatedConfig = config as AuthenticatedRequestConfig;

  if (!authenticatedConfig.skipAuth) {
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken) {
      authenticatedConfig.headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  return authenticatedConfig;
});

async function refreshAccessToken() {
  if (!refreshPromise) {
    const refreshToken = getRefreshToken();
    const headers = refreshToken
      ? { Authorization: `Bearer ${refreshToken}` }
      : undefined;

    refreshPromise = api
      .post<TokenResponse>("/auth/refresh", undefined, {
        headers,
        skipAuth: true,
      } as AuthenticatedRequestConfig)
      .then(({ data }) => {
        if (!data.accessToken) {
          throw new Error(
            "The refresh request did not return an access token.",
          );
        }

        useAuthStore.getState().setTokens(data);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export function restoreSession() {
  return refreshAccessToken();
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | AuthenticatedRequestConfig
      | undefined;
    const isAuthEndpoint = originalRequest?.url?.startsWith("/auth/");

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest.skipAuth ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      originalRequest.headers.set("Authorization", `Bearer ${accessToken}`);
      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearSession();
      return Promise.reject(refreshError);
    }
  },
);

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data === "object" && data !== null) {
    const message = (data as { message?: unknown; error?: unknown }).message;
    const apiError = (data as { error?: unknown }).error;

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (typeof apiError === "string" && apiError.trim()) {
      return apiError;
    }
  }

  return fallback;
}
