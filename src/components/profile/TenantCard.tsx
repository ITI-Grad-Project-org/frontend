import { useRef, useState } from "react";
import { Link } from "react-router";
import { Building2, ExternalLink, Star, Camera, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { uploadTenantLogo } from "@/services/tenant";
import type { Coach } from "@/types/auth";

interface TenantCardProps {
    tenants: Coach["tenants"];
}

interface TenantAvatarProps {
    tenantId: string;
    name: string;
    logoUrl?: string | null;
    /** Only the first (primary) tenant gets the upload affordance */
    isPrimary: boolean;
}

function TenantAvatar({ tenantId, name, logoUrl, isPrimary }: TenantAvatarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const setUser = useAuthStore((s) => s.setUser);
    const user = useAuthStore((s) => s.user);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Logo must be smaller than 5 MB.");
            return;
        }

        // Capture old URL before overwriting — used to clean up S3 after success
        const oldUrl = logoUrl ?? null;

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setUploading(true);

        try {
            const updatedTenant = await uploadTenantLogo(file);

            if (user) {
                const updatedTenants = (user.tenants ?? []).map((t) =>
                    t.id === tenantId ? { ...t, logoUrl: updatedTenant.logoUrl } : t
                );
                setUser({ ...user, tenants: updatedTenants });
            }

            // Delete the old logo from S3 now that the new one is confirmed saved
            if (oldUrl) {
                const { deleteFile } = await import("@/services/upload");
                await deleteFile(oldUrl).catch(() => {
                    // Non-critical — old file cleanup failure shouldn't surface to the user
                });
            }

            toast.success("Logo updated.");
        } catch {
            setPreviewUrl(null);
            toast.error("Failed to upload logo. Please try again.");
        } finally {
            setUploading(false);
            URL.revokeObjectURL(objectUrl);
        }
    };

    const avatar = (
        <Avatar className="w-10 h-10">
            <AvatarImage
                src={previewUrl ?? logoUrl ?? undefined}
                alt={name}
                className="object-cover"
            />
            <AvatarFallback className="bg-muted text-muted-foreground">
                <Building2 className="w-5 h-5" />
            </AvatarFallback>
        </Avatar>
    );

    if (!isPrimary) return avatar;

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-label={`Upload logo for ${name}`}
                onChange={(e) => void handleFileChange(e)}
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Click to change logo"
                className="relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 group/logo disabled:cursor-not-allowed"
            >
                {avatar}

                {/* Overlay on hover */}
                <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/60 opacity-0 transition-opacity duration-150 group-hover/logo:opacity-100"
                >
                    {uploading ? (
                        <Loader2 className="w-4 h-4 text-ink-foreground animate-spin" />
                    ) : (
                        <Camera className="w-4 h-4 text-ink-foreground" />
                    )}
                </span>
            </button>
        </>
    );
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
                    {tenants.map((tenant, index) => (
                        <div
                            key={tenant.id}
                            className="flex flex-col gap-3 p-3 rounded-xl border border-border bg-muted/40"
                        >
                            <div className="flex items-center gap-3">
                                <TenantAvatar
                                    tenantId={tenant.id}
                                    name={tenant.name}
                                    logoUrl={tenant.logoUrl}
                                    isPrimary={index === 0}
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold truncate">{tenant.name}</h4>
                                    <p className="text-xs text-muted-foreground truncate">
                                        slug: {tenant.slug}
                                    </p>
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
                <p className="text-sm text-muted-foreground">
                    No current companies associated.
                </p>
            )}
        </div>
    );
}
