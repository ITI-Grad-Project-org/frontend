import { useRef, useState } from "react";
import { Camera, Loader2, User as UserIcon } from "lucide-react";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { uploadCoachAvatar, removeCoachAvatar } from "@/services/coaches";

export function ProfilePhotoUploader() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const user = useAuthStore((s) => s.user);
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

    return (
        <div className="flex flex-col items-center">
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

            {hasAvatar && (
                <button
                    type="button"
                    onClick={() => void handleRemove()}
                    disabled={busy}
                    className="mt-2 text-xs font-bold text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {removing ? "Removing…" : "Remove photo"}
                </button>
            )}
        </div>
    );
}
