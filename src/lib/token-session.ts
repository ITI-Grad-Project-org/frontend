let refreshToken: string | null = null;

export function setRefreshToken(token?: string) {
    refreshToken = token || null;
}

export function getRefreshToken() {
    return refreshToken;
}

export function clearRefreshToken() {
    refreshToken = null;
}
