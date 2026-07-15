export const refreshTokenStorageKey = "uply.refresh-token";
export function setRefreshTokenFromExternalUpdate(token: string | null) {
  refreshToken = token;
}

function readRefreshToken() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(refreshTokenStorageKey);
  } catch {
    return null;
  }
}

let refreshToken: string | null = readRefreshToken();

export function setRefreshToken(token?: string) {
  refreshToken = token || null;

  if (typeof window === "undefined") {
    return;
  }

  try {
    if (refreshToken) {
      window.localStorage.setItem(refreshTokenStorageKey, refreshToken);
    } else {
      window.localStorage.removeItem(refreshTokenStorageKey);
    }
  } catch {
    return;
  }
}

export function getRefreshToken() {
  return refreshToken ?? readRefreshToken();
}

export function clearRefreshToken() {
  refreshToken = null;

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(refreshTokenStorageKey);
  } catch {
    return;
  }
}
