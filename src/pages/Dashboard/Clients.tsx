function Clients() {
    return (
        <>
            <h1 className="mb-12 text-4xl font-black animate-in fade-in slide-in-from-left-3 duration-600">Clients</h1>

            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-5 duration-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card-surface p-6 min-h-[160px] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Row 1 • Box 1</span>
                        <div className="h-4 w-1/2 bg-muted rounded-md" />
                    </div>
                    <div className="card-surface p-6 min-h-[160px] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Row 1 • Box 2</span>
                        <div className="h-4 w-2/3 bg-muted rounded-md" />
                    </div>
                    <div className="card-surface p-6 min-h-[160px] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Row 1 • Box 3</span>
                        <div className="h-4 w-1/3 bg-muted rounded-md" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div className="card-ink md:col-span-2 p-6 min-h-[220px] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-ink-foreground/60 uppercase tracking-wider">Row 2 • Left Main Box (2/3 Width)</span>
                        <div className="h-4 w-1/4 bg-white/10 rounded-md" />
                    </div>


                    <div className="card-brand p-6 min-h-[220px] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-brand-foreground/70 uppercase tracking-wider">Row 2 • Right Side Box (1/3 Width)</span>
                        <div className="h-4 w-1/2 bg-white/20 rounded-md" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="card-surface p-6 min-h-[140px] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Row 3 • Card 1</span>
                        <div className="h-3 w-3/4 bg-muted rounded-sm" />
                    </div>
                    <div className="card-surface p-6 min-h-[140px] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Row 3 • Card 2</span>
                        <div className="h-3 w-1/2 bg-muted rounded-sm" />
                    </div>
                    <div className="card-surface p-6 min-h-[140px] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Row 3 • Card 3</span>
                        <div className="h-3 w-2/3 bg-muted rounded-sm" />
                    </div>
                    <div className="card-surface p-6 min-h-[140px] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Row 3 • Card 4</span>
                        <div className="h-3 w-5/12 bg-muted rounded-sm" />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Clients