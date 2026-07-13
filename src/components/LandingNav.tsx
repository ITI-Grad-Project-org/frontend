import { Link } from "react-router";
import { ArrowRight, CircleUserRound } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "../theme";

const navItems = [
    { label: "The Ecosystem", href: "#ecosystem" },
    // { label: "Mobile app", href: "#mobile" },
    { label: "Features", href: "#features" },
    { label: "Access", href: "#access" },
    // { label: "Contact", href: "#contact" },
];

export function LandingNav() {
    const { isDark } = useTheme();
    const user = useAuthStore((state) => state.user);
    const accessToken = useAuthStore((state) => state.accessToken);
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();

    const handleAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (!href.startsWith("#")) return;

        event.preventDefault();
        const target = document.querySelector<HTMLElement>(href);

        if (target) {
            const top = target.getBoundingClientRect().top + window.scrollY - 96;
            window.scrollTo({ top, behavior: "smooth" });
            window.history.pushState(null, "", href);
        }
    };

    return (
        // <header className="glass-nav sticky top-4 z-50 mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2.5 md:px-4">
        <header className="sticky top-0 z-50 mx-auto flex items-center justify-between lg:justify-center lg:gap-30 lg:py-5 px-3 py-2.5  glass-nav">
            {/* <Link to="/" className="flex items-center gap-2 pl-3">
                <img
                    src={isDark ? "/Uply-light-logo.webp" : "/Uply-dark-logo.webp"}
                    alt="UPLY"
                    className="w-auto h-6 md:h-8"
                />
            </Link> */}
            <a href="#home" className="flex items-center gap-2 pl-3" onClick={(event) => handleAnchorClick(event, "#home")}>
                <img
                    src={isDark ? "/Uply-light-logo.webp" : "/Uply-dark-logo.webp"}
                    alt="UPLY"
                    className="w-auto h-6 md:h-8"
                />
            </a>
            <nav className="items-center hidden gap-1 text-sm md:flex">
                {navItems.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        onClick={(event) => handleAnchorClick(event, item.href)}
                        className="px-4 py-2 transition rounded-full text-muted-foreground hover:bg-white/6 hover:text-foreground"
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
                            className="btn-magnetic group inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-(--shadow-accent) sm:px-5"
                        >
                            <CircleUserRound className="w-4 h-4" />
                            Profile
                        </Link>
                    </>
                ) : (
                    <>
                        <Link
                            to="/signin"
                            className="group inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold"
                        >
                            Sign in
                            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </Link>

                        <Link
                            to="/signup"
                            className="btn-magnetic group inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-(--shadow-accent)"
                        >
                            Get started
                            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}
