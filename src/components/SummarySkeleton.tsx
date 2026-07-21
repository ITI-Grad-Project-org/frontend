function SummarySkeleton() {
    return (
        <div className="flex items-center gap-6 p-6 border border-border bg-card rounded-2xl animate-pulse w-full sm:w-fit">
            <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-20 bg-muted rounded-xl" />
                <div className="h-3 w-12 bg-muted rounded" />
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="flex flex-col gap-2">
                <div className="h-4 w-28 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
            </div>
        </div>
    );
}


export default SummarySkeleton