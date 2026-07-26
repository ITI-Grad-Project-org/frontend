import type { ClientProgramDraft } from "@/types/plans";
import { PlanCard } from "./PlanCard";
import { AlertCircle, RotateCcw, SearchX } from "lucide-react";

interface PlansListProps {
    programs: ClientProgramDraft[];
    clientNameMap: Map<string, string>;
    loading: boolean;
    error?: string | null;
    /** Whether search/filters are currently applied — tailors the empty-state copy. */
    hasActiveFilters?: boolean;
    onEditDraft: (program: ClientProgramDraft) => void;
    onPublish: (program: ClientProgramDraft) => void;
    onReschedule: (program: ClientProgramDraft) => void;
    onCancel: (program: ClientProgramDraft) => void;
    onArchive: (program: ClientProgramDraft) => void;
    /** Optional retry handler shown as a button on the error state. */
    onRetry?: () => void;
}

const SKELETON_COUNT = 4;

// Shared shell so loading / error / empty / loaded states don't visually jump around
function ListShell({ children }: { children: React.ReactNode }) {
    return (
        <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-(--shadow-card)">
            {children}
        </section>
    );
}

export function PlansList({
    programs,
    clientNameMap,
    loading,
    error,
    hasActiveFilters,
    onEditDraft,
    onPublish,
    onReschedule,
    onCancel,
    onArchive,
    onRetry,
}: PlansListProps) {
    if (loading) {
        return (
            <ListShell>
                <div
                    className="grid gap-4 xl:grid-cols-2"
                    role="status"
                    aria-busy="true"
                    aria-live="polite"
                >
                    <span className="sr-only">Loading plans…</span>
                    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                        <div key={i} className="h-36 animate-pulse rounded-3xl bg-muted" />
                    ))}
                </div>
            </ListShell>
        );
    }

    if (error) {
        return (
            <ListShell>
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                    <p className="text-sm font-medium text-destructive">{error}</p>
                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-1 inline-flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Try again
                        </button>
                    )}
                </div>
            </ListShell>
        );
    }

    if (programs.length === 0) {
        return (
            <ListShell>
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <SearchX className="h-6 w-6 text-muted-foreground/70" />
                    <p className="text-lg font-medium text-muted-foreground">
                        {hasActiveFilters ? "No plans match your filters" : "No plans yet"}
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                        {hasActiveFilters
                            ? "Try clearing the search or adjusting the filters."
                            : "Plans you create for clients will show up here."}
                    </p>
                </div>
            </ListShell>
        );
    }

    return (
        <ListShell>
            <div className="grid gap-4 xl:grid-cols-2">
                {programs.map((program) => (
                    <PlanCard
                        key={program.id}
                        program={program}
                        clientName={clientNameMap.get(program.membershipId) ?? "Unknown client"}
                        onEditDraft={onEditDraft}
                        onPublish={onPublish}
                        onReschedule={onReschedule}
                        onCancel={onCancel}
                        onArchive={onArchive}
                    />
                ))}
            </div>
        </ListShell>
    );
}