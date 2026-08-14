import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { CircleUserRound, LogOut, MoreHorizontal, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProfileData } from "@/hooks/profile/useProfileData";

type SecondaryItem = {
    to: string;
    title: string;
    icon: LucideIcon;
};

type DashboardMobileMenuProps = {
    items: SecondaryItem[];
    isSecondaryActive: boolean;
};

export function DashboardMobileMenu({ items, isSecondaryActive }: DashboardMobileMenuProps) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();
    const { handleSignOut } = useProfileData();

    useEffect(() => {
        if (!open) return;
        const raf = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(raf);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    const go = (to: string) => {
        setOpen(false);
        navigate(to);
    };

    return (
        <>
            <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen(true)}
                className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors",
                    isSecondaryActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
            >
                <MoreHorizontal className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span>More</span>
            </button>

            {open && (
                <div className="fixed inset-0 z-50">
                    <div aria-hidden onClick={() => setOpen(false)} className="absolute inset-0 bg-black/45" />

                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="More"
                        className={cn(
                            "absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col gap-4 overflow-y-auto rounded-t-3xl border-t border-border bg-popover p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-sm text-popover-foreground shadow-xl transition-transform duration-150 ease-out",
                            mounted ? "translate-y-0" : "translate-y-full",
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold">More</h2>
                            <Button variant="ghost" size="icon-sm" className="bg-secondary" onClick={() => setOpen(false)}>
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </div>
                        <p className="sr-only">Additional dashboard sections</p>

                        <div className="grid grid-cols-3 gap-2">
                            {items.map((item) => (
                                <button
                                    key={item.to}
                                    type="button"
                                    onClick={() => go(`/dashboard/${item.to}`)}
                                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/70 bg-muted/30 p-4 text-xs font-medium text-muted-foreground transition-colors active:bg-muted"
                                >
                                    <item.icon className="h-5 w-5" strokeWidth={2} />
                                    <span className="text-center leading-tight">{item.title}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex w-full gap-3">
                            <Link
                                to="/profile"
                                onClick={() => setOpen(false)}
                                className="flex flex-1 items-center justify-center gap-2.5 rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground hover:opacity-90"
                            >
                                <CircleUserRound className="h-5 w-5 shrink-0" />
                                <span>Profile</span>
                            </Link>

                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="flex flex-1 items-center justify-center gap-2.5 rounded-2xl border border-border/70 px-4 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                            >
                                <LogOut className="h-5 w-5 shrink-0" />
                                <span>Log out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}