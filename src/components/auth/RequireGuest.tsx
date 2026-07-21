import { Navigate } from "react-router";
import { useState, type PropsWithChildren } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function RequireGuest({ children }: PropsWithChildren) {
    const accessToken = useAuthStore((state) => state.accessToken);
    const isReady = useAuthStore((state) => state.isReady);

    const [prevIsReady, setPrevIsReady] = useState(isReady);
    const [shouldRedirect, setShouldRedirect] = useState<boolean | null>(() =>
        isReady ? Boolean(accessToken) : null
    );

    if (isReady !== prevIsReady) {
        setPrevIsReady(isReady);

        if (isReady && shouldRedirect === null) {
            setShouldRedirect(Boolean(accessToken));
        }
    }

    if (!isReady || shouldRedirect === null) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-6 text-sm text-muted-foreground">
                Restoring your session…
            </div>
        );
    }

    if (shouldRedirect) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}