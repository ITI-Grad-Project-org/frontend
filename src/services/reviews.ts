import { api } from "@/lib/api";
import type { Review, RatingSummary, CoachPublicProfile } from "@/types/reviews";

/** GET /reviews/me — requires auth */
export async function getMyReviews() {
  const { data } = await api.get<Review[]>("/reviews/me");
  return data;
}

/** GET /reviews/coaches/{tenantId} — public */
export async function getCoachPublicReviews(tenantId: string) {
  const { data } = await api.get<Review[]>(`/reviews/coaches/${tenantId}`, {
    skipAuth: true,
  });
  return data;
}

/** GET /reviews/coaches/{tenantId}/summary — public */
export async function getCoachRatingSummary(tenantId: string) {
  const { data } = await api.get<RatingSummary>(
    `/reviews/coaches/${tenantId}/summary`,
    { skipAuth: true },
  );
  return data;
}

/** GET /coaches/{tenantId}/profile — public */
export async function getCoachPublicProfile(tenantId: string) {
  const { data } = await api.get<CoachPublicProfile>(
    `/coaches/${tenantId}/profile`,
    { skipAuth: true },
  );
  return data;
}
