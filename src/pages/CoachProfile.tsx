import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import {
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
  Images,
  Share2,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/reviews/ReviewCard";
import { Lightbox } from "@/components/coachProfile/Lightbox";
import { PageSkeleton } from "@/components/coachProfile/PageSkeleton";
import { SectionHeading } from "@/components/coachProfile/SectionHeading";
import { StatPill } from "@/components/coachProfile/StatPill";
import { CoachReviewCard } from "@/components/coachProfile/CoachReviewCard";
import { RatingBreakdown } from "@/components/coachProfile/RatingBreakdown";
import { MediaPreviewModal } from "@/components/ui/MediaPreviewModal";
import {
  formatDate,
  genderLabel,
  socialIcon,
  specialtyLabel,
} from "@/components/coachProfile/profile-utils";
import { useCoachPublicProfile } from "@/hooks/coach/useCoachPublicProfile";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoachProfile() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [previewCertUrl, setPreviewCertUrl] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const { profile, loading, error, isNotFound, fetchProfile } =
    useCoachPublicProfile(tenantId);

  const coach = profile?.coach;
  const reviews = profile?.reviews ?? [];
  const rating = profile?.rating ?? { average: 0, count: 0 };

  const hasPricing = coach?.priceFrom != null || coach?.priceTo != null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied.");
    } catch {
      toast.error("Could not copy the profile link.");
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 160);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    if (coach) {
      document.title = `${coach.firstName} ${coach.lastName} · Uply Coach`;
    }
    return () => {
      document.title = previousTitle;
    };
  }, [coach]);

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
          <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3.5">
            <Link to="/">
              <img
                src="/Uply-light-logo.webp"
                alt="Uply"
                className="h-7 w-auto"
              />
            </Link>

            {scrolled && coach && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <Avatar className="w-8 h-8 shrink-0 border border-white/20">
                  {coach.avatarUrl ? (
                    <AvatarImage
                      src={coach.avatarUrl}
                      alt={`${coach.firstName} ${coach.lastName}`}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="bg-white/10 text-white text-xs font-semibold">
                    {`${coach.firstName[0] ?? ""}${coach.lastName[0] ?? ""}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-44 truncate text-sm font-semibold text-white">
                  {coach.firstName} {coach.lastName}
                </span>
                <button
                  type="button"
                  onClick={() => void handleCopyLink()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white/80 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
              </div>
            )}
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

                  <div className="mt-4 flex justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => void handleCopyLink()}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-white rounded-full border border-white/20 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      Share profile
                    </button>
                  </div>
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
                        <>
                          <p className="text-sm text-white/70 leading-relaxed">{coach.bio}</p>
                        </>
                      )}
                      {coach.bio && coach.careerExperience && (
                        <div aria-hidden className="my-4 h-px bg-white/10" />
                      )}
                      {coach.careerExperience && (
                        <>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-3">
                            Career Experience
                          </p>
                          <p className="text-sm text-white/70 leading-relaxed">{coach.careerExperience}</p>
                        </>
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
                                {cert.issuer && (
                                  <p className="text-xs text-white/60 mt-0.5">Issued by {cert.issuer}</p>
                                )}
                                {cert.issueDate && (
                                  <p className="text-xs text-white/60 mt-0.5">Issued {formatDate(cert.issueDate)}</p>
                                )}
                                {cert.expiryDate && (
                                  <p className="text-xs text-white/60 mt-0.5">Expires {formatDate(cert.expiryDate)}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              {cert.fileUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewCertUrl(cert.fileUrl!)}
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View certificate
                                </button>
                              )}
                              {cert.credentialUrl && (
                                <a
                                  href={cert.credentialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  View credential
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

                  {/* Certificate preview */}
                  {previewCertUrl && (
                    <MediaPreviewModal
                      src={previewCertUrl}
                      alt="Certificate preview"
                      onClose={() => setPreviewCertUrl(null)}
                    />
                  )}

                  {/* Reviews */}
                  <section>
                    {/* Rating summary */}
                    <SectionHeading icon={<MessageSquare className="w-4 h-4" />}>
                      Client Reviews
                    </SectionHeading>

                    {rating.count > 0 && (
                      <div className="p-5 mb-4 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-md">
                        <div className="flex items-center gap-4">
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
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <RatingBreakdown reviews={reviews} />
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
                          <CoachReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                {/* Right column — sidebar */}
                <div className="space-y-5">

                  {/* Quick stats — only render if at least one value exists */}
                  {(coach.yearsExperience != null || coach.gender || coach.offlineAvailability || coach.availabilityHours || hasPricing) && (
                    <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-md space-y-3">
                      {coach.yearsExperience != null && (
                        <StatPill
                          icon={<Award className="w-4 h-4" />}
                          label="Experience"
                          value={`${coach.yearsExperience} ${coach.yearsExperience === 1 ? "year" : "years"}`}
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
                            <span className="text-white/50">{socialIcon()}</span>
                            <span className="capitalize">{platform}</span>
                          </a>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Tenant card */}
                  <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-md">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-3">
                      Coaching Studio
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-14 h-14 shrink-0" >
                        {coach.tenant.logoUrl ? (
                          <AvatarImage
                            src={coach.tenant.logoUrl}
                            alt={coach.tenant.name}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-white/10 text-white/60">
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