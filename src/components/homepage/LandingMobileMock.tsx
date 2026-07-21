import { Check, Dumbbell } from "lucide-react";

export function LandingMobileMock() {
    return (
        <div className="mock-dark-surface rounded-[36px] border border-white/10 bg-[oklch(0.14_0.008_260)] p-3 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]">
            <div className="rounded-[28px] border border-white/10 bg-[oklch(0.19_0.008_260)] p-4">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Today · Push A</span>
                    <span>3/5</span>
                </div>
                <div className="mt-3 space-y-2">
                    {[
                        { name: "Bench Press", stats: "4 × 8", done: true },
                        { name: "Incline DB Press", stats: "4 × 10", done: true },
                        { name: "Cable Fly", stats: "3 × 12", done: true },
                        { name: "OHP", stats: "4 × 6", done: false },
                    ].map((exercise) => (
                        <div key={exercise.name} className="flex items-center gap-2 rounded-2xl bg-white/5 p-2.5">
                            <span className={`flex h-7 w-7 items-center justify-center rounded-full ${exercise.done ? "bg-brand text-brand-foreground" : "bg-white/10"}`}>
                                {exercise.done ? <Check className="h-3.5 w-3.5" /> : <Dumbbell className="h-3.5 w-3.5" />}
                            </span>
                            <div className="flex-1">
                                <p className="text-[11px] font-medium leading-tight">{exercise.name}</p>
                                <p className="text-[10px] text-muted-foreground">{exercise.stats}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
