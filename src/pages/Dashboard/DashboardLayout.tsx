import { Apple, BarChart3, Calendar, LayoutDashboard, Dumbbell, UsersRound, Utensils, Moon, SunMedium } from "lucide-react";
import { NavLink, Outlet } from "react-router";
import { useTheme } from "../../theme";

function DashboardLayout() {
    const { isDark, toggleTheme } = useTheme();

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
        <div className="flex flex-col md:flex-row h-screen bg-background text-foreground animate-in fade-in duration-500 overflow-hidden ">

            <aside className="bg-primary-foreground flex flex-col gap-2.5 md:w-64 p-6 shrink-0 border-b md:border-b-0 md:border-r border-border">

                {/* <NavLink to={"/"} className="order-1 font-display font-black text-4xl tracking-tight md:mb-12 text-primary w-36 md:w-2/3 md:my-8">
                    <img src={isDark ? "/Uply-light-logo.png" : "/Uply-dark-logo.png"} alt="UPLY" className="w-full h-auto object-contain" />
                </NavLink> */}

                <NavLink
                    to="/"
                    className="order-1 md:mb-12 md:my-8"
                >
                    <img
                        src={isDark ? "/Uply-light-logo.png" : "/Uply-dark-logo.png"}
                        alt="UPLY"
                        className="h-auto w-36 md:w-2/3"
                    />
                </NavLink>


                <nav className="order-3 md:order-2 flex md:flex-col gap-2 font-medium overflow-x-auto no-scrollbar md:overflow-visible pb-2 md:pb-0">
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
                                <item.icon className="w-5 h-5 shrink-0 transition-colors" strokeWidth={2} />
                                <span>{item.title}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <button
                    type="button"
                    onClick={toggleTheme}
                    className="order-2 self-end md:order-3 w-fit md:w-full mt-auto inline-flex items-center justify-center gap-2 px-2 md:px-4 py-1 md:py-3 rounded-2xl border border-border bg-muted text-foreground hover:bg-muted-foreground hover:text-background transition-colors duration-200 cursor-pointer"
                >
                    {isDark ? <SunMedium className="w-5 h-5" strokeWidth={2} /> : <Moon className="w-5 h-5" strokeWidth={2} />}
                    <span className="hidden md:block">{isDark ? "Light mode" : "Dark mode"}</span>
                </button>
            </aside>


            <main className="flex-1 overflow-y-auto pt-10 md:pt-14 px-6 md:px-16 pb-8">
                <Outlet />
            </main>

        </div>
    );
}

export default DashboardLayout;