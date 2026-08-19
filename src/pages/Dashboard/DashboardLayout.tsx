import { Apple, BarChart3, Calendar, LayoutDashboard, Dumbbell, UsersRound, Utensils, CircleUserRound, Star, MessageCircleMore, LogOut } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useTheme } from "@/theme";
import { cn } from "@/lib/utils";
import { useProfileData } from "@/hooks/profile/useProfileData";
import { useUnreadMessages } from "@/hooks/coach/useUnreadMessages";
import { DashboardMobileMenu } from "@/components/DashboardMobileMenu";
import { useDocumentTitle } from "@/hooks/shared/useDocumentTitle";

function DashboardLayout() {
    const { isDark } = useTheme();
    const location = useLocation();
    const { handleSignOut } = useProfileData();
    const isChatPage = location.pathname.startsWith("/dashboard/chat");
    const unreadChatCount = useUnreadMessages().data ?? 0;
    const showChatBadge = !isChatPage && unreadChatCount > 0;

    useDocumentTitle(
        unreadChatCount > 0
            ? `(${unreadChatCount > 99 ? "99+" : unreadChatCount}) Uply | Dashboard`
            : "Uply | Dashboard",
    );

    const items = [
        { to: "overview", title: "Overview", icon: LayoutDashboard },
        { to: "clients", title: "Clients", icon: UsersRound },
        { to: "chat", title: "Chat", icon: MessageCircleMore },
        { to: "exercises", title: "Exercises", icon: Dumbbell },
        { to: "meals", title: "Meals", icon: Utensils },
        { to: "plans", title: "Exercise Plans", icon: Calendar },
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
                        src={isDark ? "/uply-logo-extra-bold-dark-transparent.webp" : "/uply-logo-extra-bold-transparent.webp"}
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
                                {item.to === "chat" && showChatBadge && (
                                    <span
                                        title={`${unreadChatCount} unread message${unreadChatCount === 1 ? "" : "s"}`}
                                        aria-label={`${unreadChatCount} unread messages`}
                                        className="ml-auto grid min-w-5 h-5 place-items-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold leading-none text-destructive-foreground animate-in fade-in zoom-in-95 duration-200"
                                    >
                                        {unreadChatCount > 99 ? "99+" : unreadChatCount}
                                    </span>
                                )}
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


            <main className={isChatPage ? "flex-1 min-h-0 overflow-hidden px-4 pt-8 pb-24 md:pt-16 md:px-16 md:pb-8" : "flex-1 px-4 pt-8 pb-24 overflow-x-hidden overflow-y-auto md:pt-16 md:px-16 md:pb-8"}>
                <Outlet />
            </main>

            <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around gap-1 border-t border-border bg-popover px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden">
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
                        <span className="relative">
                            <item.icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                            {item.to === "chat" && showChatBadge && (
                                <span
                                    title={`${unreadChatCount} unread message${unreadChatCount === 1 ? "" : "s"}`}
                                    aria-label={`${unreadChatCount} unread messages`}
                                    className="absolute -top-1.5 -right-2 grid min-w-4 h-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-semibold leading-none text-destructive-foreground animate-in fade-in zoom-in-95 duration-200"
                                >
                                    {unreadChatCount > 99 ? "99+" : unreadChatCount}
                                </span>
                            )}
                        </span>
                        <span>{item.title}</span>
                    </NavLink>
                ))}

                <DashboardMobileMenu items={secondaryItems} isSecondaryActive={isSecondaryActive} />
            </nav>
        </div>
    );
}

export default DashboardLayout;
