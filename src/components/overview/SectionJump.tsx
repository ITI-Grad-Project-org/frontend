import { Link } from "react-router";
import {
  Apple,
  BarChart3,
  Calendar,
  Dumbbell,
  MessageCircleMore,
  Star,
  UsersRound,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionJumpMetrics {
  activeClients: number;
  publishedPrograms: number;
  draftPrograms: number;
  publishedNutrition: number;
  draftNutrition: number;
  adherencePct: number | null;
  reviewCount: number;
  reviewAverage: number;
  unread: number;
}

export function SectionJump({
  metrics,
  loading,
}: {
  metrics: SectionJumpMetrics;
  loading: boolean;
}) {
  const entries = [
    {
      label: "Clients",
      to: "/dashboard/clients",
      icon: UsersRound,
      chip: "bg-chip-violet text-violet",
      meta: loading
        ? "Loading roster…"
        : metrics.activeClients === 0
          ? "Start building your roster"
          : `${metrics.activeClients} active client${metrics.activeClients === 1 ? "" : "s"}`,
      value: String(metrics.activeClients),
      urgent: false,
    },
    {
      label: "Exercise plans",
      to: "/dashboard/plans",
      icon: Calendar,
      chip: "bg-chip-mint text-success",
      meta:
        loading
          ? "Loading programs…"
          : metrics.publishedPrograms === 0 && metrics.draftPrograms === 0
            ? "No programs yet — create your first"
            : metrics.draftPrograms === 0
              ? "All published — nothing in draft"
              : `${metrics.publishedPrograms} published · ${metrics.draftPrograms} in draft`,
      value: String(metrics.publishedPrograms),
      urgent: false,
    },
    {
      label: "Nutrition plans",
      to: "/dashboard/nutrition-plans",
      icon: Apple,
      chip: "bg-chip-peach text-brand",
      meta:
        loading
          ? "Loading plans…"
          : metrics.publishedNutrition === 0 && metrics.draftNutrition === 0
            ? "No plans yet — create your first"
            : metrics.draftNutrition === 0
              ? "All published — nothing in draft"
              : `${metrics.publishedNutrition} published · ${metrics.draftNutrition} in draft`,
      value: String(metrics.publishedNutrition),
      urgent: false,
    },
    {
      label: "Analytics",
      to: "/dashboard/analytics",
      icon: BarChart3,
      chip: "bg-chip-yellow text-warn",
      meta:
        loading || metrics.adherencePct == null
          ? "No sessions tracked yet"
          : `Session adherence ${Math.round(metrics.adherencePct)}% over the last 30 days`,
      value: metrics.adherencePct == null ? "—" : `${Math.round(metrics.adherencePct)}%`,
      urgent: false,
    },
    {
      label: "Reviews",
      to: "/dashboard/reviews",
      icon: Star,
      chip: "bg-chip-pink text-danger",
      meta:
        metrics.reviewCount === 0
          ? "No reviews yet"
          : `${metrics.reviewCount} review${metrics.reviewCount === 1 ? "" : "s"} · ${metrics.reviewAverage.toFixed(1)} average`,
      value: metrics.reviewAverage > 0 ? metrics.reviewAverage.toFixed(1) : "—",
      urgent: false,
    },
    {
      label: "Chat",
      to: "/dashboard/chat",
      icon: MessageCircleMore,
      chip: "bg-chip-mint text-success",
      meta:
        metrics.unread === 0
          ? "All conversations handled"
          : `${metrics.unread} unread message${metrics.unread === 1 ? "" : "s"}`,
      value: String(metrics.unread),
      urgent: metrics.unread > 0,
    },
  ];

  return (
    <section aria-label="Workspace shortcuts" className="card-surface p-6 md:p-8">
      <div className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">Workspace</p>
        <h2 className="mt-1 text-xl font-black font-display tracking-tight text-foreground">
          Move through your dashboard
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Every section, one click away — with today’s numbers attached.
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => {
          const Icon = entry.icon;
          return (
            <Link
              key={entry.to}
              to={entry.to}
              className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card/60 px-3 py-3 md:px-4 md:py-3.5 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-card"
            >
              <span className={cn("grid size-9 md:size-10 shrink-0 place-items-center rounded-xl", entry.chip)}>
                <Icon className="size-4 md:size-5" strokeWidth={2.25} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-foreground">{entry.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{entry.meta}</span>
              </span>
              <span
                className={cn(
                  "grid h-7 min-w-7 shrink-0 place-items-center rounded-full px-2 text-xs font-black tabular-nums",
                  entry.urgent
                    ? "bg-danger/10 text-danger"
                    : loading
                      ? "bg-muted text-muted-foreground"
                      : "bg-muted text-foreground",
                )}
              >
                {loading ? "…" : entry.value}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Library
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/dashboard/exercises"
            className="group inline-flex items-center gap-2 rounded-full border border-border/70 px-3.5 py-1.5 text-sm font-semibold text-foreground transition hover:border-brand/40 hover:text-brand"
          >
            <Dumbbell className="size-4" strokeWidth={2.25} />
            Exercises
          </Link>
          <Link
            to="/dashboard/meals"
            className="group inline-flex items-center gap-2 rounded-full border border-border/70 px-3.5 py-1.5 text-sm font-semibold text-foreground transition hover:border-brand/40 hover:text-brand"
          >
            <Utensils className="size-4" strokeWidth={2.25} />
            Meals
          </Link>
        </div>
      </div>
    </section>
  );
}