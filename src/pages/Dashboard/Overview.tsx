import { ChartBarDefault } from "@/components/charts/clients/example"

function Overview() {
    return (
        <>
            <p className="text-muted-foreground font-sans text-sm animate-in fade-in slide-in-from-left-3 duration-600">Good morning, Coach 👋</p>
            <h1 className="mb-12 text-foreground text-6xl font-black animate-in fade-in slide-in-from-left-3 duration-600">Dashboard</h1>

            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-5 duration-800">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ChartBarDefault />
                </div>

            </div>
        </>
    )
}

export default Overview