import { UserCard } from "./UserCard";
import { TenantCard } from "./TenantCard";
import type { Coach } from "@/types/auth";

interface ProfileSidebarProps {
    user: Coach | null;
}

export function ProfileSidebar({ user }: ProfileSidebarProps) {
    return (
        <div className="space-y-6 lg:col-span-1">
            <UserCard user={user} />
            <TenantCard tenants={user?.tenants} />
        </div>
    );
}