import { useEffect, type PropsWithChildren } from "react";
import { restoreSession } from "@/lib/api";
import { getCoachProfile } from "@/services/coaches";
import { useAuthStore } from "@/stores/auth-store";

export function AuthSessionBootstrap({ children }: PropsWithChildren) {
    const setReady = useAuthStore((state) => state.setReady);
    const setTokens = useAuthStore((state) => state.setTokens);
    const setUser = useAuthStore((state) => state.setUser);
    const clearSession = useAuthStore((state) => state.clearSession);

    useEffect(() => {
        let isActive = true;

        void restoreSession()
            .then(async (accessToken) => {
                if (isActive) {
                    setTokens({ accessToken });
                }

                const coach = await getCoachProfile().catch(() => null);

                if (isActive && coach) {
                    setUser(coach);
                }
            })
            .catch(() => {
                if (isActive) {
                    clearSession();
                }
            })
            .finally(() => {
                if (isActive) {
                    setReady(true);
                }
            });

        return () => {
            isActive = false;
        };
    }, [clearSession, setReady, setTokens, setUser]);

    return children;
}
