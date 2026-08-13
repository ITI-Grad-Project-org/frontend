import { useDocumentTitle } from "@/hooks/shared/useDocumentTitle";
import { LandingNav } from "@/components/homepage/LandingNav";
import { LandingFooter } from "@/components/homepage/LandingFooter";

export default function Terms() {
    useDocumentTitle("Terms of Service · Uply");

    return (
        <div className="landing-page relative min-h-screen overflow-x-clip bg-background text-foreground">
            <div
                aria-hidden
                className="fixed inset-0 pointer-events-none -z-20"
                style={{
                    background:
                        "radial-gradient(1200px 700px at 80% -10%, oklch(0.78 0.19 42 / 0.18), transparent 60%), radial-gradient(900px 600px at 10% 110%, oklch(0.55 0.15 260 / 0.16), transparent 60%)",
                }}
            />
            <LandingNav />
            <main className="mx-auto max-w-3xl px-6 pb-32 pt-24 md:px-10">
                <h1 className="display text-4xl font-semibold tracking-[-0.02em] md:text-5xl">Terms of Service</h1>
                <p className="mt-3 text-sm text-muted-foreground">Last updated: {new Date().getFullYear()}</p>
                <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
                    <section>
                        <h2 className="display text-lg font-semibold text-foreground">Using Uply</h2>
                        <p>
                            This is placeholder legal copy. You're responsible for the coaching plans and advice you
                            deliver through the platform. Replace this text with your final terms before going live.
                        </p>
                    </section>
                    <section>
                        <h2 className="display text-lg font-semibold text-foreground">Subscriptions &amp; billing</h2>
                        <p>
                            Plans start with a free 14-day trial. You can cancel anytime from your dashboard. Billing
                            details for recurring plans go here.
                        </p>
                    </section>
                    <section>
                        <h2 className="display text-lg font-semibold text-foreground">Your content</h2>
                        <p>
                            You keep ownership of everything you create. Uply only uses it to deliver the service back
                            to you and your clients.
                        </p>
                    </section>
                    <section>
                        <h2 className="display text-lg font-semibold text-foreground">Contact</h2>
                        <p>
                            Questions about these terms? Reach out through the homepage footer. This placeholder should
                            point to your real contact channel.
                        </p>
                    </section>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}