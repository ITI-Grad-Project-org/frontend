function ExerciseCardSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-5 border border-border bg-card rounded-3xl animate-pulse">
            <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-muted" />
                <div className="flex gap-1">
                    <div className="w-8 h-8 rounded-xl bg-muted" />
                    <div className="w-8 h-8 rounded-xl bg-muted" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-5 w-20 bg-muted rounded-full mt-2" />
            </div>
            <div className="flex gap-1.5">
                <div className="h-5 w-14 bg-muted rounded-full" />
                <div className="h-5 w-18 bg-muted rounded-full" />
            </div>
        </div>
    );
}

export default ExerciseCardSkeleton