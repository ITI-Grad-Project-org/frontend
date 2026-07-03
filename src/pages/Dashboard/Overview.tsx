import { lazy, Suspense } from "react";

import CardBrand from "@/components/Cards/CardBrand";
import CardInk from "@/components/Cards/CardInk";
import CardMain from "@/components/Cards/CardMain";
import { Chip } from "@/components/Chip";
import { Heart } from "lucide-react";

const ChartBarDefault = lazy(() =>
    import("@/components/charts/examples/example").then((m) => ({
        default: m.ChartBarDefault,
    })),
);

const ChartAreaInteractive = lazy(() =>
    import("@/components/charts/examples/example2").then((m) => ({
        default: m.ChartAreaInteractive,
    })),
);

const ChartAreaInteractive2 = lazy(() =>
    import("@/components/charts/examples/example2 copy").then((m) => ({
        default: m.ChartAreaInteractive2,
    })),
);

function ChartSkeleton({ className = "" }: { className?: string }) {
    return (
        <div
            className={`h-87.5 w-full rounded-3xl bg-muted animate-pulse ${className}`}
        />
    );
}

function Overview() {
    return (
        <>
            <p className="text-muted-foreground font-sans text-sm animate-in fade-in slide-in-from-left-3 duration-600">
                Good morning, Coach 👋
            </p>

            <h1 className="mb-12 text-foreground text-6xl font-black animate-in fade-in slide-in-from-left-3 duration-600">
                Dashboard
            </h1>

            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-3 duration-800">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Suspense fallback={<ChartSkeleton />}>
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
                        <h3 className="display text-2xl font-bold">Weekly Completion</h3>

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
                            <h1 className="display text-2xl font-bold">Meals</h1>
                            <p>
                                Clients exercised <b>10</b> Times
                            </p>
                        </CardInk>

                        <CardBrand>
                            <h1 className="display text-2xl font-bold">Meals</h1>
                            <p>
                                Clients exercised <b>10</b> Times
                            </p>
                        </CardBrand>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Overview;
