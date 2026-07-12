import { LandingDashboardMock } from "./LandingDashboardMock";
import { LandingMobileMock } from "./LandingMobileMock";

type LandingEcosystemSectionProps = {
    x: number;
    y: number;
};

export function LandingEcosystemSection({ x, y }: LandingEcosystemSectionProps) {
    return (
        <section id="dashboard" className="relative mx-auto max-w-7xl px-6 pb-40 md:px-10">
            <div className="mx-auto mb-14 max-w-2xl text-center">
                <p className="display text-xs uppercase tracking-[0.24em] text-muted-foreground">The ecosystem</p>
                <h2 className="display mt-3 text-4xl font-semibold tracking-[-0.02em] md:text-6xl">
                    Web and mobile,<br />built as one.
                </h2>
            </div>

            <div className="relative">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-10 bottom-0 h-64 blur-3xl"
                    style={{ background: "radial-gradient(60% 100% at 50% 100%, oklch(0.78 0.19 42 / 0.25), transparent 70%)" }}
                />

                <div
                    className="relative mx-auto max-w-5xl"
                    style={{ transform: `perspective(1600px) rotateX(14deg) rotateY(${x * -2}deg) rotateZ(${x * 0.6}deg)` }}
                >
                    <div className="glass-panel overflow-hidden p-4 shadow-[0_60px_140px_-40px_rgba(0,0,0,0.7)] md:p-6">
                        <LandingDashboardMock />
                    </div>
                </div>

                <div
                    id="mobile"
                    className="absolute -right-2 top-8 hidden w-56 md:block"
                    style={{ transform: `translate(${x * 10}px, ${y * 10}px) rotate(6deg)` }}
                >
                    <LandingMobileMock />
                </div>
            </div>
        </section>
    );
}
