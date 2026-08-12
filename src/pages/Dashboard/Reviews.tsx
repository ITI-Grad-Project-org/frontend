// src/pages/Dashboard/Reviews.tsx
import { useReviewsData } from "@/hooks/reviews/useReviewsData";
import { RatingSummaryCard } from "@/components/reviews/ReviewCard";
import { ReviewList } from "@/components/reviews/ReviewList";
import SummarySkeleton from "@/components/skeletons/SummarySkeleton";

export default function Reviews() {
  const { reviews, summary, loading, error, refetch } = useReviewsData();

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

      {/* Rating Summary */}
      <div className="mb-8">
        {loading ? (
          <SummarySkeleton />
        ) : !error && reviews.length > 0 ? (
          <RatingSummaryCard summary={summary} />
        ) : null}
      </div>

      {/* Review List & States */}
      <ReviewList
        loading={loading}
        error={error}
        reviews={reviews}
        onRetry={refetch}
      />
    </>
  );
}