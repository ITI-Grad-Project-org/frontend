import { Calendar, Layers3, Sparkles } from "lucide-react";
import { Chip } from "@/components/ui/Chip";

interface PlansStatsProps {
    total: number;
    drafts: number;
    canceled: number;
    activeClients: number;
}

function StatCard({
    icon,
    label,
    value,
    chipColor,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    chipColor: "violet" | "orange" | "pink" | "green";
}) {
    return (
        <div className="rounded-3xl border border-border bg-card p-5 shadow-(--shadow-card)">
            <div className="flex items-center gap-3">
                <Chip color={chipColor} className="h-11 w-11 shrink-0 rounded-2xl p-0">
                    {icon}
                </Chip>
                <div className="min-w-0">
                    <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-black">{value}</p>
                </div>
            </div>
        </div>
    );
}

export function PlansStats({ total, drafts, canceled, activeClients }: PlansStatsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<Layers3 className="h-5 w-5" />} label="Programs" value={total} chipColor="violet" />
            <StatCard icon={<Calendar className="h-5 w-5" />} label="Drafts" value={drafts} chipColor="orange" />
            <StatCard icon={<Sparkles className="h-5 w-5" />} label="Canceled" value={canceled} chipColor="pink" />
            <StatCard icon={<Layers3 className="h-5 w-5" />} label="Active clients" value={activeClients} chipColor="green" />
        </div>
    );
}
