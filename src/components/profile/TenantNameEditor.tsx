import { useState } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/auth-store";
import { updateTenantName } from "@/services/tenant";

interface TenantNameEditorProps {
    tenantId: string;
    name: string;
}

export function TenantNameEditor({ tenantId, name }: TenantNameEditorProps) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(name);
    const [saving, setSaving] = useState(false);
    const setUser = useAuthStore((s) => s.setUser);
    const user = useAuthStore((s) => s.user);

    const commit = async () => {
        const trimmed = value.trim();
        if (!trimmed || trimmed === name) {
            setValue(name);
            setEditing(false);
            return;
        }
        if (trimmed.length > 150) {
            toast.error("Company name must be 150 characters or fewer.");
            return;
        }

        setSaving(true);
        try {
            const updatedTenant = await updateTenantName(trimmed);

            if (user) {
                const updatedTenants = (user.tenants ?? []).map((t) =>
                    t.id === tenantId ? { ...t, name: updatedTenant.name } : t
                );
                setUser({ ...user, tenants: updatedTenants });
            }

            setEditing(false);
            toast.success("Company name updated.");
        } catch {
            toast.error("Failed to update company name. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (!editing) {
        return (
            <span className="group/name inline-flex items-center gap-1.5 min-w-0">
                <span className="truncate">{name}</span>
                <button
                    type="button"
                    onClick={() => {
                        setValue(name);
                        setEditing(true);
                    }}
                    aria-label={`Rename ${name}`}
                    title="Rename company"
                    className="p-0.5 rounded cursor-pointer text-muted-foreground opacity-0 transition-opacity hover:text-brand focus-visible:opacity-100 group-hover/name:opacity-100"
                >
                    <Pencil className="w-3 h-3" />
                </button>
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 min-w-0">
            <input
                autoFocus
                type="text"
                value={value}
                maxLength={150}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") void commit();
                    if (e.key === "Escape") {
                        setValue(name);
                        setEditing(false);
                    }
                }}
                aria-label="Company name"
                className="w-full min-w-0 px-1.5 py-0.5 text-sm font-semibold rounded-md border border-brand/40 bg-background focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
            {saving ? (
                <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
            ) : (
                <>
                    <button
                        type="button"
                        onClick={() => void commit()}
                        aria-label="Save company name"
                        className="cursor-pointer text-success hover:opacity-80"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setValue(name);
                            setEditing(false);
                        }}
                        aria-label="Cancel rename"
                        className="cursor-pointer text-muted-foreground hover:text-danger"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </>
            )}
        </span>
    );
}