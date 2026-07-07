import { useEffect, useState } from "react";
import { LandingAccessSection } from "../components/LandingAccessSection";
import { LandingEcosystemSection } from "../components/LandingEcosystemSection";
import { LandingFeaturesSection } from "../components/LandingFeaturesSection";
import { LandingFooter } from "../components/LandingFooter";
import { LandingNav } from "../components/LandingNav";
import { useTheme } from "../theme";
import { LandingHeroSection } from "@/components/LandingHeroSection";

function useMouseParallax() {
    const [xy, setXy] = useState({ x: 0, y: 0 });

    useEffect(() => {
        let raf = 0;
        const onMove = (event: MouseEvent) => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const nx = (event.clientX / window.innerWidth - 0.5) * 2;
                const ny = (event.clientY / window.innerHeight - 0.5) * 2;
                setXy({ x: nx, y: ny });
            });
        };

        window.addEventListener("mousemove", onMove);
        return () => {
            window.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(raf);
        };
    }, []);

    return xy;
}

export default function Homepage() {
    const { setTheme } = useTheme();

    useEffect(() => {
        setTheme("dark");
    }, [setTheme]);

    const { x, y } = useMouseParallax();

    return (
        <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
            <div aria-hidden className="pointer-events-none fixed inset-0 -z-20">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(1200px 700px at 80% -10%, oklch(0.78 0.19 42 / 0.18), transparent 60%), radial-gradient(900px 600px at 10% 110%, oklch(0.55 0.15 260 / 0.16), transparent 60%), radial-gradient(700px 500px at 50% 50%, oklch(0.3 0.02 260 / 0.4), transparent 70%)",
                    }}
                />
                <div className="grid-bg absolute inset-0 opacity-60" />
                <div
                    className="absolute -left-40 top-1/3 h-105 w-105 rounded-full opacity-40 blur-3xl"
                    style={{ background: "radial-gradient(circle, oklch(0.78 0.19 42 / 0.35), transparent 60%)" }}
                />
                <div
                    className="absolute -right-32 top-10 h-130 w-130 rounded-full opacity-30 blur-3xl"
                    style={{ background: "radial-gradient(circle, oklch(0.6 0.18 260 / 0.35), transparent 60%)" }}
                />
            </div>

            <LandingNav />

            <LandingHeroSection x={x} y={y} />

            <LandingEcosystemSection x={x} y={y} />

            <LandingFeaturesSection />

            <LandingAccessSection />

            <LandingFooter />
        </div>
    );
}
