import { useRef, useState } from "react";
import { Building2, Camera, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { uploadTenantLogo } from "@/services/tenant";
import type { Tenant } from "@/types/auth";

function TenantLogoUploader({ tenant, isPrimary }: { tenant: Tenant; isPrimary: boolean }) {
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

        const oldUrl = tenant.logoUrl ?? null;
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setUploading(true);

        try {
            const updatedTenant = await uploadTenantLogo(file);

            if (user) {
                const updatedTenants = (user.tenants ?? []).map((t) =>
                    t.id === tenant.id ? { ...t, logoUrl: updatedTenant.logoUrl } : t
                );
                setUser({ ...user, tenants: updatedTenants });
            }

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
        <Avatar className="w-20 h-20">
            <AvatarImage
                src={previewUrl ?? tenant.logoUrl ?? undefined}
                alt={tenant.name}
                className="object-cover"
            />
            <AvatarFallback className="bg-muted text-muted-foreground">
                <Building2 className="w-10 h-10" />
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
                aria-label={`Upload logo for ${tenant.name}`}
                onChange={(e) => void handleFileChange(e)}
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Click to change logo"
                className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 group/logo disabled:cursor-not-allowed"
            >
                {avatar}

                <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/60 opacity-0 transition-opacity duration-150 group-hover/logo:opacity-100"
                >
                    {uploading ? (
                        <Loader2 className="w-5 h-5 text-ink-foreground animate-spin" />
                    ) : (
                        <Camera className="w-5 h-5 text-ink-foreground" />
                    )}
                </span>
            </button>
        </>
    );
}

export function TenantBrandingStep({ tenants }: { tenants: Tenant[] }) {
    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7 space-y-5">
            <div>
                <h2 className="text-lg font-bold">Company branding</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Upload a logo for your business so clients can recognize you.
                </p>
            </div>

            {tenants.length > 0 ? (
                <div className="space-y-4">
                    {tenants.map((tenant, index) => (
                        <div
                            key={tenant.id}
                            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/40"
                        >
                            <TenantLogoUploader tenant={tenant} isPrimary={index === 0} />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold truncate">{tenant.name}</h4>
                                <p className="text-xs text-muted-foreground truncate">
                                    @{tenant.slug}
                                </p>
                                <div className="flex gap-2 mt-1.5">
                                    <span className="inline-block text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-medium">
                                        {tenant.currency}
                                    </span>
                                    <span className="inline-block text-[10px] bg-muted-foreground/10 text-muted-foreground px-1.5 py-0.5 rounded font-medium">
                                        {tenant.timezone}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="px-4 py-3 text-sm rounded-xl bg-muted text-muted-foreground">
                    No company associated with this account yet.
                </p>
            )}
        </section>
    );
}
