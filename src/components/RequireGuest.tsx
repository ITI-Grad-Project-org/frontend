import { Navigate } from "react-router";
import type { PropsWithChildren } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function RequireGuest({ children }: PropsWithChildren) {
    const accessToken = useAuthStore((state) => state.accessToken);
    const isReady = useAuthStore((state) => state.isReady);

    if (!isReady) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-6 text-sm text-muted-foreground">
                Restoring your session…
            </div>
        );
    }

    if (accessToken) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
