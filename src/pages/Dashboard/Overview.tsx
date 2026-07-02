import CardBrand from "@/components/Cards/CardBrand"
import CardInk from "@/components/Cards/CardInk"
import CardMain from "@/components/Cards/CardMain"
import { ChartBarDefault } from "@/components/charts/clients/example"
import { ChartAreaInteractive } from "@/components/charts/clients/example2"
import { ChartAreaInteractive2 } from "@/components/charts/clients/example2 copy"
import { Chip } from "@/components/Chip"
import { Heart } from "lucide-react"

function Overview() {
    return (
        <>
            <p className="text-muted-foreground font-sans text-sm animate-in fade-in slide-in-from-left-3 duration-600">Good morning, Coach 👋</p>
            <h1 className="mb-12 text-foreground text-6xl font-black animate-in fade-in slide-in-from-left-3 duration-600">Dashboard</h1>

            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-5 duration-800">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ChartBarDefault />
                    <div className="col-span-2">
                        <ChartAreaInteractive />
                    </div>
                    <ChartAreaInteractive2 />
                    <CardMain>
                        <h3 className="display text-2xl font-bold">Weekly Completion</h3>
                        <div className="flex gap-2.5 flex-wrap">
                            <Chip color="yellow"><Heart /></Chip>
                            <Chip color="yellow"><Heart /></Chip>
                            <Chip color="pink"><Heart /></Chip>
                            <Chip color="green"><Heart /></Chip>
                            <Chip color="yellow"><Heart /></Chip>
                            <Chip color="violet"><Heart /></Chip>
                            <Chip color="green"><Heart /> Icon and text</Chip>
                            <Chip color="pink"><Heart /></Chip>
                            <Chip color="pink">text chip</Chip>
                            <Chip color="orange"><Heart /></Chip>
                        </div>
                        <p className="text-muted-foreground ">Clients excercised <b>10</b> Times</p>

                    </CardMain>
                    <div className="flex gap-2.5">

                        <CardInk>
                            <h1 className="display text-2xl font-bold">Meals</h1>

                            <p className="">Clients excercised <b>10</b> Times</p>
                        </CardInk>
                        <CardBrand>
                            <h1 className="display text-2xl font-bold">Meals</h1>
                            <p className="">Clients excercised <b>10</b> Times</p>
                        </CardBrand>
                    </div>
                </div>


            </div>
        </>
    )
}

export default Overview