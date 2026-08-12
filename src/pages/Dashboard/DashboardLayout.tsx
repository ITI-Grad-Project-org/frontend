import { Apple, BarChart3, Calendar, LayoutDashboard, Dumbbell, UsersRound, Utensils, CircleUserRound, Star, MessageCircleMore, MoreHorizontal, X, LogOut } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useTheme } from "@/theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProfileData } from "@/hooks/profile/useProfileData";

function DashboardLayout() {
    const { isDark } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [moreOpen, setMoreOpen] = useState(false);
    const [pendingNav, setPendingNav] = useState<string | null>(null);
    const { handleSignOut } = useProfileData();
    const isChatPage = location.pathname.startsWith("/dashboard/chat");

    const items = [
        { to: "overview", title: "Overview", icon: LayoutDashboard },
        { to: "clients", title: "Clients", icon: UsersRound },
        { to: "chat", title: "Chat", icon: MessageCircleMore },
        { to: "exercises", title: "Exercises", icon: Dumbbell },
        { to: "plans", title: "Exercise Plans", icon: Calendar },
        { to: "meals", title: "Meals", icon: Utensils },
        { to: "nutrition-plans", title: "Nutrition Plans", icon: Apple },
        { to: "analytics", title: "Analytics", icon: BarChart3 },
        { to: "reviews", title: "Reviews", icon: Star },
    ];

    const primaryItems = items.slice(0, 3);
    const secondaryItems = items.slice(3);
    const isSecondaryActive =
        secondaryItems.some((item) => location.pathname.startsWith(`/dashboard/${item.to}`)) ||
        location.pathname.startsWith("/profile");

    return (
        <div className="flex flex-col h-screen overflow-hidden md:flex-row bg-background text-foreground">
            <aside className="hidden flex-col gap-2 px-3 py-2 border-b bg-primary-foreground md:flex md:w-64 shrink-0 md:gap-6 md:p-6 md:border-b-0 md:border-r border-border">

                <NavLink
                    to="/"
                    className="md:mb-12 md:my-8"
                >
                    <img
                        src={isDark ? "/Uply-light-logo.webp" : "/Uply-dark-logo.webp"}
                        alt="UPLY"
                        className="h-auto place-self-center w-36 md:place-self-start md:w-2/3"
                    />
                </NavLink>


                <nav className="flex gap-2 pb-2 overflow-x-auto font-medium md:flex-col no-scrollbar md:overflow-visible md:pb-0 scrollbar-thin scrollbar-thumb-accent">
                    {items.map((item) => {
                        return (
                            <NavLink
                                key={item.to}
                                to={`/dashboard/${item.to}`}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200 hover:shadow-card md:gap-3 md:px-4 md:py-3 md:rounded-xl
                            ${isActive ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`
                                }
                            >
                                <item.icon className="w-5 h-5 transition-colors shrink-0" strokeWidth={2} />
                                <span>{item.title}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="mt-auto">
                    <div className="flex flex-row gap-2 md:flex-col md:gap-3">
                        <Link
                            to="/profile"
                            className="inline-flex items-center justify-center gap-2 px-2 py-1 mr-3 text-sm font-semibold transition-all duration-200 border md:mr-0 group w-fit rounded-2xl border-border bg-brand text-brand-foreground hover:opacity-90 md:w-full md:px-4 md:py-3"
                        >
                            <CircleUserRound className="w-5 h-5" />
                            <span>Profile</span>
                        </Link>
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="inline-flex items-center justify-center gap-2 px-2 py-1 text-sm font-semibold transition-all duration-200 border w-fit rounded-2xl border-border text-muted-foreground hover:bg-muted hover:text-foreground md:w-full md:px-4 md:py-3"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Log out</span>
                        </button>
                    </div>
                </div>
            </aside>


            <main className={isChatPage ? "flex-1 min-h-0 overflow-hidden px-4 pt-4 pb-24 md:pt-14 md:px-16 md:pb-8" : "flex-1 px-4 pt-4 pb-24 overflow-y-auto md:pt-14 md:px-16 md:pb-8"}>
                <Outlet />
            </main>

            <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around gap-1 border-t border-border bg-popover/95 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden">
                {primaryItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={`/dashboard/${item.to}`}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors",
                                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                            )
                        }
                    >
                        <item.icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                        <span>{item.title}</span>
                    </NavLink>
                ))}

                <DialogPrimitive.Root open={moreOpen} onOpenChange={setMoreOpen}>
                    <DialogPrimitive.Trigger asChild>
                        <button
                            type="button"
                            className={cn(
                                "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors",
                                isSecondaryActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            <MoreHorizontal className="h-5 w-5 shrink-0" strokeWidth={2} />
                            <span>More</span>
                        </button>
                    </DialogPrimitive.Trigger>
                    <DialogPrimitive.Portal>
                        <DialogPrimitive.Overlay className="fixed inset-0 z-50 modal-overlay data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
                        <DialogPrimitive.Content
                            onAnimationEnd={(e) => {
                                if (e.animationName === "exit" && pendingNav) {
                                    navigate(pendingNav);
                                    setPendingNav(null);
                                }
                            }}
                            className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-4 rounded-t-3xl border-t border-border bg-popover p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-sm text-popover-foreground shadow-xl outline-none duration-300 ease-out data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-8 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-8"
                        >
                            <div className="flex items-center justify-between">
                                <DialogPrimitive.Title className="text-base font-semibold">More</DialogPrimitive.Title>
                                <DialogPrimitive.Close asChild>
                                    <Button variant="ghost" size="icon-sm" className="bg-secondary">
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Close</span>
                                    </Button>
                                </DialogPrimitive.Close>
                            </div>
                            <DialogPrimitive.Description className="sr-only">
                                Additional dashboard sections
                            </DialogPrimitive.Description>

                            <div className="grid grid-cols-3 gap-2">
                                {secondaryItems.map((item) => (
                                    <DialogPrimitive.Close asChild key={item.to}>
                                        <Link
                                            to={`/dashboard/${item.to}`}
                                            onClick={() => setPendingNav(`/dashboard/${item.to}`)}
                                            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/70 bg-muted/30 p-4 text-xs font-medium text-muted-foreground transition-colors active:bg-muted"
                                        >
                                            <item.icon className="h-5 w-5" strokeWidth={2} />
                                            <span className="text-center leading-tight">{item.title}</span>
                                        </Link>
                                    </DialogPrimitive.Close>
                                ))}
                            </div>
                            <div className="flex w-full gap-3">
                                <DialogPrimitive.Close asChild>
                                    <Link
                                        to="/profile"
                                        onClick={() => setPendingNav("/profile")}
                                        className="flex flex-1 items-center justify-center gap-2.5 rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground hover:opacity-90"
                                    >
                                        <CircleUserRound className="h-5 w-5 shrink-0" />
                                        <span>Profile</span>
                                    </Link>
                                </DialogPrimitive.Close>

                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    className="flex flex-1 items-center justify-center gap-2.5 rounded-2xl border border-border/70 px-4 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                                >
                                    <LogOut className="h-5 w-5 shrink-0" />
                                    <span>Log out</span>
                                </button>
                            </div>
                        </DialogPrimitive.Content>
                    </DialogPrimitive.Portal>
                </DialogPrimitive.Root>
            </nav>
        </div>
    );
}

export default DashboardLayout;
