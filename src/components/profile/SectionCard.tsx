import type { ReactNode } from "react";

interface SectionCardProps {
    kicker?: string;
    title?: string;
    description?: string;
    className?: string;
    children: ReactNode;
}

export function SectionCard({ kicker, title, description, className, children }: SectionCardProps) {
    const hasHeading = Boolean(kicker || title || description);

    return (
        <section
            className={`rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7 ${className ?? ""}`}
        >
            {hasHeading && (
                <div className="mb-5">
                    {kicker && (
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
                            {kicker}
                        </p>
                    )}
                    {title && <h2 className="mt-1 text-lg font-bold">{title}</h2>}
                    {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
                </div>
            )}
            {children}
        </section>
    );
}