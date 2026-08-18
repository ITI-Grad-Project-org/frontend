import { useMemo } from "react";
import {
  Activity,
  ClipboardCheck,
  Dumbbell,
  Scale,
  Utensils,
} from "lucide-react";
import type { ActivityEvent } from "@/types/analytics";
import { cn } from "@/lib/utils";

interface TypeMeta {
  icon: typeof Activity;
  chip: string;
}

function typeMeta(type: string): TypeMeta {
  if (type === "workout_set_reported" || type === "workout_session_reported") {
    return { icon: Dumbbell, chip: "bg-chip-mint text-success" };
  }
  if (type === "nutrition_meal_reported") {
    return { icon: Utensils, chip: "bg-chip-peach text-brand" };
  }
  if (type === "measurement_reported") {
    return { icon: Scale, chip: "bg-chip-violet text-violet" };
  }
  if (type === "checkin_reported") {
    return { icon: ClipboardCheck, chip: "bg-chip-pink text-danger" };
  }
  return { icon: Activity, chip: "bg-chip-yellow text-warn" };
}

function typeLabel(type: string): string {
  if (type === "workout_set_reported") return "logged a workout set";
  if (type === "workout_session_reported") return "finished a session";
  if (type === "nutrition_meal_reported") return "logged a meal";
  if (type === "measurement_reported") return "recorded measurements";
  if (type === "checkin_reported") return "submitted a check-in";
  return "logged activity";
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatDay(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

interface ActivityTimelineProps {
  events: ActivityEvent[];
  loading: boolean;
  error: string;
  onRetry: () => void;
}

export function ActivityTimeline({ events, loading, error, onRetry }: ActivityTimelineProps) {
  const groups = useMemo(() => {
    const map = new Map<string, ActivityEvent[]>();
    for (const event of events) {
      const key = event.activityDate;
      const list = map.get(key);
      if (list) list.push(event);
      else map.set(key, [event]);
    }
    return Array.from(map.entries());
  }, [events]);

  if (loading) {
    return <div className="h-80 animate-pulse rounded-3xl bg-muted/50" />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-border bg-card p-5">
        <p className="text-sm text-destructive">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-ink px-3.5 py-2 text-sm font-semibold text-ink-foreground transition hover:opacity-90 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-black font-display tracking-tight text-foreground">
            Activity feed
          </h2>
          <p className="text-sm text-muted-foreground">What clients logged, newest first.</p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-bold tabular-nums text-muted-foreground">
          {events.length}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-border p-8 text-sm text-muted-foreground">
          Nothing logged in this window yet.
        </div>
      ) : (
        <div className="max-h-[26rem] space-y-5 overflow-x-hidden overflow-y-auto pr-1">
          {groups.map(([day, dayEvents]) => (
            <div key={day}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground shrink-0">
                  {formatDay(day)}
                </span>
                <span className="h-px flex-1 bg-border/60" />
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{dayEvents.length}</span>
              </div>
              <ul className="space-y-1">
                {dayEvents.map((event, i) => {
                  const meta = typeMeta(event.activityType);
                  const Icon = meta.icon;
                  return (
                    <li
                      key={`${event.occurredAt}-${i}`}
                      className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-muted/50"
                    >
                      <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", meta.chip)}>
                        <Icon className="size-4" strokeWidth={2.25} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">
                          <span className="font-semibold text-foreground">{event.clientName}</span>{" "}
                          <span className="hidden sm:inline text-muted-foreground">{typeLabel(event.activityType)}</span>
                        </p>
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {formatTime(event.occurredAt)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}