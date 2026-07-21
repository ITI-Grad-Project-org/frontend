function ReviewSkeleton() {
    return (
        <div className="flex gap-4 p-5 border border-border bg-card rounded-2xl animate-pulse">
            <div className="w-11 h-11 rounded-full bg-muted shrink-0" />
            <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-4 bg-muted rounded w-20" />
                </div>
                <div className="h-3.5 bg-muted rounded w-16" />
                <div className="space-y-2">
                    <div className="h-3.5 bg-muted rounded w-full" />
                    <div className="h-3.5 bg-muted rounded w-3/4" />
                </div>
            </div>
        </div>
    );
}

export default ReviewSkeleton