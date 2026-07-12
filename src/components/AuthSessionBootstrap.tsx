import { useEffect, type PropsWithChildren } from "react";
import { restoreSession } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function AuthSessionBootstrap({ children }: PropsWithChildren) {
    const setReady = useAuthStore((state) => state.setReady);
    const setTokens = useAuthStore((state) => state.setTokens);
    const clearSession = useAuthStore((state) => state.clearSession);

    useEffect(() => {
        let isActive = true;

        void restoreSession()
            .then((accessToken) => {
                if (isActive) {
                    setTokens({ accessToken });
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
    }, [clearSession, setReady, setTokens]);

    return children;
}
