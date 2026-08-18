import { TrendingDown, TrendingUp } from "lucide-react";
import type { AnalyticsWeekDay } from "@/types/analytics";
import { getLocalDateInputValue } from "@/lib/dates";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function weekdayLabel(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

interface TrainingWeekStripProps {
  week: {
    weekStart: string;
    weekEnd: string;
    sessionsLogged: number;
    previousWeekSessions: number;
    changePct: number;
    byDay: AnalyticsWeekDay[];
  };
}

export function TrainingWeekStrip({ week }: TrainingWeekStripProps) {
  const today = getLocalDateInputValue();
  const maxSessions = Math.max(1, ...week.byDay.map((d) => d.sessions));
  const prev = week.previousWeekSessions;
  const isUp = week.changePct > 0;
  const isFlat = week.changePct === 0;
  const isNew =
    prev === 0 && week.sessionsLogged > 0
      ? true
      : prev === 0 && week.sessionsLogged === 0
        ? false
        : null;

  const deltaLabel = isNew === null ? (
    <>
      {week.sessionsLogged - prev >= 0 ? "+" : ""}
      {week.sessionsLogged - prev} vs last week
    </>
  ) : (
    "vs last week"
  );

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="text-6xl font-black tabular-nums font-display tracking-tight text-foreground">
            {week.sessionsLogged}
          </p>
          <p className="text-xs font-semibold text-muted-foreground">sessions logged this week</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums",
            isNew === true
              ? "bg-success/10 text-success"
              : isNew === false
                ? "bg-muted text-muted-foreground"
                : isUp
                  ? "bg-success/10 text-success"
                  : isFlat
                    ? "bg-muted text-muted-foreground"
                    : "bg-danger/10 text-danger",
          )}
        >
          {isNew === true ? (
            <>
              <TrendingUp className="size-3.5" /> New
            </>
          ) : isNew === false ? (
            <>—</>
          ) : isUp ? (
            <>
              <TrendingUp className="size-3.5" /> +{week.changePct}%
            </>
          ) : isFlat ? (
            <>±0%</>
          ) : (
            <>
              <TrendingDown className="size-3.5" /> {week.changePct}%
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="img" aria-label="Sessions by day">
        {week.byDay.map((day) => {
          const isToday = day.date === today;
          const pct = day.sessions / maxSessions;
          return (
            <div
              key={day.date}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl px-1 pb-2 pt-1.5 transition-colors",
                isToday ? "bg-brand/10 ring-1 ring-brand/40" : "hover:bg-muted/60",
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {weekdayLabel(day.date) || WEEKDAY_LABELS[day.dayOfWeek] || ""}
              </span>
              <div className="flex h-14 items-end" title={`${day.sessions} session${day.sessions === 1 ? "" : "s"}`}>
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all duration-500",
                    day.sessions > 0 ? "bg-brand" : "bg-muted",
                  )}
                  style={{
                    height: `${Math.max(day.sessions > 0 ? 12 : 4, Math.round(pct * 100))}%`,
                  }}
                />
              </div>
              <span className="text-xs font-bold tabular-nums text-muted-foreground">
                {day.sessions}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="min-w-0 truncate">
          {week.weekStart} → {week.weekEnd}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="size-2 rounded-full bg-brand" />
          <span>{deltaLabel}</span>
        </span>
      </div>
    </div>
  );
}