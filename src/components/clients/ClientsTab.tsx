import ClientCard from "@/components/cards/ClientCard";
import ClientCardSkeleton from "@/components/skeletons/ClientCardSkeleton";
import { RefreshCw } from "lucide-react";
import type { ClientConnection } from "@/types/client";

interface ClientsTabProps {
    data: ClientConnection[];
    loading: boolean;
    error: string;
    onRetry: () => void;
    onClientDeleted: () => void | Promise<void>;
    onCreatePlan?: (connection: ClientConnection) => void;
}

export function ClientsTab({
    data,
    loading,
    error,
    onRetry,
    onClientDeleted,
    onCreatePlan,
}: ClientsTabProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ClientCardSkeleton />
                <ClientCardSkeleton />
                <ClientCardSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border border-destructive/25 rounded-3xl bg-destructive/5 text-center min-h-75">
                <p role="alert" className="text-lg font-medium text-destructive mb-2">Error loading clients</p>
                <p className="text-sm text-muted-foreground max-w-md mb-6">{error}</p>
                <button onClick={onRetry} className="flex items-center gap-2 px-4 py-2.5 bg-ink text-ink-foreground font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer">
                    <RefreshCw className="w-4 h-4" /> Retry
                </button>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center border border-dashed min-h-75 border-border rounded-3xl bg-muted/20 animate-in fade-in">
                <p className="text-lg font-medium text-muted-foreground">No clients found</p>
                <p className="mt-1 text-sm text-muted-foreground/70">When clients accept your invitations, they will appear here.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {data.map((connection) => (
                <ClientCard
                    key={connection.id}
                    connection={connection}
                    onDeleted={onClientDeleted}
                    onCreatePlan={onCreatePlan}
                />
            ))}
        </div>
    );
}
