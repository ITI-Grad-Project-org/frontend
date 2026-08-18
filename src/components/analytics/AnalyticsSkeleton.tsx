export function AnalyticsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 rounded-3xl bg-muted/50" />
        ))}
      </div>
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-44 rounded-3xl bg-muted/50" />
        ))}
      </div>
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <div className="h-80 rounded-3xl bg-muted/50 lg:col-span-2" />
        <div className="h-80 rounded-3xl bg-muted/50" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-80 rounded-3xl bg-muted/50" />
        <div className="h-80 rounded-3xl bg-muted/50 lg:col-span-2" />
      </div>
    </div>
  );
}