import { NavLink, Outlet } from "react-router"

function DashboardLayout() {
    return (
        <div className="flex h-screen p-6 gap-12">
            <aside className="flex flex-col gap-6 font-bold">
                <NavLink to={"/"} className="font-black text-4xl mb-12" >LOGO</NavLink>
                <NavLink to={"overview"} >Overview</NavLink>
                <NavLink to={"trainees"} >Trainees</NavLink>
                <NavLink to={"schedule"} >Schedule</NavLink>
            </aside>
            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default DashboardLayout