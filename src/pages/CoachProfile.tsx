import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import {
  Star,
  RefreshCw,
  User,
  Building2,
  Dumbbell,
  Award,
  ExternalLink,
  MessageSquare,
  ChevronLeft,
  SearchX,
} from "lucide-react";
import axios from "axios";
import { getCoachPublicProfile } from "@/services/reviews";
import { getApiErrorMessage } from "@/lib/api";
import type { CoachPublicProfile, Review, RatingSummary } from "@/types/reviews";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/theme";
import ProfileSkeleton from "@/components/ProfileSkeleton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function specialtyLabel(value: string) {
  const labels: Record<string, string> = {
    strength: "Strength",
    hypertrophy: "Hypertrophy",
    weight_loss: "Weight loss",
    powerlifting: "Powerlifting",
    crossfit: "CrossFit",
    calisthenics: "Calisthenics",
    nutrition: "Nutrition",
    rehab: "Rehab",
    general_fitness: "General fitness",
  };
  return labels[value] ?? value;
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

// ─── Rating summary bar ───────────────────────────────────────────────────────

function RatingBadge({ rating }: { rating: RatingSummary }) {
  const { average, count } = rating;
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-3xl font-black text-foreground tabular-nums">
          {count > 0 ? average.toFixed(1) : "–"}
        </span>
        <StarRating rating={Math.round(average)} size={14} />
      </div>
      <span className="text-sm text-muted-foreground">
        {count} {count === 1 ? "review" : "reviews"}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function CoachProfile() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { isDark } = useTheme();

  const [profile, setProfile] = useState<CoachPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);

  const fetchProfile = (isActive = true) => {
    if (!tenantId) return;
    setLoading(true);
    setError("");
    setIsNotFound(false);
    getCoachPublicProfile(tenantId)
      .then((data) => {
        if (isActive) setProfile(data);
      })
      .catch((err) => {
        if (!isActive) return;
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setIsNotFound(true);
        } else {
          setError(
            getApiErrorMessage(
              err,
              "Could not load this coach's profile. Please try again."
            )
          );
        }
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });
  };

  useEffect(() => {
    let isActive = true;
    fetchProfile(isActive);
    return () => {
      isActive = false;
    };
  }, [tenantId]);

  const coach = profile?.coach;
  const reviews = profile?.reviews ?? [];
  const rating = profile?.rating ?? { average: 0, count: 0 };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/">
            <img
              src={isDark ? "/Uply-light-logo.webp" : "/Uply-dark-logo.webp"}
              alt="Uply"
              className="h-7 w-auto"
            />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {loading ? (
          <ProfileSkeleton />
        ) : isNotFound ? (
          <div className="flex flex-col items-center justify-center gap-4 min-h-96 text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <SearchX className="w-8 h-8 text-muted-foreground/60" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">Profile not found</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                This coach profile doesn't exist or hasn't been set up yet.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-border hover:bg-muted transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Go home
            </Link>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 min-h-96 text-center border border-destructive/25 rounded-3xl bg-destructive/5 p-8">
            <p
              role="alert"
              className="text-lg font-medium text-destructive"
            >
              {error}
            </p>
            <button
              onClick={() => fetchProfile(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-ink text-ink-foreground font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        ) : coach ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* ── Hero card ── */}
            <section className="rounded-3xl border border-border bg-card p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Avatar */}
                <Avatar className="w-24 h-24 rounded-2xl shrink-0">
                  {coach.avatarUrl ? (
                    <AvatarImage
                      src={coach.avatarUrl}
                      alt={`${coach.firstName} ${coach.lastName}`}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="rounded-2xl bg-muted text-muted-foreground">
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-extrabold text-foreground">
                    {coach.firstName} {coach.lastName}
                  </h1>
                  {/* Tenant */}
                  <div className="flex items-center gap-1.5 mt-1 mb-3">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {coach.tenant.name}
                    </span>
                  </div>

                  {/* Rating */}
                  <RatingBadge rating={rating} />

                  {/* Bio */}
                  {coach.bio && (
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                      {coach.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Details row */}
              <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Specialties */}
                {coach.specialties && coach.specialties.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5" />
                      Specialties
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {coach.specialties.map((s) => (
                        <span
                          key={s}
                          className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-brand/10 text-brand border border-brand/20"
                        >
                          {specialtyLabel(s)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {coach.yearsExperience != null && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                      Experience
                    </h2>
                    <p className="text-sm font-semibold text-foreground">
                      {coach.yearsExperience}{" "}
                      {coach.yearsExperience === 1 ? "year" : "years"}
                    </p>
                  </div>
                )}
              </div>

              {/* Certifications */}
              {coach.certifications && coach.certifications.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    Certifications
                  </h2>
                  <div className="space-y-2">
                    {coach.certifications.map((cert, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl border border-border bg-muted/30"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {cert.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {cert.issuer} · {cert.year}
                          </p>
                        </div>
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="View credential"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ── Reviews ── */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">
                Client Reviews
              </h2>

              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-3xl bg-muted/20 min-h-48">
                  <MessageSquare
                    className="w-9 h-9 text-muted-foreground/40"
                    strokeWidth={1.5}
                  />
                  <p className="text-base font-medium text-muted-foreground">
                    No reviews yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default CoachProfile;
