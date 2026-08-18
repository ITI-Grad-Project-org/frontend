import { CalendarRange } from "lucide-react";
import { addDays, getLocalDateInputValue } from "@/lib/dates";
import { cn } from "@/lib/utils";

const PRESETS = [
  { days: 7, label: "7d" },
  { days: 14, label: "14d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
];

interface WindowControlProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

export function WindowControl({ from, to, onChange }: WindowControlProps) {
  const today = getLocalDateInputValue();
  const activePreset = PRESETS.find(
    (preset) => from === addDays(today, -(preset.days - 1)) && to === today,
  );
  const isCustom = activePreset == null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => {
        const active = activePreset?.days === preset.days;
        return (
          <button
            key={preset.days}
            type="button"
            onClick={() => onChange(addDays(today, -(preset.days - 1)), today)}
            className={cn(
              "rounded-xl px-3.5 py-2 text-xs font-bold tabular-nums transition cursor-pointer",
              active
                ? "bg-ink text-ink-foreground shadow-sm"
                : "border border-border/70 bg-card text-muted-foreground hover:text-foreground hover:border-brand/40",
            )}
          >
            {preset.label}
          </button>
        );
      })}
      <div
        className={cn(
          "flex items-center gap-1 rounded-xl transition",
          isCustom
            ? "border border-ink bg-ink p-1"
            : "border border-border/70 bg-card p-1",
        )}
      >
        <CalendarRange
          className={cn("ml-2 size-3.5", isCustom ? "text-white" : "text-muted-foreground")}
        />
        <input
          key={`from-${from}-${to}`}
          type="date"
          defaultValue={from}
          max={to}
          onChange={(e) => {
            const value = e.target.value;
            if (!value) return;
            onChange(value > to ? to : value, to);
          }}
          aria-label="From"
          className={cn(
            "rounded-lg bg-transparent px-1.5 py-1 text-xs font-semibold tabular-nums outline-none",
            isCustom ? "text-white" : "text-foreground",
          )}
        />
        <span className={cn("text-white/70", !isCustom && "text-muted-foreground")}>→</span>
        <input
          key={`to-${from}-${to}`}
          type="date"
          defaultValue={to}
          min={from}
          max={today}
          onChange={(e) => {
            const value = e.target.value;
            if (!value) return;
            onChange(from, value < from ? from : value);
          }}
          aria-label="To"
          className={cn(
            "rounded-lg bg-transparent px-1.5 py-1 text-xs font-semibold tabular-nums outline-none",
            isCustom ? "text-white" : "text-foreground",
          )}
        />
      </div>
    </div>
  );
}