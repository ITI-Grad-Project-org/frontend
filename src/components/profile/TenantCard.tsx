import { Link } from "react-router";
import { Building2, ExternalLink, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Coach } from "@/types/auth";

interface TenantCardProps {
    tenants: Coach["tenants"];
}

export function TenantCard({ tenants }: TenantCardProps) {
    return (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card)">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-brand" />
                Current Companies
            </h3>

            {tenants && tenants.length > 0 ? (
                <div className="space-y-4">
                    {tenants.map((tenant) => (
                        <div key={tenant.id} className="flex flex-col gap-3 p-3 rounded-xl border border-border bg-muted/40">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                    {tenant.logoUrl ? (
                                        <AvatarImage src={tenant.logoUrl} alt={tenant.name} className="object-cover" />
                                    ) : null}
                                    <AvatarFallback className="bg-muted text-muted-foreground">
                                        <Building2 className="w-5 h-5" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold truncate">{tenant.name}</h4>
                                    <p className="text-xs text-muted-foreground truncate">slug: {tenant.slug}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="inline-block text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-medium">
                                            {tenant.currency}
                                        </span>
                                        <span className="inline-block text-[10px] bg-muted-foreground/10 text-muted-foreground px-1.5 py-0.5 rounded font-medium">
                                            {tenant.timezone}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Link
                                to={`/coach/${tenant.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:border-brand/50 hover:bg-brand/5 transition-all"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                View public profile
                            </Link>
                            <Link
                                to="/dashboard/reviews"
                                className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:border-brand/50 hover:bg-brand/5 transition-all"
                            >
                                <Star className="w-3.5 h-3.5" />
                                View Clients Reviews
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No current companies associated.</p>
            )}
        </div>
    );
}