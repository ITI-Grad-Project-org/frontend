import { useRef, useState } from "react";
import { Calendar, Globe2, User as UserIcon, Camera, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { uploadCoachAvatar, removeCoachAvatar } from "@/services/coaches";
import type { Coach } from "@/types/auth";

interface UserCardProps {
    user: Coach | null;
}

function CoachAvatar({ user }: { user: Coach | null }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const setUser = useAuthStore((s) => s.setUser);

    const hasAvatar = Boolean(previewUrl ?? user?.avatarUrl);

    // ── Upload new avatar ─────────────────────────────────────────────────────

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
            // PUT /coaches/me/avatar
            const updated = await uploadCoachAvatar(file);
            setUser(updated);
            setPreviewUrl(null); // server URL now in updated.avatarUrl
            toast.success("Profile photo updated.");
        } catch {
            setPreviewUrl(null);
            toast.error("Failed to upload photo. Please try again.");
        } finally {
            setUploading(false);
            URL.revokeObjectURL(objectUrl);
        }
    };

    // ── Remove avatar ─────────────────────────────────────────────────────────

    const handleRemove = async () => {
        setRemoving(true);
        try {
            // DELETE /coaches/me/avatar
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

    return (
        <div className="flex flex-col items-center mb-4">
            {/* Clickable avatar with camera overlay */}
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
                className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 group/avatar disabled:cursor-not-allowed"
            >
                <Avatar className="w-24 h-24">
                    <AvatarImage src={src} alt={user ? `${user.firstName} ${user.lastName}` : ""} className="object-cover" />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                        <UserIcon className="w-12 h-12" />
                    </AvatarFallback>
                </Avatar>

                {/* Overlay on hover */}
                <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/60 opacity-0 transition-opacity duration-150 group-hover/avatar:opacity-100"
                >
                    {uploading
                        ? <Loader2 className="w-6 h-6 text-ink-foreground animate-spin" />
                        : <Camera className="w-6 h-6 text-ink-foreground" />
                    }
                </span>
            </button>

            {/* Remove link — only shown when avatar exists */}
            {hasAvatar && (
                <button
                    type="button"
                    onClick={() => void handleRemove()}
                    disabled={busy}
                    className="mt-1.5 text-[11px] font-bold text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {removing ? "Removing…" : "Remove photo"}
                </button>
            )}
        </div>
    );
}

export function UserCard({ user }: UserCardProps) {
    const detailRowClass = "flex items-center justify-between gap-3 text-sm";
    const valueClass = "text-right font-medium text-foreground";
    const labelClass = "text-muted-foreground";
    const priceRange =
        user?.priceFrom != null || user?.priceTo != null
            ? `${user?.priceFrom ?? "?"} - ${user?.priceTo ?? "?"} ${user?.tenants?.[0]?.currency ?? ""}`
            : "N/A";

    return (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) text-center flex flex-col items-center">
            <CoachAvatar user={user} />

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

            {/* <div className="w-full border-t border-border my-4 pt-4 space-y-3 text-left">
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
            </div> */}

            <div className="w-full border-t border-border pt-4 space-y-3 text-left text-sm">
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
                {/* <div className={detailRowClass}>
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <Clock3 className="w-4 h-4" /> Last login
                    </span>
                    <span className={valueClass}>
                        {user?.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
                            : "N/A"}
                    </span>
                </div> */}
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
