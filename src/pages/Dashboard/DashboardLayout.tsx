import { NavLink, Outlet } from "react-router"

function DashboardLayout() {
    return (
        <div className="flex h-screen p-6 gap-12">
            <aside className="flex flex-col gap-6 font-bold">
                <NavLink to={"/"} className="font-black text-4xl mb-12" >UPLY</NavLink>
                <NavLink to={"overview"} >Overview</NavLink>
                <NavLink to={"clients"} >Clients</NavLink>
                <NavLink to={"plans"} >Plans</NavLink>
                <NavLink to={"nutrition"} >Nutrition</NavLink>
                <NavLink to={"exercises"} >Excercises</NavLink>
                <NavLink to={"meals"} >Meals</NavLink>
                <NavLink to={"analytics"} >Analytics</NavLink>
            </aside>
            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default DashboardLayout