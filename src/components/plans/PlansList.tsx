import type { ClientProgramDraft } from "@/types/plans";
import { PlanCard } from "./PlanCard";

interface PlansListProps {
    programs: ClientProgramDraft[];
    clientNameMap: Map<string, string>;
    loading: boolean;
    error: string;
}

export function PlansList({ programs, clientNameMap, loading, error }: PlansListProps) {
    if (loading) {
        return (
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <div className="h-36 animate-pulse rounded-3xl bg-muted" />
                <div className="h-36 animate-pulse rounded-3xl bg-muted" />
                <div className="h-36 animate-pulse rounded-3xl bg-muted" />
                <div className="h-36 animate-pulse rounded-3xl bg-muted" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-6 rounded-3xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
                {error}
            </div>
        );
    }

    if (programs.length === 0) {
        return (
            <div className="mt-6 rounded-3xl border border-dashed border-border bg-muted/20 p-8 text-center">
                <p className="text-lg font-medium text-muted-foreground">No programs match your filters</p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                    Try clearing the search or adjusting the filters.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-6 grid gap-4 xl:grid-cols-2 rounded-3xl border border-border bg-card p-6 shadow-(--shadow-card)">
            {programs.map((program) => (
                <PlanCard
                    key={program.id}
                    program={program}
                    clientName={clientNameMap.get(program.membershipId) ?? "Unknown client"}
                />
            ))}
        </div>
    );
}
