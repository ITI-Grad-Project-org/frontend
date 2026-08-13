import { CoachFacts } from "./CoachFacts";
import { TenantCard } from "./TenantCard";
import type { Coach } from "@/types/auth";

interface ProfileSidebarProps {
    user: Coach | null;
}

export function ProfileSidebar({ user }: ProfileSidebarProps) {
    return (
        <div className="space-y-6 lg:col-span-1">
            <CoachFacts user={user} />
            <TenantCard tenants={user?.tenants} />
        </div>
    );
}