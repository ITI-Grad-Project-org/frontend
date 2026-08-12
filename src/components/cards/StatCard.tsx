import type { ReactNode } from "react";
import { Chip } from "@/components/ui/Chip";

export function StatCard({
    icon,
    label,
    value,
    chipColor,
}: {
    icon: ReactNode;
    label: string;
    value: number;
    chipColor: "violet" | "orange" | "pink" | "green";
}) {
    return (
        <div className="rounded-3xl border border-border bg-card p-5 shadow-(--shadow-card) transition hover:border-brand/40">
            <div className="flex items-center gap-3">
                <Chip color={chipColor} className="h-11 w-11 shrink-0 rounded-2xl p-0">
                    {icon}
                </Chip>
                <div className="min-w-0">
                    <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {label}
                    </p>
                    <p className="mt-1 text-2xl font-black tabular-nums">{value}</p>
                </div>
            </div>
        </div>
    );
}