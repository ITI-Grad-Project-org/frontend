import { Calendar, CheckCircle2, Clock3, Globe2, IdCard, User as UserIcon, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Coach } from "@/types/auth";

interface UserCardProps {
    user: Coach | null;
}

export function UserCard({ user }: UserCardProps) {
    const detailRowClass = "flex items-center justify-between gap-3 text-sm";
    const valueClass = "text-right font-medium text-foreground";
    const labelClass = "text-muted-foreground";
    const priceRange =
        user?.priceFrom != null || user?.priceTo != null
            ? `${user?.priceFrom ?? "?"} - ${user?.priceTo ?? "?"}`
            : "N/A";

    return (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) text-center flex flex-col items-center">
            <Avatar className="w-24 h-24 mb-4">
                {user?.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-muted text-muted-foreground">
                    <UserIcon className="w-12 h-12" />
                </AvatarFallback>
            </Avatar>

            <h3 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h3>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            {user?.location && <p className="mt-1 text-xs text-muted-foreground">{user.location}</p>}

            <div className="w-full border-t border-border my-4 pt-4 space-y-3 text-left">
                <div className={detailRowClass}>
                    <span className={labelClass}>Phone</span>
                    <span className={valueClass}>{user?.phone ?? "N/A"}</span>
                </div>
                <div className={detailRowClass}>
                    <span className={labelClass}>Age</span>
                    <span className={valueClass}>{user?.age ?? "N/A"}</span>
                </div>
                <div className={detailRowClass}>
                    <span className={labelClass}>Gender</span>
                    <span className={valueClass}>{user?.gender ?? "N/A"}</span>
                </div>
                <div className={detailRowClass}>
                    <span className={labelClass}>Offline Availability</span>
                    <span className={valueClass}>{user?.offlineAvailability ?? "N/A"}</span>
                </div>
                <div className={detailRowClass}>
                    <span className={labelClass}>Availability hours</span>
                    <span className={valueClass}>{user?.availabilityHours ?? "N/A"}</span>
                </div>
                <div className={detailRowClass}>
                    <span className={labelClass}>Price range</span>
                    <span className={valueClass}>{priceRange}</span>
                </div>
            </div>

            <div className="w-full border-t border-border my-4 pt-4 space-y-3 text-left">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Email Status</span>
                    {user?.isEmailVerified ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                            <CheckCircle2 className="w-4 h-4" /> Verified
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-danger">
                            <XCircle className="w-4 h-4" /> Unverified
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Phone Status</span>
                    {user?.isPhoneVerified ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                            <CheckCircle2 className="w-4 h-4" /> Verified
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-danger">
                            <XCircle className="w-4 h-4" /> Unverified
                        </span>
                    )}
                </div>
            </div>

            <div className="w-full border-t border-border pt-4 space-y-3 text-left text-sm">
                {/* <div className={detailRowClass}>
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <IdCard className="w-4 h-4" /> Profile ID
                    </span>
                    <span className={valueClass}>{user?.id ?? "N/A"}</span>
                </div> */}
                <div className={detailRowClass}>
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> Joined
                    </span>
                    <span className={valueClass}>
                        {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
                            : "N/A"}
                    </span>
                </div>
                <div className={detailRowClass}>
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <Clock3 className="w-4 h-4" /> Last login
                    </span>
                    <span className={valueClass}>
                        {user?.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
                            : "N/A"}
                    </span>
                </div>
                <div className={detailRowClass}>
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <Globe2 className="w-4 h-4" /> Updated
                    </span>
                    <span className={valueClass}>
                        {user?.updatedAt
                            ? new Date(user.updatedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
                            : "N/A"}
                    </span>
                </div>
            </div>
        </div>
    );
}
