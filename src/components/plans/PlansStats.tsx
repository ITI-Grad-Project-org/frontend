import { Ban, Layers3, PencilLine, Users } from "lucide-react";
import { StatCard } from "@/components/cards/StatCard";

interface PlansStatsProps {
    total: number;
    drafts: number;
    canceled: number;
    activeClients: number;
}

export function PlansStats({ total, drafts, canceled, activeClients }: PlansStatsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                icon={<Layers3 className="h-5 w-5" />}
                label="Programs"
                value={total}
                chipColor="violet"
            />
            <StatCard
                icon={<PencilLine className="h-5 w-5" />}
                label="Drafts"
                value={drafts}
                chipColor="orange"
            />
            <StatCard
                icon={<Ban className="h-5 w-5" />}
                label="Canceled"
                value={canceled}
                chipColor="pink"
            />
            <StatCard
                icon={<Users className="h-5 w-5" />}
                label="Active clients"
                value={activeClients}
                chipColor="green"
            />
        </div>
    );
}