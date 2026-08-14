import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, CircleUserRound, Menu, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "@/theme";

const navItems = [
    { label: "The Ecosystem", href: "#ecosystem" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Access", href: "#access" },
];

const sectionIds = ["home", ...navItems.map((item) => item.href.slice(1))];

export function LandingNav() {
    const { isDark } = useTheme();
    const user = useAuthStore((state) => state.user);
    const accessToken = useAuthStore((state) => state.accessToken);
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();

    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [active, setActive] = useState("home");

    const handleAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith("#")) {
            event.preventDefault();
            const target = document.querySelector<HTMLElement>(href);

            if (target) {
                const top = target.getBoundingClientRect().top + window.scrollY - 96;
                const isMobile = window.matchMedia("(max-width: 767.98px)").matches;
                window.scrollTo({ top, behavior: isMobile ? "auto" : "smooth" });
                window.history.pushState(null, "", href);
            }
        }

        setOpen(false);
    };

    useEffect(() => {
        let raf = 0;
        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                setScrolled(window.scrollY > 12);

                let current = "home";
                for (const id of sectionIds) {
                    const el = document.getElementById(id);
                    if (el && el.getBoundingClientRect().top <= 160) current = id;
                }
                setActive((prev) => (prev === current ? prev : current));
            });
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <div className={`sticky top-4 z-50 mx-auto w-[min(100%-1.5rem,72rem)] transition-all ${scrolled ? "top-3" : ""}`}>
            <header className={`glass-nav flex items-center justify-between rounded-full px-3 py-2.5 transition-all md:px-4 ${scrolled ? "shadow-[0_18px_50px_-20px_rgba(0,0,0,0.6)]" : ""}`}>
                <Link to={'/'} className="flex items-center gap-2 pl-3" onClick={(event) => handleAnchorClick(event, "/")}>
                    <img
                        src={isDark ? "/uply-logo-extra-bold-dark-transparent.webp" : "/uply-logo-extra-bold-transparent.webp"}
                        alt="UPLY"
                        className="w-auto h-6 md:h-8"
                    />
                </Link>
                <nav className="items-center hidden gap-1 text-sm md:flex">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={(event) => handleAnchorClick(event, item.href)}
                            className={`px-4 py-2 transition rounded-full ${active === item.href.slice(1)
                                ? "text-foreground bg-white/6"
                                : "text-muted-foreground hover:bg-white/6 hover:text-foreground"
                                }`}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-1.5">
                    {accessToken ? (
                        <>
                            <span className="hidden px-3 text-sm font-semibold text-foreground sm:block">
                                {fullName || "Coach"}
                            </span>
                            <Link
                                to="/profile"
                                className="btn-magnetic group inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground shadow-(--shadow-accent) sm:px-5 sm:py-2.5 sm:text-sm"
                            >
                                <CircleUserRound className="w-4 h-4" />
                                Profile
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/signin"
                                className="group hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold sm:px-5 sm:py-2.5 sm:text-sm"
                            >
                                Sign in
                                <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5 sm:h-3.5 sm:w-3.5" />
                            </Link>

                            <Link
                                to="/signup"
                                className="btn-magnetic group inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-brand-foreground shadow-(--shadow-accent) sm:px-5 sm:py-2.5 sm:text-sm"
                            >
                                Get started
                                <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5 sm:h-3.5 sm:w-3.5" />
                            </Link>
                        </>
                    )}

                    <button
                        type="button"
                        aria-label="Toggle navigation menu"
                        aria-expanded={open}
                        className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-white/6 md:hidden"
                        onClick={() => setOpen((value) => !value)}
                    >
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </header>

            {open && (
                <div className="glass-nav mt-2 flex flex-col gap-1 rounded-2xl p-2 md:hidden">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={(event) => handleAnchorClick(event, item.href)}
                            className={`rounded-xl px-4 py-3 text-sm font-medium transition ${active === item.href.slice(1)
                                ? "text-foreground bg-white/6"
                                : "text-muted-foreground hover:bg-white/6 hover:text-foreground"
                                }`}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}