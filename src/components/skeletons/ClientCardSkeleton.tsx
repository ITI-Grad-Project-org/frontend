function ClientCardSkeleton() {
    return (
        <div className="w-full flex flex-col justify-between gap-5 p-6 border border-border bg-card rounded-3xl animate-pulse">
            <div className="flex flex-col gap-4">
                {/* Avatar & Name skeleton */}
                <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-full bg-muted shrink-0" />
                    <div className="flex flex-col gap-2 w-full">
                        <div className="h-5 bg-muted rounded w-2/3" />
                        <div className="h-4 bg-muted rounded w-1/3" />
                    </div>
                </div>

                {/* Divider & details skeleton */}
                <div className="flex flex-col gap-2.5 py-4 border-t border-b border-border/60">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                </div>

                {/* Stats columns */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-muted/40 rounded-2xl border border-border/40" />
                    <div className="h-16 bg-muted/40 rounded-2xl border border-border/40" />
                </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="h-11 bg-muted rounded-2xl" />
                <div className="h-11 bg-muted rounded-2xl" />
            </div>
        </div>
    );
}

export default ClientCardSkeleton