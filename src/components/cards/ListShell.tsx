import type { ReactNode } from "react";

export function ListShell({ children }: { children: ReactNode }) {
    return (
        <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-(--shadow-card)">
            {children}
        </section>
    );
}