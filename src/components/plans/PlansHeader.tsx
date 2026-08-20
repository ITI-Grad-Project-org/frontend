import { ListChecks, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { SpecularButton } from "@/components/ui/specular-button/SpecularButton";

interface PlansHeaderProps {
    onCreateClick: () => void;
    onAICreateClick: () => void;
    disabled?: boolean;
}

export function PlansHeader({ onCreateClick, onAICreateClick, disabled = false }: PlansHeaderProps) {
    return (
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
                {/* <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Plans</p> */}
                <h1 className="mt-2 text-4xl font-black text-foreground">Client training programs</h1>
                {/* <p className="mt-3 text-sm text-muted-foreground">
                    Search, filter, and create workout-program drafts for the clients in your tenant.
                </p> */}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Link
                    to="/dashboard/ai-suggestions"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                    <ListChecks className="h-4 w-4" />
                    AI suggestions
                </Link>

                <SpecularButton
                    size="md"
                    radius={18}
                    disabled={disabled}
                    onClick={onAICreateClick}
                    speed={0.45}
                    intensity={1.9}
                    thickness={3.5}
                    shineSize={14}
                    lineColor="#ad5fff"
                    baseColor="#000000"
                    textColor="var(--color-ink-foreground)"
                    background="var(--color-ink)"
                >
                    <span className="inline-flex items-center gap-2">
                        <Sparkles className="specular-icon h-4 w-4 text-[#ad5fff]" />
                        Create with AI
                    </span>
                </SpecularButton>

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
        </div>
    );
}
