import { Link } from "react-router";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useTheme } from "@/theme";

interface ProfileHeaderProps {
    onSignOut: () => void;
    eyebrow?: string;
    title?: string;
    description?: string;
}

export function ProfileHeader({ onSignOut, eyebrow, title, description }: ProfileHeaderProps) {
    const { isDark } = useTheme();

    return (
        <>
            <header className="flex flex-wrap items-center justify-between gap-4 mb-8 animate-text">
                <Link to="/" className="inline-flex items-center">
                    <img src={isDark ? "/Uply-light-logo.webp" : "/Uply-dark-logo.webp"} alt="Uply" className="w-auto h-8" />
                </Link>
                <div className="flex items-center gap-2">
                    <Link
                        to="/dashboard"
                        className="btn-magnetic group inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-(--shadow-accent) sm:px-5"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </Link>
                    <button
                        type="button"
                        onClick={onSignOut}
                        className="btn-magnetic inline-flex items-center gap-1.5 border border-border cursor-pointer rounded-full px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted sm:px-5"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign out
                    </button>
                </div>
            </header>

            {title && (
                <div className="mb-8 animate-text">
                    {eyebrow && (
                        <p className="flex items-center gap-2 text-sm font-semibold text-brand">
                            <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-brand" />
                            {eyebrow}
                        </p>
                    )}
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{title}</h1>
                    {description && <p className="max-w-2xl mt-2 text-sm text-muted-foreground">{description}</p>}
                </div>
            )}
        </>
    );
}
