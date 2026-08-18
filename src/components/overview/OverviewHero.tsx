import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  CalendarClock,
  Check,
  ChevronRight,
  ClipboardCheck,
  MessageCircleMore,
  UserX,
} from "lucide-react";
import type { AttentionQueue } from "@/types/analytics";

// function formatHours(hours: number | undefined | null): string {
//   if (hours == null) return "—";
//   if (hours < 1 / 60) return "less than a minute";
//   if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
//   if (hours < 24) return `${Math.round(hours)}h`;
//   return `${Math.round(hours / 24)}d`;
// }

// function formatDays(days: number | null | undefined): string {
//   if (days == null) return "—";
//   return `${days}d`;
// }

interface OverviewHeroProps {
  loading: boolean;
  unread: number;
  queue: AttentionQueue | null | undefined;
  fallbackCounts: {
    checkins: number;
    atRisk: number;
    programsEnding: number;
  };
  dateLabel: string;
}

export function OverviewHero({
  loading,
  unread,
  queue,
  fallbackCounts,
  dateLabel,
}: OverviewHeroProps) {
  const navigate = useNavigate();

  const checkins = queue ? queue.checkinsAwaitingReview.length : fallbackCounts.checkins;
  const atRisk = queue ? queue.atRisk.length : fallbackCounts.atRisk;
  const programsEnding = queue ? queue.programsEndingSoon.length : fallbackCounts.programsEnding;
  const total = unread + checkins + atRisk + programsEnding;

  // const oldestCheckin = queue && queue.checkinsAwaitingReview.length > 0
  //   ? Math.max(...queue.checkinsAwaitingReview.map((c) => c.daysWaiting ?? 0))
  //   : null;
  // const quietClient = queue?.atRisk[0];
  const endingProgram = queue?.programsEndingSoon[0];

  const deck = [
    {
      id: "unread",
      label: "Unread conversations",
      sub:
        unread === 0
          ? "Nothing waiting in your inbox"
          : unread === 1
            ? "1 message needs a reply"
            : `${unread} messages need a reply`,
      count: unread,
      to: "/dashboard/chat",
      icon: MessageCircleMore,
    },
    {
      id: "checkins",
      label: "Check-ins awaiting review",
      // sub:
      //   checkins === 0
      //     ? "All reviewed"
      //     : oldestCheckin != null && oldestCheckin > 0
      //       ? `oldest waiting ${formatHours(oldestCheckin)}`
      //       : `${checkins} waiting on you`,
      count: checkins,
      to: "/dashboard/clients",
      icon: ClipboardCheck,
    },
    {
      id: "at-risk",
      label: "Clients gone quiet",
      // sub:
      //   atRisk === 0
      //     ? "Everyone is active"
      //     : quietClient
      //       ? `${quietClient.clientName} silent ${formatDays(quietClient.daysSilent)}`
      //       : `${atRisk} past the silence threshold`,
      count: atRisk,
      to: "/dashboard/clients",
      icon: UserX,
    },
    {
      id: "programs",
      label: "Programs ending soon",
      sub:
        programsEnding === 0
          ? "Nothing ending soon"
          : endingProgram
            ? `${endingProgram.programName} ends in ${endingProgram.daysRemaining}d`
            : `${programsEnding} end within 14 days`,
      count: programsEnding,
      to: "/dashboard/plans",
      icon: CalendarClock,
    },
  ];

  const primary =
    unread > 0
      ? {
        label: "Open chat",
        to: "/dashboard/chat",
        copy: `Start with your ${unread === 1 ? "unread message" : `${unread} unread messages`}. A fast reply keeps your clients moving.`,
      }
      : checkins > 0
        ? {
          label: "Review check-ins",
          to: "/dashboard/clients",
          copy: `${checkins} check-in${checkins === 1 ? "" : "s"} need${checkins === 1 ? "s" : ""} a reply. Waiting too long erodes trust.`,
        }
        : atRisk > 0
          ? {
            label: "Reach out",
            to: "/dashboard/clients",
            copy: `${atRisk} client${atRisk === 1 ? " has" : "s have"} gone quiet. One message can bring them back.`,
          }
          : programsEnding > 0
            ? {
              label: "Review plans",
              to: "/dashboard/plans",
              copy: `${programsEnding} program${programsEnding === 1 ? " ends" : "s end"} soon. Decide what’s next.`,
            }
            : {
              label: "See this week",
              to: "/dashboard/analytics",
              copy: "No unread messages, pending check-ins, or soon-ending programs. Use the quiet to look ahead.",
            };

  const headline =
    total > 0
      ? total === 1
        ? "One thing needs you today."
        : `${total} things need you today.`
      : "You’re all caught up.";

  return (
    <section aria-label="Daily briefing" className="card-ink p-4 sm:p-6 md:p-10">
      {loading ? (
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-3 lg:col-span-7">
            <div className="h-3 w-40 animate-pulse rounded-full bg-white/15" />
            <div className="h-10 w-72 max-w-full animate-pulse rounded-xl bg-white/10" />
            <div className="h-3 w-full max-w-md animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="space-y-2 lg:col-span-5">
            <div className="h-4 w-32 animate-pulse rounded-full bg-white/15" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-white/8" />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-7">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
              The coach briefing · {dateLabel}
            </p>
            <h2 className="mt-3 text-3xl font-black font-display tracking-tight text-white sm:text-4xl md:text-5xl">
              {headline}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65">{primary.copy}</p>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link to={primary.to} className="btn-primary w-full justify-center sm:w-auto">
                {primary.label}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/dashboard/analytics"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/60 transition hover:text-white"
              >
                Full analytics <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          <div className="min-w-0 lg:col-span-5 lg:border-l lg:border-white/10 lg:pl-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
                Needs your attention
              </p>
              <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold tabular-nums text-white">
                {total}
              </span>
            </div>
            <ul className="space-y-1.5">
              {deck.map((row) => {
                const Icon = row.icon;
                const zero = row.count === 0;
                return (
                  <li key={row.id} className="overflow-hidden">
                    <button
                      type="button"
                      onClick={() => void navigate(row.to)}
                      className="group flex min-w-0 w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-white/10"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white transition group-hover:bg-white/20">
                        <Icon className="size-4" strokeWidth={2.25} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">
                          {row.label}
                        </span>
                        <span className="block truncate text-xs text-white/55">{row.sub}</span>
                      </span>
                      {zero ? (
                        <Check className="size-4 shrink-0 text-success" strokeWidth={2.5} />
                      ) : (
                        <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-white/15 px-2 text-xs font-black tabular-nums text-white">
                          {row.count}
                        </span>
                      )}
                      <ChevronRight className="size-4 shrink-0 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}