import { useState, useMemo } from "react";
import InvitationSkeleton from "@/components/skeletons/InvitationSkeleton";
import { RefreshCw, Mail, Trash2 } from "lucide-react";
import type { ClientInvitation } from "@/types/client";

interface InvitationsTabProps {
    data: ClientInvitation[];
    loading: boolean;
    error: string;
    onRetry: () => void;
    onRevoke: (id: string) => void;
}

type FilterStatus = "all" | "pending" | "accepted" | "revoked";

export function InvitationsTab({ data, loading, error, onRetry, onRevoke }: InvitationsTabProps) {
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

    // Filter invitations based on selected status
    const filteredData = useMemo(() => {
        if (statusFilter === "all") return data;
        return data.filter((invite) => invite.status.toLowerCase() === statusFilter);
    }, [data, statusFilter]);

    const getInviteStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case "accepted":
                return "bg-success/10 text-success border-success/20";
            case "revoked":
                return "bg-danger/10 text-danger border-danger/20";
            default:
                return "bg-warn/10 text-warn border-warn/20";
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-4">
                <InvitationSkeleton />
                <InvitationSkeleton />
                <InvitationSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border border-destructive/25 rounded-3xl bg-destructive/5 text-center min-h-75">
                <p role="alert" className="text-lg font-medium text-destructive mb-2">Error loading invitations</p>
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
                <p className="text-lg font-medium text-muted-foreground">No invitations found</p>
                <p className="mt-1 text-sm text-muted-foreground/70">Invite clients by their email addresses to connect them to your studio.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-2xl w-fit border border-border/50">
                {(["all", "pending", "accepted", "revoked"] as const).map((status) => {
                    const isActive = statusFilter === status;
                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer ${isActive
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                                }`}
                        >
                            {status}
                        </button>
                    );
                })}
            </div>

            {/* Filtered Content */}
            {filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed min-h-60 border-border rounded-3xl bg-muted/10">
                    <p className="text-base font-medium text-muted-foreground capitalize">
                        No {statusFilter} invitations
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                        Try changing your filter to see other invitations.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredData.map((invite) => (
                        <div key={invite.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border border-border bg-card rounded-2xl shadow-sm transition-all hover:shadow">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-muted-foreground/80 shrink-0">
                                    <Mail className="w-5.5 h-5.5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <p className="font-bold text-foreground">{invite.clientName}</p>
                                    <p className="text-sm text-muted-foreground">{invite.email}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-stretch sm:self-auto justify-between sm:justify-end">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${getInviteStatusStyles(invite.status)}`}>
                                    {invite.status.toLowerCase() === "pending" && <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />}
                                    {invite.status}
                                </span>

                                <span className="text-xs text-muted-foreground/90 whitespace-nowrap">
                                    {new Date(invite.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                                </span>

                                {invite.status.toLowerCase() === "pending" ? (
                                    <button onClick={() => onRevoke(invite.id)} className="cursor-pointer p-2.5 rounded-xl text-danger border border-transparent hover:bg-danger/10 hover:border-danger/20 active:scale-[0.95] transition-all" title="Revoke invitation">
                                        <Trash2 className="w-4.5 h-4.5" />
                                    </button>
                                ) : <div aria-hidden="true" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}