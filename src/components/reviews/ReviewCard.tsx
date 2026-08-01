import { Star } from "lucide-react";
import type { Review, RatingSummary } from "@/types/reviews";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function StarRating({
    rating,
    size = 16,
}: {
    rating: number;
    size?: number;
}) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    style={{ width: size, height: size }}
                    className={
                        i < rating
                            ? "fill-warn text-warn"
                            : "fill-muted text-muted"
                    }
                    strokeWidth={1.5}
                />
            ))}
        </div>
    );
}

export function RatingSummaryCard({ summary }: { summary: RatingSummary }) {
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

export function ReviewCard({ review }: { review: Review }) {
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