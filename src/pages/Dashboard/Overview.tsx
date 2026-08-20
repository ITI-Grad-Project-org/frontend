import { useMemo } from "react";
import { Link } from "react-router";
import { MailPlus, Plus } from "lucide-react";
import { addDays, formatDateLabel, getLocalDateInputValue } from "@/lib/dates";
import { useAuthStore } from "@/stores/auth-store";
import { useAnalyticsOverview } from "@/hooks/analytics/useAnalyticsOverview";
import { useAttentionQueue } from "@/hooks/analytics/useAttentionQueue";
import { useActivityFeed } from "@/hooks/analytics/useActivityFeed";
import { useUnreadMessages } from "@/hooks/coach/useUnreadMessages";
import { useCoachConversationLastSeen } from "@/hooks/coach/useCoachConversationLastSeen";
import { useRosterReport } from "@/hooks/analytics/useRosterReport";
import { useClientsData } from "@/hooks/clients/useClientsData";
import { usePendingMeasurementReviews } from "@/hooks/clients/useMeasurementReviews";
import { usePlansData } from "@/hooks/plans/usePlansData";
import { useNutritionPlansData } from "@/hooks/nutritionPlans/useNutritionPlansData";
import { useReviewsData } from "@/hooks/reviews/useReviewsData";
import { OverviewHero } from "@/components/overview/OverviewHero";
import { OverviewPulse } from "@/components/overview/OverviewPulse";
import { RecentClients } from "@/components/overview/RecentClients";
import { SectionJump } from "@/components/overview/SectionJump";
import { ActivityTimeline } from "@/components/analytics/ActivityTimeline";
import CardMain from "@/components/cards/CardMain";

