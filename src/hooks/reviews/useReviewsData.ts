import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyReviews } from "@/services/reviews";
import { getApiErrorMessage } from "@/lib/api";
import type { RatingSummary } from "@/types/reviews";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function useReviewsData() {
  const reviewsQuery = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const data = await getMyReviews();
      return Array.isArray(data) ? data : [];
    },
  });

  // Derived rating summary state
  const summary = useMemo<RatingSummary>(() => {
    const reviews = reviewsQuery.data ?? [];
    return {
      count: reviews.length,
      average:
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0,
    };
  }, [reviewsQuery.data]);

  return {
    reviews: reviewsQuery.data ?? [],
    summary,
    loading: reviewsQuery.isPending,
    error: toError(reviewsQuery.error, "Failed to load reviews. Please try again."),
    refetch: () => void reviewsQuery.refetch(),
  };
}