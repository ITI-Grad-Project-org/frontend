import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/reviews/ReviewCard";
import type { Review } from "@/types/reviews";

export function CoachReviewCard({ review }: { review: Review }) {
  const { client, rating, comment, created_at } = review;
  const initials = `${client.firstName[0] ?? ""}${client.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className="flex gap-4 p-5 border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl shadow-md hover:bg-white/10 transition-colors">
      <Avatar className="w-11 h-11 shrink-0">
        {client.avatarUrl ? (
          <AvatarImage
            src={client.avatarUrl}
            alt={`${client.firstName} ${client.lastName}`}
            className="object-cover"
          />
        ) : null}
        <AvatarFallback className="bg-white/10 text-white text-sm font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
          <p className="font-semibold text-white leading-tight">
            {client.firstName} {client.lastName}
          </p>
          <time dateTime={created_at} className="text-xs text-white/50 whitespace-nowrap">
            {new Date(created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        </div>
        <StarRating rating={rating} size={13} />
        {comment && (
          <p className="mt-2.5 text-sm text-white/70 leading-relaxed">{comment}</p>
        )}
      </div>
    </div>
  );
}