function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Overview() {
  const coach = useAuthStore((state) => state.user);

  const today = getLocalDateInputValue();
  const from = addDays(today, -(30 - 1));
  const to = today;

  const overview = useAnalyticsOverview(from, to);
  const attention = useAttentionQueue(to);
  const activity = useActivityFeed(from, to);
  const roster = useRosterReport(from, to);
  const unreadQuery = useUnreadMessages();
  const conversationLastSeen = useCoachConversationLastSeen();
  const clientsData = useClientsData();
  const pendingReviews = usePendingMeasurementReviews({ limit: 100 });
  const plans = usePlansData();
  const nutrition = useNutritionPlansData();
  const reviews = useReviewsData();

  const unread = unreadQuery.data ?? 0;
  const firstName =
    coach?.firstName ?? coach?.lastName ?? coach?.email?.split("@")[0] ?? "";

  const activeClients = useMemo(
    () =>
      clientsData.clients.data.filter(
        (connection) => connection && connection.client && connection.status === "active",
      ),
    [clientsData.clients.data],
  );

  const pendingRequests = useMemo(
    () =>
      clientsData.joinRequests.data.filter(
        (request) => request && !["accepted", "rejected", "ended"].includes(request.status ?? ""),
      ).length,
    [clientsData.joinRequests.data],
  );

  const pendingInvitations = useMemo(
    () => clientsData.invitations.data.filter((invitation) => invitation.status === "pending").length,
    [clientsData.invitations.data],
  );

  const rosterLastSeen = useMemo(() => {
    const map = new Map<string, number>();
    for (const client of roster.report?.clients ?? []) {
      if (client.lastActivityOn) {
        const time = new Date(client.lastActivityOn).getTime();
        if (!Number.isNaN(time)) map.set(client.membershipId, time);
      }
    }
    return map;
  }, [roster.report]);

  const lastSeenMs = useMemo(() => {
    const map = new Map<string, number>();
    const consider = (membershipId: string, timeMs: number) => {
      const previous = map.get(membershipId);
      if (previous === undefined || timeMs > previous) map.set(membershipId, timeMs);
    };
    for (const connection of activeClients) {
      if (connection.lastActiveAt) consider(connection.id, new Date(connection.lastActiveAt).getTime());
      if (connection.client.lastLoginAt) {
        consider(connection.id, new Date(connection.client.lastLoginAt).getTime());
      }
    }
    for (const [membershipId, timeMs] of rosterLastSeen) consider(membershipId, timeMs);
    for (const [clientId, timeMs] of conversationLastSeen.data ?? []) {
      const connection = activeClients.find((c) => c.client.id === clientId);
      if (connection) consider(connection.id, timeMs);
    }
    return map;
  }, [activeClients, rosterLastSeen, conversationLastSeen.data]);

  const publishedPrograms = Math.max(
    0,
    plans.stats.total - plans.stats.drafts - plans.stats.canceled,
  );
  const publishedNutrition = Math.max(
    0,
    nutrition.stats.total - nutrition.stats.drafts - nutrition.stats.canceled,
  );

  const sortedReviews = useMemo(
    () =>
      [...reviews.reviews].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [reviews.reviews],
  );

  const pendingCheckins =
    pendingReviews.loading && pendingReviews.docs.length === 0
      ? null
      : pendingReviews.docs.length;

  const queueCounts = attention.queue && pendingCheckins != null
    ? {
        checkins: pendingCheckins,
        atRisk: attention.queue.atRisk.length,
        programsEnding: attention.queue.programsEndingSoon.length,
      }
    : {
        checkins:
          pendingCheckins ?? (overview.overview?.checkinsAwaitingReview ?? 0),
        atRisk: attention.queue?.atRisk.length ?? overview.overview?.clientsAtRisk ?? 0,
        programsEnding:
          attention.queue?.programsEndingSoon.length ?? overview.overview?.programsEndingSoon ?? 0,
      };

  const totalWaiting = unread + queueCounts.checkins + queueCounts.atRisk + queueCounts.programsEnding;
  const heroLoading =
    attention.loading &&
    !attention.queue &&
    overview.loading &&
    !overview.overview &&
    unreadQuery.isPending;

  const summaryLine =
    heroLoading || (overview.loading && !overview.overview)
      ? "Loading your briefing…"
      : totalWaiting > 0
        ? `${totalWaiting} item${totalWaiting === 1 ? "" : "s"} across your practice need a decision today.`
        : activeClients.length > 0
          ? `${activeClients.length} active client${activeClients.length === 1 ? "" : "s"} — everyone is up to speed.`
          : "Welcome — invite your first client to get the practice moving.";

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-400">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
            {formatDateLabel(today, { weekday: "long" })} · {timeGreeting()}
          </p>
          <h1 className="mt-1 text-4xl font-black font-display tracking-tight text-foreground">
            {timeGreeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{summaryLine}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard/clients" className="btn-ghost">
            <MailPlus className="size-4" />
            Invite a client
          </Link>
          <Link to="/dashboard/plans" className="btn-primary">
            <Plus className="size-4" />
            New exercise plan
          </Link>
        </div>
      </div>

      <OverviewHero
        loading={heroLoading}
        unread={unread}
        queue={attention.queue}
        checkinsOverride={
          pendingReviews.loading && pendingReviews.docs.length === 0
            ? undefined
            : pendingReviews.docs.length
        }
        fallbackCounts={queueCounts}
        dateLabel={new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      />

      <OverviewPulse
        week={overview.overview?.thisWeek}
        weekLoading={overview.loading && !overview.overview}
        average={reviews.summary.average}
        reviewCount={reviews.summary.count}
        latestReview={sortedReviews[0]}
        reviewsLoading={reviews.loading && sortedReviews.length === 0}
        activeCount={activeClients.length}
        pendingRequests={pendingRequests}
        pendingInvitations={pendingInvitations}
        intakeLoading={clientsData.clients.loading && clientsData.clients.data.length === 0}
      />

      <div className="grid gap-4 md:grid-cols-5">
        <CardMain className="h-full md:col-span-3">
          <ActivityTimeline
            events={activity.events}
            loading={activity.loading}
            error={activity.error}
            onRetry={activity.refetch}
          />
        </CardMain>
        <RecentClients
          clients={activeClients}
          lastSeenMs={lastSeenMs}
          loading={clientsData.clients.loading}
        />
      </div>

      <SectionJump
        metrics={{
          activeClients: activeClients.length,
          publishedPrograms,
          draftPrograms: plans.stats.drafts,
          publishedNutrition,
          draftNutrition: nutrition.stats.drafts,
          adherencePct: overview.overview?.sessionAdherencePct ?? null,
          reviewCount: reviews.summary.count,
          reviewAverage: reviews.summary.average,
          unread,
        }}
        loading={plans.isLoading || nutrition.isLoading || (overview.loading && !overview.overview)}
      />
    </div>
  );
}

export default Overview;