import { Star } from "lucide-react";
import { useMouseParallax } from "@/hooks/shared/useMouseParallax";
import type { MouseParallaxMapping } from "@/hooks/shared/useMouseParallax";

const testimonials = [
    {
        quote:
            "I used to run coaching across four different apps. Now my clients check off their sessions in the app and I see adherence without asking.",
        name: "Marcus Reed",
        role: "Strength coach · Agile Method",
        initials: "MR",
    },
    {
        quote:
            "The plan builder with drag & drop is the fastest I've used. I shipped a 12-week mesocycle before my coffee went cold.",
        name: "Priya Nair",
        role: "Online coach · 40+ clients",
        initials: "PN",
    },
    {
        quote:
            "The AI drafts the skeleton and I refine it. Nutrition plans, programs, everything in one dashboard — it just clicks.",
        name: "Tomás Silva",
        role: "Hybrid coach · S&C",
        initials: "TS",
    },
];

const xFactors = [2.2, -2.4, 1.6];
const yFactors = [-1.8, 2.1, -2];

const tiltMappings: MouseParallaxMapping[] = testimonials.map((_, index) => ({
    xVar: `--review-ry${index}`,
    yVar: `--review-rx${index}`,
    xMul: xFactors[index],
    yMul: yFactors[index],
    unit: "deg",
}));

export function LandingTestimonialsSection() {
    const parallaxRef = useMouseParallax(tiltMappings);

    return (
        <section className="relative mx-auto max-w-7xl px-6 pb-32 md:px-10">
            <div className="mb-14 text-center">
                <p className="display text-xs uppercase tracking-[0.24em] text-muted-foreground">Loved by coaches</p>
                <h2 className="display mx-auto mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
                    Coaches who stop juggling tools.
                </h2>
            </div>

            <div ref={parallaxRef} className="grid gap-5 md:grid-cols-3">
                {testimonials.map((item, index) => (
                    <figure
                        key={item.name}
                        className="glass-panel flex flex-col p-7 transition-[border-color] duration-200 hover:border-white/20"
                        style={{
                            transform: `perspective(900px) rotateX(var(--review-rx${index}, 0deg)) rotateY(var(--review-ry${index}, 0deg))`,
                        }}
                    >
                        <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, starIndex) => (
                                <Star key={starIndex} className="h-4 w-4 fill-brand text-brand" />
                            ))}
                        </div>
                        <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                            &ldquo;{item.quote}&rdquo;
                        </blockquote>
                        <figcaption className="mt-6 flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-brand">
                                {item.initials}
                            </span>
                            <span>
                                <span className="block text-sm font-semibold">{item.name}</span>
                                <span className="block text-xs text-muted-foreground">{item.role}</span>
                            </span>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </section>
    );
}