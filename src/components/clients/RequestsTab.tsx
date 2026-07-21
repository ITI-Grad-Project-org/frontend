export function RequestsTab() {
    return (
        <div className="flex flex-col items-center justify-center min-h-75 border border-dashed border-border rounded-3xl bg-muted/20 animate-in fade-in">
            <p className="text-lg font-medium text-muted-foreground">Clients Requests</p>
            <p className="mt-1 text-sm text-muted-foreground/70">Incoming requests will appear here once handled.</p>
        </div>
    );
}