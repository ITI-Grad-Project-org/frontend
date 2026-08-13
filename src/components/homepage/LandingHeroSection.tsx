import { Link } from "react-router";
import { ArrowRight, Check, LayoutDashboard, Shield, Smartphone, Zap } from "lucide-react";
import { LandingFloatingArt } from "./LandingFloatingArt";
import { MOBILE_APP_URL } from "@/lib/links";

export function LandingHeroSection() {
    return (
        <section id="home" className="relative mx-auto max-w-7xl px-6 pb-40 pt-24 md:px-10 md:pt-32">
            <LandingFloatingArt />
            <div className="relative z-10 mx-auto max-w-4xl text-center reveal">
                <h1 className="display mt-8 text-[clamp(2.75rem,7vw,6.25rem)] font-semibold leading-[0.98] tracking-[-0.03em] animate-in zoom-in-75 blur-in-3xl duration-800">
                    <span className="block">Train smarter.</span>
                    <span className="block">Coach better.</span>
                    <span className="block text-shimmer">One platform.</span>
                </h1>

                <p className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground md:text-xl">
                    Everything coaches and clients need<br />dashboard, mobile app, plans, nutrition, and AI<br />connected in a single, elegant ecosystem.
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        to="/dashboard"
                        className="animate-in zoom-in-95 duration-600 btn-magnetic group relative inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 text-sm font-semibold text-brand-foreground shadow-(--shadow-accent)"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Open dashboard
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/20" />
                    </Link>
                    {MOBILE_APP_URL && (
                        <a
                            href={MOBILE_APP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="animate-in zoom-in-95 duration-600 btn-magnetic group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-7 py-4 text-sm font-semibold backdrop-blur transition hover:bg-white/8"
                        >
                            <Smartphone className="h-4 w-4" />
                            Open mobile app
                        </a>
                    )}
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-brand" /> Free 14-day trial</span>
                    <span className="inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-brand" /> Cancel anytime</span>
                    <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-brand" /> Ships worldwide</span>
                </div>
            </div>
        </section>
    );
}