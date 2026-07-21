import { Link } from "react-router";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useTheme } from "@/theme";

interface ProfileHeaderProps {
    onSignOut: () => void;
}

export function ProfileHeader({ onSignOut }: ProfileHeaderProps) {
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

            <div className="mb-8 animate-text">
                <p className="text-sm font-semibold text-brand">Coach profile</p>
                <h1 className="mt-2 text-3xl font-extrabold">Your profile</h1>
                <p className="max-w-2xl mt-2 text-sm text-muted-foreground">Review and update the coaching details your clients see.</p>
            </div>
        </>
    );
}