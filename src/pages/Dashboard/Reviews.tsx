import { useEffect, useState } from "react";
import { Star, RefreshCw, MessageSquare } from "lucide-react";
import { getMyReviews } from "@/services/reviews";
import { getApiErrorMessage } from "@/lib/api";
import type { Review, RatingSummary } from "@/types/reviews";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SummarySkeleton from "@/components/SummarySkeleton";
import ReviewSkeleton from "@/components/ReviewSkeleton";

// ─── Star renderer ────────────────────────────────────────────────────────────

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          }
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

// ─── Review card ──────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const { client, rating, comment, created_at } = review;
  const initials =
    `${client.firstName[0] ?? ""}${client.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className="flex gap-4 p-5 border border-border bg-card rounded-2xl shadow-sm transition-shadow hover:shadow-card">
      <Avatar className="w-11 h-11 shrink-0">
        {client.avatarUrl ? (
          <AvatarImage
            src={client.avatarUrl}
            alt={`${client.firstName} ${client.lastName}`}
            className="object-cover"
          />
        ) : null}
        <AvatarFallback className="bg-muted text-muted-foreground text-sm font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
          <p className="font-semibold text-foreground leading-tight">
            {client.firstName} {client.lastName}
          </p>
          <time
            dateTime={created_at}
            className="text-xs text-muted-foreground/80 whitespace-nowrap"
          >
            {new Date(created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        </div>

        <StarRating rating={rating} size={14} />

        {comment && (
          <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
            {comment}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Rating summary card ──────────────────────────────────────────────────────

function RatingSummaryCard({ summary }: { summary: RatingSummary }) {
  const { average, count } = summary;
  return (
    <div className="flex items-center gap-6 p-6 border border-border bg-card rounded-2xl shadow-sm w-full sm:w-fit">
      <div className="flex flex-col items-center gap-1">
        <span className="text-4xl font-black text-foreground tabular-nums">
          {average > 0 ? average.toFixed(1) : "–"}
        </span>
        <StarRating rating={Math.round(average)} size={15} />
      </div>
      <div className="w-px h-12 bg-border" />
      <div className="flex flex-col">
        <span className="text-lg font-bold text-foreground">
          {count} {count === 1 ? "review" : "reviews"}
        </span>
        <span className="text-sm text-muted-foreground">from your clients</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = async (isActive = true) => {
    setLoading(true);
    setError("");

    try {
      const data = await getMyReviews();

      if (isActive) {
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (isActive) {
        setError(
          getApiErrorMessage(err, "Failed to load reviews. Please try again.")
        );
      }
    } finally {
      if (isActive) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let isActive = true;
    fetchReviews(isActive);
    return () => {
      isActive = false;
    };
  }, []);

  // Derive summary from loaded reviews
  const summary: RatingSummary = {
    count: reviews.length,
    average:
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0,
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black font-display text-foreground">
          Reviews
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          What your clients are saying about you.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-8">
        {loading ? (
          <SummarySkeleton />
        ) : !error && reviews.length > 0 ? (
          <RatingSummaryCard summary={summary} />
        ) : null}
      </div>

      {/* Review list */}
      {loading ? (
        <div className="flex flex-col gap-4">
          <ReviewSkeleton />
          <ReviewSkeleton />
          <ReviewSkeleton />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-8 border border-destructive/25 rounded-3xl bg-destructive/5 text-center min-h-75">
          <p role="alert" className="text-lg font-medium text-destructive mb-2">
            Error loading reviews
          </p>
          <p className="text-sm text-muted-foreground max-w-md mb-6">{error}</p>
          <button
            onClick={() => fetchReviews(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-ink text-ink-foreground font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-3xl bg-muted/20 min-h-75 animate-in fade-in duration-500">
          <MessageSquare className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="text-lg font-medium text-muted-foreground">
            No reviews yet
          </p>
          <p className="text-sm text-muted-foreground/70">
            Reviews from your clients will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </>
  );
}

export default Reviews;
