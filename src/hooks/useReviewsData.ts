import { useState, useEffect, useMemo, useCallback } from "react";
import { getMyReviews } from "@/services/reviews";
import { getApiErrorMessage } from "@/lib/api";
import type { Review, RatingSummary } from "@/types/reviews";

export function useReviewsData() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = useCallback(async (isActive = true) => {
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
          getApiErrorMessage(err, "Failed to load reviews. Please try again."),
        );
      }
    } finally {
      if (isActive) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    fetchReviews(isActive);
    return () => {
      isActive = false;
    };
  }, [fetchReviews]);

  // Derived rating summary state
  const summary = useMemo<RatingSummary>(() => {
    return {
      count: reviews.length,
      average:
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0,
    };
  }, [reviews]);

  return {
    reviews,
    summary,
    loading,
    error,
    refetch: () => fetchReviews(true),
  };
}
