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
    const { message, error, errors } = data as {
      message?: unknown;
      error?: unknown;
      errors?: unknown;
    };

    if (Array.isArray(errors)) {
      const fieldErrors = errors
        .map((entry) => {
          if (typeof entry === "string" && entry.trim()) {
            return entry;
          }

          if (
            typeof entry === "object" &&
            entry !== null &&
            typeof (entry as { message?: unknown }).message === "string"
          ) {
            const message_ = (entry as { message: string }).message.trim();
            const field = (entry as { field?: unknown }).field;
            return field && typeof field === "string" && field.trim()
              ? `${field}: ${message_}`
              : message_;
          }

          return null;
        })
        .filter((entry): entry is string => entry !== null);

      if (fieldErrors.length > 0) {
        return fieldErrors.join(" · ");
      }
    }

    if (
      typeof errors === "object" &&
      errors !== null &&
      !Array.isArray(errors)
    ) {
      const fieldEntries = Object.entries(errors).filter(([, values]) =>
        Array.isArray(values),
      );

      if (fieldEntries.length > 0) {
        return fieldEntries
          .map(([field, values]) => {
            const first = (values as unknown[])[0];
            const text =
              typeof first === "string" ? first : JSON.stringify(values);
            return `${field}: ${text}`;
          })
          .join(" · ");
      }
    }

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (typeof error === "string" && error.trim()) {
      return error;
    }
  }

  return fallback;
}

export function getApiStatus(error: unknown) {
  if (!axios.isAxiosError(error)) return undefined;
  return error.response?.status;
}

/**
 * Formats and sanitizes raw AI backend diagnostic/exception strings
 * (e.g. 429 quota exhaustion, raw JSON exceptions, EOL trace tags)
 * into clean, user-friendly UI copy.
 */
export function formatAiError(
  raw: string | null | undefined,
  fallback = "Generation could not be completed. Please try again.",
): string {
  if (!raw) return fallback;
  const str = String(raw).trim();
  if (/429|RESOURCE_EXHAUSTED|quota|rate.?limit|TooManyRequests/i.test(str)) {
    return "The assistant has reached its usage limit for now. Please try again later.";
  }
  if (
    str.includes("{\n") ||
    str.includes('"code":') ||
    str.includes("statusCode") ||
    str.startsWith("{") ||
    str.includes("TooManyRequests:") ||
    str.includes("<EOL>")
  ) {
    return fallback;
  }
  return str;
}
