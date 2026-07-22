// import { lazy, Suspense } from "react";

// import CardBrand from "@/components/cards/CardBrand";
// import CardInk from "@/components/cards/CardInk";
// import CardMain from "@/components/cards/CardMain";
// import { Chip } from "@/components/ui/Chip";
// import { Heart } from "lucide-react";

// const ChartBarDefault = lazy(() =>
//     import("@/components/charts/examples/example").then((m) => ({
//         default: m.ChartBarDefault,
//     })),
// );

// const ChartAreaInteractive = lazy(() =>
//     import("@/components/charts/examples/example2").then((m) => ({
//         default: m.ChartAreaInteractive,
//     })),
// );

// const ChartAreaInteractive2 = lazy(() =>
//     import("@/components/charts/examples/example2 copy").then((m) => ({
//         default: m.ChartAreaInteractive2,
//     })),
// );

// function ChartSkeleton({ className = "" }: { className?: string }) {
//     return (
//         <div
//             className={`h-87.5 w-full rounded-3xl bg-muted animate-pulse ${className}`}
//         />
//     );
// }

function Overview() {
    return (
        <>
            <div className="animate-text">
                <p className="font-sans text-sm text-muted-foreground">
                    Good morning, Coach 👋
                </p>
                <h1 className="mb-12 text-6xl font-black text-foreground">
                    Dashboard
                </h1>
            </div>

            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* <Suspense fallback={<ChartSkeleton />}>
                        <ChartBarDefault />
                    </Suspense>

                    <div className="col-span-2">
                        <Suspense fallback={<ChartSkeleton />}>
                            <ChartAreaInteractive />
                        </Suspense>
                    </div>

                    <Suspense fallback={<ChartSkeleton />}>
                        <ChartAreaInteractive2 />
                    </Suspense>

                    <CardMain>
                        <h3 className="text-2xl font-bold display">Weekly Completion</h3>

                        <div className="flex flex-wrap gap-2.5">
                            <Chip color="yellow">
                                <Heart />
                            </Chip>
                            <Chip color="yellow">
                                <Heart />
                            </Chip>
                            <Chip color="pink">
                                <Heart />
                            </Chip>
                            <Chip color="green">
                                <Heart />
                            </Chip>
                            <Chip color="yellow">
                                <Heart />
                            </Chip>
                            <Chip color="violet">
                                <Heart />
                            </Chip>
                            <Chip color="green">
                                <Heart /> Icon and text
                            </Chip>
                            <Chip color="pink">
                                <Heart />
                            </Chip>
                            <Chip color="pink">text chip</Chip>
                            <Chip color="orange">
                                <Heart />
                            </Chip>
                        </div>

                        <p className="text-muted-foreground">
                            Clients exercised <b>10</b> Times
                        </p>
                    </CardMain>

                    <div className="flex gap-2.5">
                        <CardInk>
                            <h1 className="text-2xl font-bold display">Meals</h1>
                            <p>
                                Clients exercised <b>10</b> Times
                            </p>
                        </CardInk>

                        <CardBrand>
                            <h1 className="text-2xl font-bold display">Meals</h1>
                            <p>
                                Clients exercised <b>10</b> Times
                            </p>
                        </CardBrand>
                    </div> */}
                </div>
            </div>
        </>
    );
}

export default Overview;
