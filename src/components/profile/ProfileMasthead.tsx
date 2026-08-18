import { useRef, useState } from "react";
import { Camera, CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { uploadCoachAvatar, removeCoachAvatar } from "@/services/coaches";
import type { Coach } from "@/types/auth";

interface ProfileMastheadProps {
    user: Coach | null;
}

function MastheadAvatar({ user }: { user: Coach | null }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const setUser = useAuthStore((s) => s.setUser);

    const hasAvatar = Boolean(previewUrl ?? user?.avatarUrl);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Photo must be smaller than 5 MB.");
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setUploading(true);

        try {
            const updated = await uploadCoachAvatar(file);
            setUser(updated);
            setPreviewUrl(null);
            toast.success("Profile photo updated.");
        } catch {
            setPreviewUrl(null);
            toast.error("Failed to upload photo. Please try again.");
        } finally {
            setUploading(false);
            URL.revokeObjectURL(objectUrl);
        }
    };

    const handleRemove = async () => {
        setRemoving(true);
        try {
            const updated = await removeCoachAvatar();
            setUser(updated);
            toast.success("Profile photo removed.");
        } catch {
            toast.error("Failed to remove photo. Please try again.");
        } finally {
            setRemoving(false);
        }
    };

    const src = previewUrl ?? user?.avatarUrl ?? undefined;
    const busy = uploading || removing;
    const initials = user
        ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()
        : "";

    return (
        <div className="flex flex-col items-center gap-2">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-label="Upload profile photo"
                onChange={(e) => void handleFileChange(e)}
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                title="Click to change profile photo"
                className="relative shrink-0 rounded-full ring-2 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group/avatar disabled:cursor-not-allowed"
            >
                <Avatar className="w-16 h-16">
                    <AvatarImage src={src} alt={user ? `${user.firstName} ${user.lastName}` : ""} className="object-cover" />
                    <AvatarFallback className="bg-white/10 text-ink-foreground text-xl font-bold">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-150 group-hover/avatar:opacity-100"
                >
                    {uploading
                        ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                        : <Camera className="w-4 h-4 text-white" />
                    }
                </span>
            </button>

            {hasAvatar && (
                <button
                    type="button"
                    onClick={() => void handleRemove()}
                    disabled={busy}
                    className="text-[11px] font-bold text-ink-foreground/60 transition-colors hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {removing ? "Removing…" : "Remove photo"}
                </button>
            )}
        </div>
    );
}

export function ProfileMasthead({ user }: ProfileMastheadProps) {
    const tenantHandle = user?.tenants?.[0]?.slug ? `@${user.tenants[0].slug}` : "";
    const roleLine = [tenantHandle ? `Coach ${tenantHandle}` : "Coach"]
        .filter(Boolean)
        .join(" · ");

    return (
        <section className="rounded-2xl bg-ink text-ink-foreground shadow-(--shadow-card)">
            <div className="flex flex-col items-center gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-6">
                <MastheadAvatar user={user} />

                <div className="min-w-0 flex-1 text-center lg:text-left">
                    <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                        {user?.firstName} {user?.lastName}
                    </h1>
                    <p className="mt-1 text-sm text-ink-foreground/70">{roleLine}</p>
                    {user?.email && (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-ink-foreground/85">
                            <Mail className="h-3.5 w-3.5" />
                            {user.email}
                        </p>
                    )}
                    {user?.isEmailVerified && (
                        <span className="mt-3 ml-1 inline-flex items-center rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success ring-1 ring-inset ring-success/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            verified
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
}