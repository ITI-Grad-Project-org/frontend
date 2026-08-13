import type { Review } from "@/types/reviews";

export function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const buckets = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((review) => Math.round(review.rating) === stars).length,
  }));
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count));

  return (
    <div className="space-y-2">
      {buckets.map(({ stars, count }) => (
        <div key={stars} className="flex items-center gap-3 text-sm">
          <span className="w-5 shrink-0 text-right tabular-nums text-white/70">{stars}</span>
          <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right tabular-nums text-white/50">{count}</span>
        </div>
      ))}
    </div>
  );
}