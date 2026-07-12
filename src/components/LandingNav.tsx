import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { useTheme } from "../theme";

const navItems = [
    { label: "Dashboard", href: "#dashboard" },
    { label: "Mobile app", href: "#mobile" },
    { label: "Features", href: "#features" },
    { label: "Access", href: "#access" },
    // { label: "Contact", href: "#contact" },
];

export function LandingNav() {
    const { isDark } = useTheme();

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
        <header className="glass-nav sticky top-4 z-50 mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2.5 md:px-4">
            {/* <Link to="/" className="flex items-center gap-2 pl-3">
                <img
                    src={isDark ? "/Uply-light-logo.png" : "/Uply-dark-logo.png"}
                    alt="UPLY"
                    className="h-6 w-auto md:h-8"
                />
            </Link> */}
            <a href="#home" className="flex items-center gap-2 pl-3" onClick={(event) => handleAnchorClick(event, "#home")}>
                <img
                    src={isDark ? "/Uply-light-logo.png" : "/Uply-dark-logo.png"}
                    alt="UPLY"
                    className="h-6 w-auto md:h-8"
                />
            </a>
            <nav className="hidden items-center gap-1 text-sm md:flex">
                {navItems.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        onClick={(event) => handleAnchorClick(event, item.href)}
                        className="rounded-full px-4 py-2 text-muted-foreground transition hover:bg-white/6 hover:text-foreground"
                    >
                        {item.label}
                    </a>
                ))}
            </nav>

            <div>

                <Link
                    to="/signin"
                    className="group inline-flex items-center gap-1.5 rounded-full  px-5 py-2.5 text-sm font-semibold"
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
            </div>
        </header>
    );
}
