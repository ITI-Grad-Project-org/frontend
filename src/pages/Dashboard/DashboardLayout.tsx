import { Apple, BarChart3, Calendar, LayoutDashboard, Dumbbell, UsersRound, Utensils } from "lucide-react";
import { NavLink, Outlet } from "react-router";

function DashboardLayout() {
    const items = [
        { to: "overview", title: "Overview", icon: LayoutDashboard },
        { to: "clients", title: "Clients", icon: UsersRound },
        { to: "plans", title: "Plans", icon: Calendar },
        { to: "nutrition", title: "Nutrition", icon: Apple },
        { to: "exercises", title: "Exercises", icon: Dumbbell },
        { to: "meals", title: "Meals", icon: Utensils },
        { to: "analytics", title: "Analytics", icon: BarChart3 },
    ];

    return (
        <div className="flex flex-col md:flex-row h-screen bg-background text-foreground animate-in fade-in duration-500 overflow-hidden">

            <aside className="bg-primary-foreground flex flex-col md:w-64 p-6 shrink-0 border-b md:border-b-0 md:border-r border-border">
                <NavLink to={"/"} className="font-display font-black text-4xl tracking-tight mb-6 md:mb-12 text-primary">
                    UPLY
                </NavLink>

                <nav className="flex md:flex-col gap-2 font-medium overflow-x-auto no-scrollbar md:overflow-visible pb-2 md:pb-0">
                    {items.map((item) => {
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm whitespace-nowrap transition-all duration-200
                                    ${isActive ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`
                                }
                            >
                                <item.icon className="w-5 h-5 shrink-0 transition-colors" strokeWidth={2} />
                                <span>{item.title}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto pt-10 md:pt-14 px-6 md:px-16 pb-8">
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;