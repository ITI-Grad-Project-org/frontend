import { LandingDashboardMock } from "./LandingDashboardMock";
import { LandingMobileMock } from "./LandingMobileMock";

type LandingEcosystemSectionProps = {
    x: number;
    y: number;
};

export function LandingEcosystemSection({ x, y }: LandingEcosystemSectionProps) {
    return (
        <section id="ecosystem" className="relative px-6 pb-40 mx-auto max-w-7xl md:px-10">
            <div className="max-w-2xl mx-auto text-center mb-14">
                <p className="display text-xs uppercase tracking-[0.24em] text-muted-foreground">The ecosystem</p>
                <h2 className="display mt-3 text-4xl font-semibold tracking-[-0.02em] md:text-6xl">
                    Web and mobile,<br />built as one.
                </h2>
            </div>

            <div className="relative">
                <div
                    aria-hidden
                    className="absolute bottom-0 h-64 pointer-events-none inset-x-10 blur-3xl"
                    style={{ background: "radial-gradient(60% 100% at 50% 100%, oklch(0.78 0.19 42 / 0.25), transparent 70%)" }}
                />

                <div
                    className="relative max-w-5xl mx-auto"
                    style={{ transform: `perspective(1600px) rotateX(14deg) rotateY(${x * -2}deg) rotateZ(${x * 0.6}deg)` }}
                >
                    <div className="glass-panel overflow-hidden p-4 shadow-[0_60px_140px_-40px_rgba(0,0,0,0.7)] md:p-6">
                        <LandingDashboardMock />
                    </div>
                </div>

                <div
                    id="mobile"
                    className="absolute hidden w-56 -right-2 top-8 md:block"
                    style={{ transform: `translate(${x * 10}px, ${y * 10}px) rotate(6deg)` }}
                >
                    <LandingMobileMock />
                </div>
            </div>
        </section>
    );
}
