import { Apple, BarChart3, Calendar, LayoutDashboard, Dumbbell, UsersRound, Utensils, CircleUserRound, Star } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";
import { useTheme } from "@/theme";

function DashboardLayout() {
    const { isDark } = useTheme();

    const items = [
        { to: "overview", title: "Overview", icon: LayoutDashboard },
        { to: "clients", title: "Clients", icon: UsersRound },
        { to: "plans", title: "Plans", icon: Calendar },
        { to: "nutrition", title: "Nutrition", icon: Apple },
        { to: "exercises", title: "Exercises", icon: Dumbbell },
        { to: "meals", title: "Meals", icon: Utensils },
        { to: "analytics", title: "Analytics", icon: BarChart3 },
        { to: "reviews", title: "Reviews", icon: Star },
    ];

    return (
        <div className="flex flex-col h-screen overflow-hidden md:flex-row bg-background text-foreground">
            <aside className="flex flex-col gap-6 p-6 border-b bg-primary-foreground md:w-64 shrink-0 md:border-b-0 md:border-r border-border">

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
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm whitespace-nowrap transition-all duration-200 hover:shadow-card
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
                    <Link
                        to="/profile"
                        className="inline-flex items-center justify-center gap-2 px-2 py-1 mr-3 text-sm font-semibold transition-all duration-200 border md:mr-0 md:mb-2 group w-fit rounded-2xl border-border bg-brand text-brand-foreground hover:opacity-90 md:w-full md:px-4 md:py-3"
                    >
                        <CircleUserRound className="w-5 h-5" />
                        <span>Profile</span>
                    </Link>
                </div>
            </aside>


            <main className="flex-1 px-6 pt-10 pb-8 overflow-y-auto md:pt-14 md:px-16">
                <Outlet />
            </main>

        </div>
    );
}

export default DashboardLayout;
