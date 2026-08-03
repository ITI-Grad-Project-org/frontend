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
  MapPin,
  Clock,
  BadgeCheck,
  Wallet,
  Quote,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { getCoachPublicProfile } from "@/services/reviews";
import { getApiErrorMessage } from "@/lib/api";
import type { CoachPublicProfile, Review } from "@/types/reviews";
import { useTheme } from "@/theme";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i < rating ? "fill-warn text-warn" : "fill-muted text-muted"}
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
    endurance: "Endurance",
    weight_loss: "Weight loss",
    mobility: "Mobility",
    powerlifting: "Powerlifting",
    crossfit: "CrossFit",
    calisthenics: "Calisthenics",
    postpartum: "Postpartum",
    yoga: "Yoga",
    nutrition: "Nutrition",
    rehab: "Rehab",
    general_fitness: "General fitness",
  };
  return labels[value] ?? value;
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// ─── Review card ──────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const { client, rating, comment, created_at } = review;
  const initials = `${client.firstName[0] ?? ""}${client.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className="flex gap-4 p-5 border border-border bg-card rounded-2xl shadow-sm hover:shadow-card transition-shadow">
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
          <time dateTime={created_at} className="text-xs text-muted-foreground/80 whitespace-nowrap">
            {new Date(created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        </div>
        <StarRating rating={rating} size={13} />
        {comment && (
          <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">{comment}</p>
        )}
      </div>
    </div>
  );
}

// ─── Page skeleton ────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Cover + avatar */}
      <div className="h-56 bg-muted" />
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row gap-5 -mt-16 mb-8">
          <div className="w-32 h-32 rounded-3xl bg-muted border-4 border-background shrink-0" />
          <div className="pt-20 sm:pt-6 flex-1 space-y-3">
            <div className="h-8 bg-muted rounded w-56" />
            <div className="h-4 bg-muted rounded w-36" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-24 bg-muted rounded-2xl" />
          <div className="h-48 bg-muted rounded-2xl" />
          {[0, 1].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
      <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-brand/10 text-brand shrink-0">
        {icon}
      </span>
      {children}
    </h2>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/50 border border-border/60">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
      </div>
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

  const fetchProfile = () => {
    if (!tenantId) return;
    setLoading(true);
    setError("");
    setIsNotFound(false);
    getCoachPublicProfile(tenantId)
      .then((data) => { setProfile(data); })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setIsNotFound(true);
        } else {
          setError(getApiErrorMessage(err, "Could not load this coach's profile. Please try again."));
        }
      })
      .finally(() => { setLoading(false); });
  };

  useEffect(() => {
    void (async () => {
      if (!tenantId) return;
      setLoading(true);
      setError("");
      setIsNotFound(false);
      try {
        const data = await getCoachPublicProfile(tenantId);
        setProfile(data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setIsNotFound(true);
        } else {
          setError(getApiErrorMessage(err, "Could not load this coach's profile. Please try again."));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [tenantId]);

  const coach = profile?.coach;
  const reviews = profile?.reviews ?? [];
  const rating = profile?.rating ?? { average: 0, count: 0 };

  const hasPricing = coach?.priceFrom != null || coach?.priceTo != null;

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-center px-6 py-3.5">
          <Link to="/">
            <img
              src={isDark ? "/Uply-light-logo.webp" : "/Uply-dark-logo.webp"}
              alt="Uply"
              className="h-7 w-auto"
            />
          </Link>
          {/* {coach && (
            <p className="text-sm font-semibold text-muted-foreground hidden sm:block">
              {coach.firstName} {coach.lastName}
            </p>
          )} */}
        </div>
      </header>

      {/* ── States ── */}
      {loading ? (
        <PageSkeleton />
      ) : isNotFound ? (
        <div className="flex flex-col items-center justify-center gap-4 min-h-[70vh] text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <SearchX className="w-8 h-8 text-muted-foreground/60" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xl font-bold">Profile not found</p>
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
        <div className="flex flex-col items-center justify-center gap-4 min-h-[70vh] text-center px-6">
          <p role="alert" className="text-lg font-medium text-destructive max-w-sm">{error}</p>
          <button
            onClick={() => fetchProfile()}
            className="flex items-center gap-2 px-4 py-2.5 bg-ink text-ink-foreground font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : coach ? (
        <div className="animate-in fade-in duration-300">

          {/* ── Cover banner ── */}
          <div className="relative h-52 sm:h-64 bg-linear-to-br from-ink via-ink/90 to-brand/60 overflow-hidden">
            {/* subtle grid texture */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            {/* blurred coach photo as bg if available */}
            {coach.avatarUrl && (
              <img
                src={coach.avatarUrl}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl scale-110"
              />
            )}
          </div>

          {/* ── Identity strip ── */}
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row gap-5 sm:items-end -mt-16 mb-8">
              {/* Coach avatar */}
              <div className="w-32 h-32 shrink-0 rounded-full border-4 border-background shadow-xl overflow-hidden bg-muted relative z-10">
                {coach.avatarUrl ? (
                  <img
                    src={coach.avatarUrl}
                    alt={`${coach.firstName} ${coach.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <User className="w-14 h-14" />
                  </div>
                )}
              </div>

              {/* Name + location */}
              <div className="relative z-10 sm:pb-2 flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground ">
                  {coach.firstName} {coach.lastName}
                </h1>

                {coach.location && (
                  <p className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground ">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {coach.location}
                  </p>
                )}
              </div>

              {/* Rating */}
              {rating.count > 0 && (
                <div className="relative z-10 sm:pb-2 flex items-center gap-3 shrink-0">
                  <span className="text-4xl font-black text-foreground tabular-nums">
                    {rating.average.toFixed(1)}
                  </span>
                  <div className="flex flex-col gap-1">
                    <StarRating rating={Math.round(rating.average)} size={16} />
                    <span className="text-xs text-muted-foreground">
                      {rating.count} {rating.count === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ── Content grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-16">

              {/* Left column — main content */}
              <div className="lg:col-span-2 space-y-6">

                {/* Bio */}
                {(coach.bio || coach.careerExperience) && (
                  <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                    <SectionHeading icon={<User className="w-4 h-4" />}>About</SectionHeading>
                    {coach.bio && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{coach.bio}</p>
                    )}
                    {coach.careerExperience && (
                      <p className={`text-sm text-muted-foreground leading-relaxed ${coach.bio ? "mt-3" : ""}`}>
                        {coach.careerExperience}
                      </p>
                    )}
                  </section>
                )}

                {/* Specialties */}
                {coach.specialties && coach.specialties.length > 0 && (
                  <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                    <SectionHeading icon={<Dumbbell className="w-4 h-4" />}>Specialties</SectionHeading>
                    <div className="flex flex-wrap gap-2">
                      {coach.specialties.map((s) => (
                        <span
                          key={s}
                          className="text-sm font-semibold px-3.5 py-1.5 rounded-full bg-brand/10 text-brand border border-brand/20"
                        >
                          {specialtyLabel(s)}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Certifications */}
                {coach.certifications && coach.certifications.length > 0 && (
                  <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                    <SectionHeading icon={<Award className="w-4 h-4" />}>Certifications</SectionHeading>
                    <div className="space-y-3">
                      {coach.certifications.map((cert, i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between gap-3 p-4 rounded-2xl border border-border bg-muted/30"
                        >
                          <div className="flex gap-3 min-w-0">
                            <span className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-xl bg-success/10 text-success shrink-0">
                              <BadgeCheck className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">{cert.name}</p>
                              {(cert.issuer || cert.issueDate || cert.expiryDate) && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {[cert.issuer, formatDate(cert.issueDate), formatDate(cert.expiryDate)]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {cert.fileUrl && (
                              <a
                                href={cert.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title="View certificate"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            {cert.credentialUrl && (
                              <a
                                href={cert.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title="View credential"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Transformation photos */}
                {coach.transformationPhotos && coach.transformationPhotos.length > 0 && (
                  <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                    <SectionHeading icon={<Star className="w-4 h-4" />}>
                      Transformation Photos
                    </SectionHeading>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {coach.transformationPhotos.map((photoUrl, index) => (
                        <a
                          key={`${photoUrl}-${index}`}
                          href={photoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block overflow-hidden rounded-2xl border border-border bg-muted/30"
                        >
                          <img
                            src={photoUrl}
                            alt={`Transformation ${index + 1}`}
                            className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* Reviews */}
                <section>
                  <SectionHeading icon={<MessageSquare className="w-4 h-4" />}>
                    Client Reviews
                    {rating.count > 0 && (
                      <span className="ml-auto text-xs font-bold text-muted-foreground">
                        {rating.count} total
                      </span>
                    )}
                  </SectionHeading>

                  {reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-3xl bg-muted/20 min-h-40">
                      <MessageSquare className="w-8 h-8 text-muted-foreground/40" strokeWidth={1.5} />
                      <p className="text-sm font-medium text-muted-foreground">No reviews yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Right column — sidebar */}
              <div className="space-y-5">

                {/* Quick stats — only render if at least one value exists */}
                {(coach.yearsExperience != null || coach.offlineAvailability || coach.availabilityHours || hasPricing) && (
                  <section className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
                    {coach.yearsExperience != null && (
                      <StatPill
                        icon={<Award className="w-4 h-4" />}
                        label="Experience"
                        value={`${coach.yearsExperience} ${coach.yearsExperience === 1 ? "year" : "years"}`}
                      />
                    )}
                    {coach.offlineAvailability && (
                      <StatPill
                        icon={<MapPin className="w-4 h-4" />}
                        label="Offline coaching"
                        value={
                          coach.offlineAvailability === "yes"
                            ? "Available"
                            : coach.offlineAvailability === "hybrid"
                              ? "Hybrid"
                              : "Online only"
                        }
                      />
                    )}
                    {coach.availabilityHours && (
                      <StatPill
                        icon={<Clock className="w-4 h-4" />}
                        label="Hours"
                        value={coach.availabilityHours}
                      />
                    )}
                    {hasPricing && (
                      <StatPill
                        icon={<Wallet className="w-4 h-4" />}
                        label="Pricing"
                        value={
                          coach.priceFrom != null && coach.priceTo != null
                            ? `${coach.priceFrom} – ${coach.priceTo}`
                            : coach.priceFrom != null
                              ? `From ${coach.priceFrom}`
                              : `Up to ${coach.priceTo}`
                        }
                      />
                    )}
                  </section>
                )}

                {/* Featured review quote */}
                {coach.featuredReviews && (
                  <section className="rounded-3xl border border-brand/20 bg-brand/5 p-5 shadow-sm">
                    <Quote className="w-6 h-6 text-brand mb-3" />
                    <p className="text-sm text-foreground leading-relaxed italic">
                      {coach.featuredReviews}
                    </p>
                  </section>
                )}

                {/* Tenant card */}
                <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Coaching Studio
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-14 h-14 rounded-2xl shrink-0">
                      {coach.tenant.logoUrl ? (
                        <AvatarImage
                          src={coach.tenant.logoUrl}
                          alt={coach.tenant.name}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="rounded-2xl bg-muted text-muted-foreground">
                        <Building2 className="w-7 h-7" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{coach.tenant.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        @{coach.tenant.slug}
                      </p>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default CoachProfile;
