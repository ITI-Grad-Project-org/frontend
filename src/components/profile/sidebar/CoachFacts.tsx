import { Award, Building2, Calendar, Clock3, IdCard, Mail, MapPin, Phone, RefreshCw, Star, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Coach } from "@/types/auth";

interface CoachFactsProps {
    user: Coach | null;
}

function FactRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="truncate text-sm font-medium text-foreground">{value}</p>
            </div>
        </div>
    );
}

export function CoachFacts({ user }: CoachFactsProps) {
    const price =
        user?.priceFrom != null || user?.priceTo != null
            ? `${user?.priceFrom ?? "?"} - ${user?.priceTo ?? "?"} ${user?.tenants?.[0]?.currency ?? ""}`
            : "On request";

    const facts = [
        {
            icon: Award,
            label: "Years coaching",
            value: user?.yearsExperience != null ? `${user.yearsExperience} yrs` : "—",
        },
        { icon: Wallet, label: "Session price", value: price },
        {
            icon: Star,
            label: "Specialties",
            value: user?.specialties?.length ? `${user.specialties.length}` : "—",
        },
        { icon: Mail, label: "Email", value: user?.email ?? "—" },
        { icon: Phone, label: "Phone", value: user?.phone ?? "N/A" },
        { icon: MapPin, label: "Location", value: user?.location ?? "N/A" },
        { icon: Building2, label: "In-person", value: user?.offlineAvailability ?? "N/A" },
        { icon: Clock3, label: "Working hours", value: user?.availabilityHours ?? "N/A" },
    ];

    return (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-6">
            <div className="flex items-center gap-2.5">
                <span className="chip bg-chip-peach text-brand">
                    <IdCard className="h-5 w-5" />
                </span>
                <h2 className="text-base font-bold">Coach details</h2>
            </div>

            <div className="mt-5 space-y-4">
                {facts.map((fact) => (
                    <FactRow key={fact.label} icon={fact.icon} label={fact.label} value={fact.value} />
                ))}
            </div>

            <div className="mt-5 space-y-4 border-t border-border pt-5">
                <FactRow
                    icon={Calendar}
                    label="Joined"
                    value={
                        user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
                            : "N/A"
                    }
                />
                <FactRow
                    icon={RefreshCw}
                    label="Updated"
                    value={
                        user?.updatedAt
                            ? new Date(user.updatedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
                            : "N/A"
                    }
                />
            </div>
        </div>
    );
}