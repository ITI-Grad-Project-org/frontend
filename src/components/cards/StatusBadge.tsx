export type BadgeVariant = "brand" | "success" | "warning" | "muted" | "destructive";

const badgeStyles: Record<BadgeVariant, string> = {
    brand: "bg-brand/10 text-brand border-brand/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warn/10 text-warn border-warn/20",
    muted: "bg-muted text-muted-foreground border-border",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
};

export function Badge({ label, variant }: { label: string; variant: BadgeVariant }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${badgeStyles[variant]}`}
        >
            {label}
        </span>
    );
}