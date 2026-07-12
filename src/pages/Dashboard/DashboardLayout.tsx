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
        <div className="flex flex-col h-screen overflow-hidden duration-500 md:flex-row bg-background text-foreground animate-in fade-in ">

            <aside className="bg-primary-foreground flex flex-col gap-2.5 md:w-64 p-6 shrink-0 border-b md:border-b-0 md:border-r border-border">

                {/* <NavLink to={"/"} className="order-1 text-4xl font-black tracking-tight font-display md:mb-12 text-primary w-36 md:w-2/3 md:my-8">
                    <img src={isDark ? "/Uply-light-logo.png" : "/Uply-dark-logo.png"} alt="UPLY" className="object-contain w-full h-auto" />
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


                <nav className="flex order-3 gap-2 pb-2 overflow-x-auto font-medium md:order-2 md:flex-col no-scrollbar md:overflow-visible md:pb-0">
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

                <button
                    type="button"
                    onClick={toggleTheme}
                    className="inline-flex items-center self-end justify-center order-2 gap-2 px-2 py-1 mt-auto transition-colors duration-200 border cursor-pointer md:order-3 w-fit md:w-full md:px-4 md:py-3 rounded-2xl border-border bg-muted text-foreground hover:bg-muted-foreground hover:text-background"
                >
                    {isDark ? <SunMedium className="w-5 h-5" strokeWidth={2} /> : <Moon className="w-5 h-5" strokeWidth={2} />}
                    <span className="hidden md:block">{isDark ? "Light mode" : "Dark mode"}</span>
                </button>
            </aside>


            <main className="flex-1 px-6 pt-10 pb-8 overflow-y-auto md:pt-14 md:px-16">
                <Outlet />
            </main>

        </div>
    );
}

export default DashboardLayout;