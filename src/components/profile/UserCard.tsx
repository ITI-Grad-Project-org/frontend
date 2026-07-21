import { Calendar, CheckCircle2, User as UserIcon, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Coach } from "@/types/auth";

interface UserCardProps {
    user: Coach | null;
}

export function UserCard({ user }: UserCardProps) {
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

            <div className="w-full border-t border-border pt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Joined Since
                </span>
                <span className="font-medium text-foreground">
                    {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
                        : "N/A"}
                </span>
            </div>
        </div>
    );
}