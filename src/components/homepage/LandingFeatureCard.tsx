import type { ComponentType } from "react";

type LandingFeatureCardProps = {
    icon: ComponentType<{ className?: string }>;
    title: string;
    desc: string;
    tiltXVar?: string;
    tiltYVar?: string;
};

export function LandingFeatureCard({ icon: Icon, title, desc, tiltXVar, tiltYVar }: LandingFeatureCardProps) {
    return (
        <div
            className="glass-panel group relative overflow-hidden p-7 transition-[border-color] duration-200 hover:border-white/20"
            style={
                tiltXVar
                    ? { transform: `perspective(900px) rotateX(var(${tiltXVar}, 0deg)) rotateY(var(${tiltYVar}, 0deg))` }
                    : undefined
            }
        >
            <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-2xl transition group-hover:opacity-100"
                style={{ background: "radial-gradient(circle, oklch(0.78 0.19 42 / 0.45), transparent 70%)" }}
            />
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-brand">
                <Icon className="h-5 w-5" />
            </span>
            <h3 className="display mt-5 text-xl font-semibold tracking-[-0.01em]">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
        </div>
    );
}