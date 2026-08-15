import { LandingAccessSection } from "@/components/homepage/LandingAccessSection";
import { LandingEcosystemSection } from "@/components/homepage/LandingEcosystemSection";
import { LandingFaqSection } from "@/components/homepage/LandingFaqSection";
import { LandingFeaturesSection } from "@/components/homepage/LandingFeaturesSection";
import { LandingFooter } from "@/components/homepage/LandingFooter";
import { LandingNav } from "@/components/homepage/LandingNav";
import { LandingHeroSection } from "@/components/homepage/LandingHeroSection";
import { LandingPricingSection } from "@/components/homepage/LandingPricingSection";
import { LandingTestimonialsSection } from "@/components/homepage/LandingTestimonialsSection";
import { useDocumentTitle } from "@/hooks/shared/useDocumentTitle";

export default function Homepage() {
    useDocumentTitle("Uply");

    return (
        <div className="landing-page relative min-h-screen overflow-x-clip bg-background text-foreground">
            <div aria-hidden className="fixed inset-0 pointer-events-none -z-20">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(1200px 700px at 80% -10%, oklch(0.78 0.19 42 / 0.18), transparent 60%), radial-gradient(900px 600px at 10% 110%, oklch(0.55 0.15 260 / 0.16), transparent 60%), radial-gradient(700px 500px at 50% 50%, oklch(0.3 0.02 260 / 0.4), transparent 70%)",
                    }}
                />
                <div className="absolute inset-0 grid-bg opacity-60 hidden md:block" />
                <div
                    className="absolute rounded-full -left-40 top-1/3 h-105 w-105 opacity-40 blur-3xl hidden md:block"
                    style={{ background: "radial-gradient(circle, oklch(0.78 0.19 42 / 0.35), transparent 60%)" }}
                />
                <div
                    className="absolute rounded-full -right-32 top-10 h-130 w-130 opacity-30 blur-3xl hidden md:block"
                    style={{ background: "radial-gradient(circle, oklch(0.6 0.18 260 / 0.35), transparent 60%)" }}
                />
            </div>

            <LandingNav />

            <LandingHeroSection />

            <LandingEcosystemSection />

            <LandingFeaturesSection />

            <LandingPricingSection />

            <LandingTestimonialsSection />

            <LandingAccessSection />

            <LandingFaqSection />

            <LandingFooter />
        </div>
    );
}
