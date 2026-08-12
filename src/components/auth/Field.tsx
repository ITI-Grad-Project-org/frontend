import type { InputHTMLAttributes } from "react";

export function Field({ label, error, ...props }: { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
            <input
                {...props}
                className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
            />
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </label>
    );
}