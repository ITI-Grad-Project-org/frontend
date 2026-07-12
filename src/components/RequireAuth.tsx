import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "@/stores/auth-store";
import type { PropsWithChildren } from "react";

export function RequireAuth({ children }: PropsWithChildren) {
    const accessToken = useAuthStore((state) => state.accessToken);
    const isReady = useAuthStore((state) => state.isReady);
    const location = useLocation();

    if (!isReady) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-6 text-sm text-muted-foreground">
                Restoring your session…
            </div>
        );
    }

    if (!accessToken) {
        return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
    }

    return children;
}
