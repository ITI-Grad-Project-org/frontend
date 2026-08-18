import { Link } from "react-router";
import { ArrowRight, ArrowUpRight, ClipboardCheck, MailPlus } from "lucide-react";
import CardMain from "@/components/cards/CardMain";
import { TrainingWeekStrip } from "@/components/analytics/TrainingWeekStrip";
import { StarRating } from "@/components/reviews/ReviewCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AnalyticsOverview } from "@/types/analytics";
import type { Review } from "@/types/reviews";

function ThisWeekCard({
  week,
  loading,
}: {
  week: AnalyticsOverview["thisWeek"] | undefined;
  loading: boolean;
}) {
  return (
    <CardMain className="h-full justify-start">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">Pulse</p>
          <h3 className="mt-1 text-lg font-black font-display tracking-tight text-foreground">
            This week
          </h3>
        </div>
        <Link
          to="/dashboard/analytics"
          aria-label="Open analytics"
          className="icon-btn hover:bg-muted"
        >
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
      {loading || !week ? (
        <div className="h-44 animate-pulse rounded-2xl bg-muted/60" />
      ) : (
        <TrainingWeekStrip week={week} />
      )}
    </CardMain>
  );
}

function ReviewsCard({
  average,
  count,
  latest,
  loading,
}: {
  average: number;
  count: number;
  latest: Review | undefined;
  loading: boolean;
}) {
  return (
    <CardMain className="h-full justify-start">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">Reputation</p>
          <h3 className="mt-1 text-lg font-black font-display tracking-tight text-foreground">
            Reviews
          </h3>
        </div>
        <Link
          to="/dashboard/reviews"
          aria-label="Open reviews"
          className="icon-btn hover:bg-muted"
        >
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
      {loading ? (
        <div className="flex-1 animate-pulse rounded-2xl bg-muted/60" />
      ) : (
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-5xl font-black tabular-nums font-display tracking-tight text-foreground">
                {average > 0 ? average.toFixed(1) : "0"}
              </span>
              <span className="ml-1 text-sm text-muted-foreground">/ 5</span>
            </div>
            <StarRating rating={average > 0 ? Math.round(average) : 0} size={16} />
          </div>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {count === 0
              ? "No reviews yet — they build your public profile."
              : count === 1
                ? "1 client review"
                : `${count} client reviews`}
          </p>
          {latest ? (
            <figure className="mt-3 rounded-2xl bg-muted/50 p-4">
              <blockquote className="text-sm leading-relaxed text-foreground/80 line-clamp-3">
                “{latest.comment && latest.comment.trim() ? latest.comment : `Left a ${latest.rating}-star rating.`}”
              </blockquote>
              <figcaption className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Avatar size="sm">
                  {latest.client.avatarUrl ? (
                    <AvatarImage src={latest.client.avatarUrl} alt={`${latest.client.firstName} ${latest.client.lastName}`} />
                  ) : null}
                  <AvatarFallback>
                    {`${latest.client.firstName[0] ?? ""}${latest.client.lastName[0] ?? ""}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {`${latest.client.firstName} ${latest.client.lastName}`.trim()}
              </figcaption>
            </figure>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              When clients leave feedback, the latest one appears here.
            </p>
          )}
        </div>
      )}
    </CardMain>
  );
}

function IntakeCard({
  activeCount,
  pendingRequests,
  pendingInvitations,
  loading,
}: {
  activeCount: number;
  pendingRequests: number;
  pendingInvitations: number;
  loading: boolean;
}) {
  return (
    <CardMain className="h-full justify-start">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">Roster</p>
          <h3 className="mt-1 text-lg font-black font-display tracking-tight text-foreground">
            Client intake
          </h3>
        </div>
        <Link
          to="/dashboard/clients"
          aria-label="Open clients"
          className="icon-btn hover:bg-muted"
        >
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
      {loading ? (
        <div className="flex-1 animate-pulse rounded-2xl bg-muted/60" />
      ) : (
        <div className="flex flex-1 flex-col">
          <div>
            <span className="text-5xl font-black tabular-nums font-display tracking-tight text-foreground">
              {activeCount}
            </span>
            <span className="ml-1 text-sm text-muted-foreground">
              {activeCount === 1 ? "active client" : "active clients"}
            </span>
          </div>

          <div className="mt-4 flex flex-col">
            <Link
              to="/dashboard/clients?tab=requests"
              className={`group flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 transition hover:-translate-y-px ${pendingRequests > 0
                ? "border-warn/25 bg-warn/5 hover:border-warn/50"
                : "border-border/70 hover:bg-muted/60"
                }`}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-chip-pink text-danger">
                <ClipboardCheck className="size-4" strokeWidth={2.25} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">Join requests</span>
                <span className="block text-xs text-muted-foreground">
                  {pendingRequests === 0 ? "Nothing waiting for approval" : `Approve or decline`}
                </span>
              </span>
              {pendingRequests > 0 && (
                <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-warn/15 px-2 text-xs font-black tabular-nums text-warn">
                  {pendingRequests}
                </span>
              )}
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
            </Link>

            <Link
              to="/dashboard/clients?tab=invitations"
              className={`group mt-1.5 flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 transition hover:-translate-y-px ${pendingInvitations > 0
                ? "border-brand/25 bg-brand/5 hover:border-brand/50"
                : "border-border/70 hover:bg-muted/60"
                }`}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-chip-peach text-brand">
                <MailPlus className="size-4" strokeWidth={2.25} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">
                  Pending invitations
                </span>
                <span className="block text-xs text-muted-foreground">
                  {pendingInvitations === 0 ? "None outstanding" : `Waiting to be accepted`}
                </span>
              </span>
              {pendingInvitations > 0 && (
                <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-brand/15 px-2 text-xs font-black tabular-nums text-brand">
                  {pendingInvitations}
                </span>
              )}
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      )}
    </CardMain>
  );
}

interface OverviewPulseProps {
  week: AnalyticsOverview["thisWeek"] | undefined;
  weekLoading: boolean;
  average: number;
  reviewCount: number;
  latestReview: Review | undefined;
  reviewsLoading: boolean;
  activeCount: number;
  pendingRequests: number;
  pendingInvitations: number;
  intakeLoading: boolean;
}

export function OverviewPulse(props: OverviewPulseProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <ThisWeekCard week={props.week} loading={props.weekLoading} />
      <ReviewsCard
        average={props.average}
        count={props.reviewCount}
        latest={props.latestReview}
        loading={props.reviewsLoading}
      />
      <IntakeCard
        activeCount={props.activeCount}
        pendingRequests={props.pendingRequests}
        pendingInvitations={props.pendingInvitations}
        loading={props.intakeLoading}
      />
    </div>
  );
}