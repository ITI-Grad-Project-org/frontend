import { Link } from "react-router";
import { ArrowRight, Check } from "lucide-react";
import { useMouseParallax } from "@/hooks/shared/useMouseParallax";
import type { MouseParallaxMapping } from "@/hooks/shared/useMouseParallax";

type Plan = {
    name: string;
    price: string;
    period: string;
    desc: string;
    features: string[];
    highlighted?: boolean;
};

const plans: Plan[] = [
    {
        name: "Starter",
        price: "$0",
        period: "forever",
        desc: "For coaches testing the waters with a handful of clients.",
        features: ["Up to 3 clients", "Plan builder", "Client app access", "Basic analytics"],
    },
    {
        name: "Solo",
        price: "$29",
        period: "per month",
        desc: "The full coaching stack for independent coaches.",
        highlighted: true,
        features: [
            "Unlimited clients",
            "AI plan co-pilot",
            "Nutrition builder",
            "Advanced analytics",
            "Reviews & reputation",
        ],
    },
    {
        name: "Studio",
        price: "$79",
        period: "per month",
        desc: "For growing teams that coach together.",
        features: ["Everything in Solo", "3 coach seats", "Shared client pool", "Priority support"],
    },
];

const xFactors = [2.4, -2, 1.8];
const yFactors = [-1.6, 2, -2.2];

const tiltMappings: MouseParallaxMapping[] = plans.map((_, index) => ({
    xVar: `--plan-ry${index}`,
    yVar: `--plan-rx${index}`,
    xMul: xFactors[index],
    yMul: yFactors[index],
    unit: "deg",
}));

export function LandingPricingSection() {
    const parallaxRef = useMouseParallax(tiltMappings);

    return (
        <section id="pricing" className="relative mx-auto max-w-7xl px-6 pb-32 md:px-10">
            <div className="mb-14 text-center">
                <p className="display text-xs uppercase tracking-[0.24em] text-muted-foreground">Pricing</p>
                <h2 className="display mx-auto mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
                    Simple pricing for serious coaches.
                </h2>
                <p className="mx-auto mt-4 max-w-md text-muted-foreground">
                    Start with a free plan. Upgrade when you're ready, cancel anytime.
                </p>
            </div>

            <div ref={parallaxRef} className="grid gap-5 md:grid-cols-3">
                {plans.map((plan, index) => (
                    <div
                        key={plan.name}
                        className={`glass-panel relative flex flex-col overflow-hidden p-7 transition-[border-color] duration-200 ${
                            plan.highlighted ? "ring-1 ring-brand/40" : "hover:border-white/20"
                        }`}
                        style={{
                            transform: `perspective(900px) rotateX(var(--plan-rx${index}, 0deg)) rotateY(var(--plan-ry${index}, 0deg))`,
                        }}
                    >
                        {plan.highlighted && (
                            <span className="absolute right-5 top-5 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-brand-foreground">
                                Most popular
                            </span>
                        )}
                        <h3 className="display text-lg font-semibold">{plan.name}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
                        <div className="mt-5 flex items-baseline gap-1.5">
                            <span className="display text-5xl font-semibold tracking-[-0.03em]">{plan.price}</span>
                            <span className="text-sm text-muted-foreground">{plan.period}</span>
                        </div>
                        <ul className="mt-6 flex-1 space-y-2.5">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Check className="h-4 w-4 shrink-0 text-brand" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Link
                            to="/signup"
                            className={`btn-magnetic group mt-7 inline-flex items-center justify-center gap-1.5 rounded-full px-6 py-3 text-sm font-semibold ${
                                plan.highlighted
                                    ? "bg-brand text-brand-foreground shadow-(--shadow-accent)"
                                    : "border border-white/10 bg-white/4 hover:bg-white/8"
                            }`}
                        >
                            Start free trial
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}