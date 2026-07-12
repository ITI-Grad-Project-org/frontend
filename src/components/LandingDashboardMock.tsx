export function LandingDashboardMock() {
    return (
        <div className="rounded-3xl border border-white/10 bg-[oklch(0.19_0.008_260)] p-5">
            <div className="mb-4 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="ml-4 text-xs text-muted-foreground">uply.app / dashboard</span>
            </div>

            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <div className="hidden flex-col gap-1.5 md:flex">
                    {[
                        "Overview",
                        "Clients",
                        "Plans",
                        "Nutrition",
                        "Analytics",
                    ].map((label, index) => (
                        <div
                            key={label}
                            className={`rounded-xl px-3 py-2 text-sm ${index === 0 ? "bg-white/8 text-foreground" : "text-muted-foreground"}`}
                        >
                            {label}
                        </div>
                    ))}
                </div>

                <div className="grid gap-4">
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Active clients", value: "37", delta: "+4" },
                            { label: "Adherence", value: "92%", delta: "+3%" },
                            { label: "Weekly volume", value: "18.4t", delta: "+12%" },
                        ].map((item) => (
                            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/3 p-4">
                                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
                                <p className="display mt-1 text-2xl font-semibold">{item.value}</p>
                                <p className="text-xs text-brand">{item.delta}</p>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-medium">Weekly volume</p>
                            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-medium text-brand">▲ 12%</span>
                        </div>
                        <svg viewBox="0 0 400 120" className="h-28 w-full">
                            <defs>
                                <linearGradient id="landing-line" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0" stopColor="oklch(0.78 0.19 42)" stopOpacity="0.6" />
                                    <stop offset="1" stopColor="oklch(0.78 0.19 42)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d="M0,90 C40,70 70,50 100,55 C140,60 170,30 210,35 C250,40 280,15 320,20 C360,25 380,10 400,15 L400,120 L0,120 Z" fill="url(#landing-line)" />
                            <path d="M0,90 C40,70 70,50 100,55 C140,60 170,30 210,35 C250,40 280,15 320,20 C360,25 380,10 400,15" fill="none" stroke="oklch(0.85 0.15 42)" strokeWidth="2" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
