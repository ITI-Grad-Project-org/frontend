import { Link } from "react-router";
import { LayoutDashboard, Smartphone } from "lucide-react";
import dumbbell1 from "../assets/dumbbell-1.png";

export function LandingAccessSection() {
    return (
        <section id="access" className="relative mx-auto max-w-6xl px-6 pb-32 md:px-10">
            <div className="glass-panel relative overflow-hidden p-10 md:p-16">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{ background: "radial-gradient(600px 300px at 85% 20%, oklch(0.78 0.19 42 / 0.35), transparent 60%)" }}
                />
                <div className="relative grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
                    <div>
                        <h2 className="display text-4xl font-semibold tracking-[-0.02em] md:text-6xl">
                            Ready to coach<br />at a higher level?
                        </h2>
                        <p className="mt-5 max-w-md text-muted-foreground">
                            Jump into the dashboard or grab the mobile app, it's on us for 14 days.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                to="/dashboard"
                                className="btn-magnetic inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground shadow-(--shadow-accent)"
                            >
                                <LayoutDashboard className="h-4 w-4" /> Open dashboard
                            </Link>
                            <a
                                href="#"
                                className="btn-magnetic inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-6 py-3.5 text-sm font-semibold backdrop-blur hover:bg-white/8"
                            >
                                <Smartphone className="h-4 w-4" /> Open mobile app
                            </a>
                        </div>
                    </div>
                    <div className="hidden justify-end md:flex">
                        <img
                            src={dumbbell1}
                            alt=""
                            width={520}
                            height={520}
                            className="float-b w-65 max-w-full opacity-90 drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]"
                            style={{ ["--rot" as string]: "-8deg" }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
