import { Plus } from "lucide-react";

interface PlansHeaderProps {
    onCreateClick: () => void;
    disabled?: boolean;
}

export function PlansHeader({ onCreateClick, disabled = false }: PlansHeaderProps) {
    return (
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
                {/* <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Plans</p> */}
                <h1 className="mt-2 text-4xl font-black text-foreground">Client training programs</h1>
                {/* <p className="mt-3 text-sm text-muted-foreground">
                    Search, filter, and create workout-program drafts for the clients in your tenant.
                </p> */}
            </div>

            <button
                type="button"
                onClick={onCreateClick}
                disabled={disabled}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <Plus className="h-4 w-4" />
                Create plan draft
            </button>
        </div>
    );
}
