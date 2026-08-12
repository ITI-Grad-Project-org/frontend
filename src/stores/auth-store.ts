import { create } from "zustand";
import { queryClient } from "@/lib/query-client";
import { clearRefreshToken, setRefreshToken } from "@/lib/token-session";
import type { AuthResponse, Coach, TokenResponse } from "@/types/auth";

type AuthState = {
    user: Coach | null;
    accessToken: string | null;
    isReady: boolean;
    setSession: (session: AuthResponse) => void;
    setTokens: (tokens: TokenResponse) => void;
    setUser: (user: Coach) => void;
    setReady: (isReady: boolean) => void;
    clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    isReady: false,
    setSession: (session) => {
        queryClient.clear();
        setRefreshToken(session.refreshToken);
        set({ user: session.user, accessToken: session.accessToken || null });
    },
    setTokens: (tokens) => {
        if (tokens.refreshToken !== undefined) {
            setRefreshToken(tokens.refreshToken);
        }

        set((state) => ({
            accessToken: tokens.accessToken || null,
            user: tokens.user ?? state.user,
        }));
    },
    setUser: (user) => set({ user }),
    setReady: (isReady) => set({ isReady }),
    clearSession: () => {
        queryClient.clear();
        clearRefreshToken();
        set({ user: null, accessToken: null });
    },
}));
