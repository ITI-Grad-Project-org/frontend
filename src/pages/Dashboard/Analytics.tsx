import { useCallback, useState } from "react";
import { BarChart3 } from "lucide-react";
import { addDays, formatDateLabel, getLocalDateInputValue } from "@/lib/dates";
import { WindowControl } from "@/components/analytics/WindowControl";
import { OverviewTab } from "@/components/analytics/OverviewTab";
import { RosterTab } from "@/components/analytics/RosterTab";
import { ProgramsTab } from "@/components/analytics/ProgramsTab";

type TabId = "overview" | "roster" | "programs";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "roster", label: "Clients" },
  { id: "programs", label: "Programs" },
];

export default function Analytics() {
  const today = getLocalDateInputValue();
  const [from, setFrom] = useState(addDays(today, -(30 - 1)));
  const [to, setTo] = useState(today);
  const [tab, setTab] = useState<TabId>("overview");

  const handleWindowChange = useCallback((nextFrom: string, nextTo: string) => {
    setFrom(nextFrom);
    setTo(nextTo);
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-400">
      {/* Header + window control */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand">
            <BarChart3 className="size-3.5" />
            {formatDateLabel(from)} → {formatDateLabel(to)}
          </p>
          <h1 className="mt-1 text-4xl font-black font-display tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            The state of your practice at a glance — and the first thing you should handle today.
          </p>
        </div>
        <WindowControl from={from} to={to} onChange={handleWindowChange} />
      </div>

      <div className="mb-8 flex w-fit items-center gap-2 overflow-x-auto rounded-2xl border border-border/80 bg-muted/30 p-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              tab === t.id
                ? "rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-ink-foreground shadow-sm transition-all"
                : "cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted/65 hover:text-foreground"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === "overview" ? (
          <OverviewTab from={from} to={to} />
        ) : tab === "roster" ? (
          <RosterTab from={from} to={to} />
        ) : (
          <ProgramsTab />
        )}
      </div>
    </div>
  );
}