import { useState, useMemo } from "react";
import InvitationSkeleton from "@/components/skeletons/InvitationSkeleton";
import { RefreshCw, Check, X } from "lucide-react";
import type { JoinRequest } from "@/types/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MediaLightbox } from "@/components/ui/MediaLightbox";


interface RequestsTabProps {
    data: JoinRequest[];
    loading: boolean;
    error: string;
    onRetry: () => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

type FilterStatus = "all" | "requested" | "approved" | "rejected";

export function RequestsTab({ data, loading, error, onRetry, onApprove, onReject }: RequestsTabProps) {
    const [previewUrl, setPreviewUrl] = useState<{ url: string; name: string } | null>(null);
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("requested");

    // Filter requests based on selected status
    const filteredData = useMemo(() => {
        if (statusFilter === "all") return data;
        return data.filter((req) => req.status.toLowerCase() === statusFilter);
    }, [data, statusFilter]);

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved":
                return "bg-success/10 text-success border-success/20";
            case "rejected":
                return "bg-danger/10 text-danger border-danger/20";
            case "requested":
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
                <p role="alert" className="text-lg font-medium text-destructive mb-2">Error loading requests</p>
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
                <p className="text-lg font-medium text-muted-foreground">No join requests found</p>
                <p className="mt-1 text-sm text-muted-foreground/70">Incoming requests will appear here once submitted by clients.</p>
            </div>
        );
    }

    return (
        <>
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-2xl w-fit border border-border/50">
                {(["all", "requested", "approved", "rejected"] as const).map((status) => {
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
                        No {statusFilter} requests
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                        Try changing your filter to see other requests.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredData.map((req) => {
                        const avatarUrl = req.client.avatarUrl;
                        const avatarName = `${req.client.firstName} ${req.client.lastName}`;
                        return (
                        <div key={req.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border border-border bg-card rounded-2xl shadow-sm transition-all hover:shadow">
                            <div className="flex items-center gap-4 min-w-0">
                                {avatarUrl ? (
                                        <button
                                            type="button"
                                            onClick={() => setPreviewUrl({ url: avatarUrl, name: avatarName })}
                                            className="group shrink-0 rounded-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                                            aria-label={`View ${req.client.firstName}'s photo`}
                                            title={`View ${req.client.firstName}'s photo`}
                                        >
                                            <Avatar className="w-12 h-12 border-2 border-background shadow-sm transition group-hover:opacity-85">
                                                <AvatarImage src={avatarUrl} alt={req.client.firstName} className="object-cover" />
                                                <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                                                    {req.client.firstName[0]}{req.client.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                        </button>
                                    ) : (
                                        <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                                            <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                                                {req.client.firstName[0]}{req.client.lastName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                <div className="flex flex-col min-w-0">
                                    <p className="font-bold text-foreground">
                                        {req.client.firstName} {req.client.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{req.client.email}</p>
                                    {req.requestMessage && (
                                        <p className="text-sm text-foreground/80 mt-1 italic">
                                            "{req.requestMessage}"
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-stretch sm:self-auto justify-between sm:justify-end">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusStyles(req.status)}`}>
                                    {req.status.toLowerCase() === "requested" && <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />}
                                    {req.status}
                                </span>

                                <span className="text-xs text-muted-foreground/90 whitespace-nowrap">
                                    {new Date(req.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                                </span>

                                {req.status.toLowerCase() === "requested" ? (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onApprove(req.id)} className="flex items-center justify-center cursor-pointer p-2 rounded-xl text-success bg-success/10 hover:bg-success/20 active:scale-[0.95] transition-all" title="Approve">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onReject(req.id)} className="flex items-center justify-center cursor-pointer p-2 rounded-xl text-danger bg-danger/10 hover:bg-danger/20 active:scale-[0.95] transition-all" title="Reject">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : <div aria-hidden="true" />}
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}
        </div>

        {previewUrl && (
            <MediaLightbox src={previewUrl.url} alt={previewUrl.name} onClose={() => setPreviewUrl(null)} />
        )}
        </>
    );
}