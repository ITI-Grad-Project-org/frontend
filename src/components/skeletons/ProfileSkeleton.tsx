function ProfileSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            {/* Hero */}
            <div className="rounded-3xl border border-border bg-card p-8 flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-24 h-24 rounded-2xl bg-muted shrink-0" />
                <div className="flex-1 space-y-3">
                    <div className="h-7 bg-muted rounded w-48" />
                    <div className="h-4 bg-muted rounded w-32" />
                    <div className="h-4 bg-muted rounded w-full max-w-md" />
                    <div className="h-4 bg-muted rounded w-3/4 max-w-sm" />
                </div>
            </div>
            {/* Reviews */}
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="flex gap-4 p-5 border border-border bg-card rounded-2xl"
                >
                    <div className="w-11 h-11 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3.5 bg-muted rounded w-16" />
                        <div className="h-3.5 bg-muted rounded w-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}
export default ProfileSkeleton