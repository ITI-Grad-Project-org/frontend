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

export function InvitationsTab({ data, loading, error, onRetry, onRevoke }: InvitationsTabProps) {
    const getInviteStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case "accepted":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
            case "revoked":
                return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
            default:
                return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
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
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {data.map((invite) => (
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
                            {invite.status.toLowerCase() === "pending" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                            {invite.status}
                        </span>

                        <span className="text-xs text-muted-foreground/90 whitespace-nowrap">
                            {new Date(invite.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                        </span>

                        {invite.status.toLowerCase() === "pending" ? (
                            <button onClick={() => onRevoke(invite.id)} className="cursor-pointer p-2.5 rounded-xl text-rose-500 border border-transparent hover:bg-rose-500/10 hover:border-rose-500/20 active:scale-[0.95] transition-all" title="Revoke invitation">
                                <Trash2 className="w-4.5 h-4.5" />
                            </button>
                        ) : <div aria-hidden="true" />}
                    </div>
                </div>
            ))}
        </div>
    );
}