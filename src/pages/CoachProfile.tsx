import { useEffect, useState, useCallback } from "react";
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
  ChevronRight,
  SearchX,
  MapPin,
  Clock,
  BadgeCheck,
  Wallet,
  X,
  Link2,
  Images,
  UserCircle2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { getCoachPublicProfile } from "@/services/reviews";
import { getApiErrorMessage } from "@/lib/api";
import type { CoachPublicProfile, Review } from "@/types/reviews";

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

function genderLabel(value: string | null | undefined) {
  if (!value) return null;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function socialIcon(_key: string) {
  return <Link2 className="w-4 h-4" />;
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  photos,
  initialIndex,
  onClose,
}: {
  photos: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % photos.length), [photos.length]);

  // keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  // prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Transformation photo gallery"
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        onClick={onClose}
        aria-label="Close gallery"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-sm">
        {current + 1} / {photos.length}
      </div>

      {/* Prev */}
      {photos.length > 1 && (
        <button
          className="absolute left-3 sm:left-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          onClick={(e) => { e.stopPropagation(); prev(); }}
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <img
        key={current}
        src={photos[current]}
        alt={`Transformation ${current + 1}`}
        className="max-h-[85vh] max-w-[90vw] sm:max-w-[80vw] object-contain rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      {photos.length > 1 && (
        <button
          className="absolute right-3 sm:right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          onClick={(e) => { e.stopPropagation(); next(); }}
          aria-label="Next photo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 overflow-x-auto max-w-[90vw]">
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === current ? "border-white scale-110" : "border-white/30 opacity-60 hover:opacity-90"
                }`}
              aria-label={`Go to photo ${i + 1}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Review card ──────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
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

// ─── Page skeleton ────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="animate-pulse max-w-5xl mx-auto px-6 pt-10">
      <div className="flex flex-col sm:flex-row gap-5 mb-8 items-end">
        <div className="w-32 h-32 rounded-full bg-white/10 shrink-0" />
        <div className="space-y-3 pb-2">
          <div className="h-9 bg-white/10 rounded-xl w-56" />
          <div className="h-4 bg-white/10 rounded-lg w-36" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-24 bg-white/10 rounded-3xl" />
          <div className="h-20 bg-white/10 rounded-3xl" />
          <div className="h-48 bg-white/10 rounded-3xl" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-white/10 rounded-3xl" />
          <div className="h-28 bg-white/10 rounded-3xl" />
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
    <h2 className="flex items-center gap-2 text-base font-bold text-white mb-4">
      <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-brand/20 text-brand shrink-0">
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
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
      <span className="text-white/50 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">{label}</p>
        <p className="text-sm font-semibold text-white truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function CoachProfile() {
  const { tenantId } = useParams<{ tenantId: string }>();

  const [profile, setProfile] = useState<CoachPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
    <div className="min-h-screen text-white">

      {/* ── Full-page background (always present) ── */}
      <div aria-hidden className="fixed inset-0 z-0 bg-linear-to-br from-ink via-ink to-brand brightness-50">
        {coach?.avatarUrl && (
          <img
            src={coach.avatarUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-50 blur-xl scale-110"
          />
        )}
      </div>

      {/* all content sits above the fixed bg */}
      <div className="relative z-10">

        {/* ── Nav ── */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur-md">
          <div className="max-w-5xl mx-auto flex items-center justify-center px-6 py-3.5">
            <Link to="/">
              <img
                src="/Uply-light-logo.webp"
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

            {/* ── Identity strip ── */}
            <div className="max-w-5xl mx-auto px-6">
              <div className="flex flex-col items-center sm:flex-row sm:items-end gap-5 pt-10 mb-8">
                {/* Coach avatar */}
                <div className="w-32 h-32 shrink-0 rounded-full border-4 border-white/10 shadow-xl overflow-hidden bg-white/5 backdrop-blur-md relative z-10">
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
                <div className="relative z-10 text-center sm:text-left sm:pb-2 min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                    {coach.firstName} {coach.lastName}
                  </h1>

                  {coach.location && (
                    <p className="flex items-center justify-center sm:justify-start gap-1.5 mt-2 text-sm text-white/60">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {coach.location}
                    </p>
                  )}
                </div>
              </div>

              {/* ── Content grid ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-16">

                {/* Left column — main content */}
                <div className="lg:col-span-2 space-y-6">

                  {/* Bio */}
                  {(coach.bio || coach.careerExperience) && (
                    <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-md">
                      <SectionHeading icon={<User className="w-4 h-4" />}>About</SectionHeading>
                      {coach.bio && (
                        <p className="text-sm text-white/70 leading-relaxed">{coach.bio}</p>
                      )}
                      {coach.careerExperience && (
                        <p className={`text-sm text-white/70 leading-relaxed ${coach.bio ? "mt-3" : ""}`}>
                          {coach.careerExperience}
                        </p>
                      )}
                    </section>
                  )}

                  {/* Specialties */}
                  {coach.specialties && coach.specialties.length > 0 && (
                    <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-md">
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
                    <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-md">
                      <SectionHeading icon={<Award className="w-4 h-4" />}>Certifications</SectionHeading>
                      <div className="space-y-3">
                        {coach.certifications.map((cert, i) => (
                          <div
                            key={i}
                            className="flex items-start justify-between gap-3 p-4 rounded-2xl border border-white/10 bg-white/5"
                          >
                            <div className="flex gap-3 min-w-0">
                              <span className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-xl bg-success/10 text-success shrink-0">
                                <BadgeCheck className="w-4 h-4" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white">{cert.name}</p>
                                {(cert.issuer || cert.issueDate || cert.expiryDate) && (
                                  <p className="text-xs text-white/60 mt-0.5">
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
                                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
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
                                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
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
                    <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-md">
                      <SectionHeading icon={<Images className="w-4 h-4" />}>
                        Transformation Photos
                      </SectionHeading>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {coach.transformationPhotos.map((photoUrl, index) => (
                          <button
                            key={`${photoUrl}-${index}`}
                            onClick={() => setLightboxIndex(index)}
                            className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                            aria-label={`Open transformation photo ${index + 1}`}
                          >
                            <img
                              src={photoUrl}
                              alt={`Transformation ${index + 1}`}
                              className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Lightbox */}
                  {lightboxIndex !== null && coach.transformationPhotos?.length > 0 && (
                    <Lightbox
                      photos={coach.transformationPhotos}
                      initialIndex={lightboxIndex}
                      onClose={() => setLightboxIndex(null)}
                    />
                  )}

                  {/* Reviews */}
                  <section>
                    {/* Rating summary */}
                    <SectionHeading icon={<MessageSquare className="w-4 h-4" />}>
                      Client Reviews
                    </SectionHeading>

                    {rating.count > 0 && (
                      <div className="flex items-center gap-4 p-5 mb-4 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-md">
                        <span className="text-5xl font-black text-white tabular-nums leading-none">
                          {rating.average.toFixed(1)}
                        </span>
                        <div className="flex flex-col gap-1.5">
                          <StarRating rating={Math.round(rating.average)} size={18} />
                          <span className="text-sm text-white/60">
                            Based on {rating.count} {rating.count === 1 ? "review" : "reviews"}
                          </span>
                        </div>
                      </div>
                    )}
                    {reviews.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-white/20 rounded-3xl bg-white/5 backdrop-blur-md min-h-40">
                        <MessageSquare className="w-8 h-8 text-muted-foreground/40" strokeWidth={1.5} />
                        <p className="text-sm font-medium text-white/60">No reviews yet</p>
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
                  {(coach.yearsExperience != null || coach.age != null || coach.gender || coach.offlineAvailability || coach.availabilityHours || hasPricing) && (
                    <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-md space-y-3">
                      {coach.yearsExperience != null && (
                        <StatPill
                          icon={<Award className="w-4 h-4" />}
                          label="Experience"
                          value={`${coach.yearsExperience} ${coach.yearsExperience === 1 ? "year" : "years"}`}
                        />
                      )}
                      {coach.age != null && (
                        <StatPill
                          icon={<UserCircle2 className="w-4 h-4" />}
                          label="Age"
                          value={`${coach.age} years old`}
                        />
                      )}
                      {coach.gender && (
                        <StatPill
                          icon={<User className="w-4 h-4" />}
                          label="Gender"
                          value={genderLabel(coach.gender) ?? ""}
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
                              ? `${coach.priceFrom.toLocaleString()} – ${coach.priceTo.toLocaleString()}`
                              : coach.priceFrom != null
                                ? `From ${coach.priceFrom.toLocaleString()}`
                                : `Up to ${coach.priceTo!.toLocaleString()}`
                          }
                        />
                      )}
                    </section>
                  )}

                  {/* Social links */}
                  {coach.socialLinks && Object.keys(coach.socialLinks).length > 0 && (
                    <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-md">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-3">
                        Social
                      </p>
                      <div className="flex flex-col gap-2">
                        {Object.entries(coach.socialLinks).map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 text-sm font-semibold text-white hover:text-brand transition-colors"
                          >
                            <span className="text-white/50">{socialIcon(platform)}</span>
                            <span className="capitalize">{platform}</span>
                          </a>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Featured review quote */}
                  {/* {coach.featuredReviews && (
                    <section className="rounded-3xl border border-brand/30 bg-brand/10 backdrop-blur-md p-5 shadow-md">
                      <Quote className="w-6 h-6 text-brand mb-3" />
                      <p className="text-sm text-foreground leading-relaxed italic">
                        {coach.featuredReviews}
                      </p>
                    </section>
                  )} */}

                  {/* Tenant card */}
                  <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-md">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-3">
                      Coaching Studio
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-14 h-14 rounded-2xl shrink-0" >
                        {coach.tenant.logoUrl ? (
                          <AvatarImage
                            src={coach.tenant.logoUrl}
                            alt={coach.tenant.name}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="rounded-2xl bg-white/10 text-white/60">
                          <Building2 className="w-7 h-7" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{coach.tenant.name}</p>
                        <p className="text-xs text-white/50 mt-0.5 truncate">
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
    </div>
  );
}

export default CoachProfile;
