export function PageSkeleton() {
  return (
    <div className="animate-pulse max-w-5xl mx-auto px-6 pt-10">
      <div className="flex flex-col sm:flex-row gap-5 mb-8 items-end">
        <div className="w-32 h-32 rounded-full bg-white/10 shrink-0" />
        <div className="space-y-3 pb-2">
          <div className="h-9 bg-white/10 rounded-xl w-56" />
          <div className="h-4 bg-white/10 rounded-lg w-36" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-24 bg-white/10 rounded-3xl" />
          <div className="h-20 bg-white/10 rounded-3xl" />
          <div className="h-48 bg-white/10 rounded-3xl" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-white/10 rounded-3xl" />
          <div className="h-28 bg-white/10 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}