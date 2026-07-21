import { RefreshCw, MessageSquare } from "lucide-react";
import type { Review } from "@/types/reviews";
import { ReviewCard } from "./ReviewCard";
import ReviewSkeleton from "@/components/skeletons/ReviewSkeleton";

interface ReviewListProps {
    loading: boolean;
    error: string;
    reviews: Review[];
    onRetry: () => void;
}

export function ReviewList({
    loading,
    error,
    reviews,
    onRetry,
}: ReviewListProps) {
    if (loading) {
        return (
            <div className="flex flex-col gap-4">
                <ReviewSkeleton />
                <ReviewSkeleton />
                <ReviewSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border border-destructive/25 rounded-3xl bg-destructive/5 text-center min-h-75">
                <p role="alert" className="text-lg font-medium text-destructive mb-2">
                    Error loading reviews
                </p>
                <p className="text-sm text-muted-foreground max-w-md mb-6">{error}</p>
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2.5 bg-ink text-ink-foreground font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-3xl bg-muted/20 min-h-75 animate-in fade-in duration-500">
                <MessageSquare
                    className="w-10 h-10 text-muted-foreground/40"
                    strokeWidth={1.5}
                />
                <p className="text-lg font-medium text-muted-foreground">
                    No reviews yet
                </p>
                <p className="text-sm text-muted-foreground/70">
                    Reviews from your clients will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
            ))}
        </div>
    );
}