import { useState } from "react";
import { Plus } from "lucide-react";

type FaqItem = {
    q: string;
    a: string;
};

const faqs: FaqItem[] = [
    {
        q: "Is there a free plan?",
        a: "Yes. The Starter plan is free forever with up to 3 clients, plan builder, and client app access. Upgrade to Solo or Studio anytime for unlimited clients and advanced features.",
    },
    {
        q: "How does the AI plan co-pilot work?",
        a: "Enter a client's goal, weight and experience level and the co-pilot drafts a full program or nutrition plan. You review, tweak with drag & drop, and ship it.",
    },
    {
        q: "Which plans can my clients see?",
        a: "Everything you assign. Clients use the mobile app to check off workouts, log nutrition and chat — they only see what you share.",
    },
    {
        q: "Can I cancel anytime?",
        a: "Anytime, in two clicks from your dashboard. No hoops, no cancellation fee, no hard feelings.",
    },
];

export function LandingFaqSection() {
    const [openItem, setOpenItem] = useState<number | null>(0);

    return (
        <section className="relative mx-auto max-w-3xl px-6 pb-32 md:px-10">
            <div className="mb-12 text-center">
                <p className="display text-xs uppercase tracking-[0.24em] text-muted-foreground">FAQ</p>
                <h2 className="display mt-3 text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
                    Questions, answered.
                </h2>
            </div>

            <div className="space-y-3">
                {faqs.map((item, index) => {
                    const isOpen = openItem === index;
                    return (
                        <div key={item.q} className="glass-panel overflow-hidden">
                            <button
                                type="button"
                                aria-expanded={isOpen}
                                onClick={() => setOpenItem(isOpen ? null : index)}
                                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold"
                            >
                                {item.q}
                                <Plus
                                    className={`h-5 w-5 shrink-0 text-brand transition-transform ${isOpen ? "rotate-45" : ""}`}
                                />
                            </button>
                            <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                                <div className="overflow-hidden min-h-0">
                                    <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}