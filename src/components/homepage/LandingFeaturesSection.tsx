import { Dumbbell, LineChart, Salad, Smartphone, Sparkles, Users } from "lucide-react";
import { LandingFeatureCard } from "./LandingFeatureCard";
import { useMouseParallax } from "@/hooks/shared/useMouseParallax";
import type { MouseParallaxMapping } from "@/hooks/shared/useMouseParallax";

const features = [
    { icon: Dumbbell, title: "Plan Builder", desc: "Drag & drop weeks, days and exercises. Ship a full mesocycle in minutes." },
    { icon: Users, title: "Client Monitoring", desc: "See what clients finish and what they skip in real time." },
    { icon: Sparkles, title: "AI Co-Pilot", desc: "Draft tailored plans from a client's goal, weight and level in seconds." },
    { icon: Salad, title: "Nutrition", desc: "Meals, macros and swaps the same clean builder as your workouts." },
    { icon: LineChart, title: "Analytics", desc: "Adherence, PRs, volume and streaks the numbers that matter." },
    { icon: Smartphone, title: "Client App", desc: "A beautiful mobile app your clients actually love opening." },
];

const xFactors = [2.4, -2, 1.8, -2.6, 2.2, -1.6];
const yFactors = [-1.6, 2, -2.2, 1.4, -1.8, 2.4];

const tiltMappings: MouseParallaxMapping[] = features.map((_, index) => ({
    xVar: `--card-ry${index}`,
    yVar: `--card-rx${index}`,
    xMul: xFactors[index],
    yMul: yFactors[index],
    unit: "deg",
}));

export function LandingFeaturesSection() {
    const parallaxRef = useMouseParallax(tiltMappings);

    return (
        <section id="features" className="relative mx-auto max-w-7xl px-6 pb-32 md:px-10">
            <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
                <div>
                    <p className="display text-xs uppercase tracking-[0.24em] text-muted-foreground">What's inside</p>
                    <h2 className="display mt-3 text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
                        A complete<br />coaching stack.
                    </h2>
                </div>
                <p className="max-w-md text-muted-foreground">
                    Stop stitching together five tools. Uply gives you one connected system for programs, tracking, nutrition and results.
                </p>
            </div>

            <div ref={parallaxRef} className="grid gap-5 md:grid-cols-3">
                {features.map((feature, index) => (
                    <LandingFeatureCard
                        key={feature.title}
                        icon={feature.icon}
                        title={feature.title}
                        desc={feature.desc}
                        tiltXVar={`--card-rx${index}`}
                        tiltYVar={`--card-ry${index}`}
                    />
                ))}
            </div>
        </section>
    );
}
