import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const RING_THICKNESS = 14;

export interface AdherenceRow {
  name: string;
  prescribed: number;
  actual: number;
}

export interface VolumeRow {
  name: string;
  volume: number;
}

export interface OutcomeRingEntry {
  outcome: string;
  label: string;
  count: number;
  color: string;
}

export interface DayStripRow {
  label: string;
  target: number;
  actual: number;
}

export function LogCardHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>
        <h3 className="mt-1 text-lg font-black font-display tracking-tight text-foreground">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatHero({
  value,
  unit,
  caption,
}: {
  value: string;
  unit?: string;
  caption: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <p className="text-5xl font-black tabular-nums font-display tracking-tight text-foreground">
          {value}
          {unit ? <span className="ml-1 text-sm text-muted-foreground">{unit}</span> : null}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{caption}</p>
      </div>
    </div>
  );
}

export function AdherenceRows({ data }: { data: AdherenceRow[] }) {
  return (
    <ul className="max-h-80 space-y-4 overflow-x-hidden overflow-y-auto overscroll-y-contain pr-1">
      {data.map((row) => {
        const pct = row.prescribed > 0 ? (row.actual / row.prescribed) * 100 : null;
        const onTarget = pct != null && pct >= 100;
        return (
          <li key={row.name} className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2.5">
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground" title={row.name}>
                {row.name}
              </span>
              <span className="text-lg font-black tabular-nums text-foreground">{row.actual}</span>
              <span className="text-xs text-muted-foreground">/ {row.prescribed}</span>
              {pct == null ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                  —
                </span>
              ) : (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
                    onTarget ? "bg-success/10 text-success" : "bg-warn/10 text-warn",
                  )}
                >
                  {Math.round(pct)}%
                </span>
              )}
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  onTarget ? "bg-success" : "bg-brand",
                )}
                style={{ width: `${pct == null ? 0 : Math.max(4, Math.min(100, pct))}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function VolumeRows({ data }: { data: VolumeRow[] }) {
  const maxVolume = Math.max(1, ...data.map((d) => d.volume));
  return (
    <ul className="max-h-80 space-y-4 overflow-x-hidden overflow-y-auto overscroll-y-contain pr-1">
      {data.map((row, index) => (
        <li key={row.name} className="flex flex-col gap-1.5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="w-5 shrink-0 text-right text-xs font-black tabular-nums text-muted-foreground">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground" title={row.name}>
              {row.name}
            </span>
            <span className="shrink-0 whitespace-nowrap text-base font-black tabular-nums text-foreground">
              {row.volume.toLocaleString()}
            </span>
          </div>
          <div className="ml-8 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${Math.max(4, (row.volume / maxVolume) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function OutcomeRing({
  data,
  centerLabel = "sets completed",
}: {
  data: OutcomeRingEntry[];
  centerLabel?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const completed = data.find((d) => d.outcome === "completed")?.count ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  let acc = 0;
  const stops: string[] = [];
  for (const d of data) {
    if (d.count <= 0) continue;
    if (d.count === total) {
      stops.push(`${d.color} 0deg 360deg`);
      continue;
    }
    const from = (acc / total) * 360;
    acc += d.count;
    stops.push(`${d.color} ${from}deg ${(acc / total) * 360}deg`);
  }
  const background = stops.length ? `conic-gradient(${stops.join(", ")})` : "var(--color-muted)";
  const maskStyle = `radial-gradient(farthest-side, transparent calc(100% - ${RING_THICKNESS}px), #000 ${RING_THICKNESS}px)`;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row flex-wrap sm:items-center sm:gap-8">
      <div className="relative size-40 shrink-0" role="img" aria-label={`${pct}% of ${centerLabel}`}>
        <div
          className="absolute inset-0 rounded-full"
          style={{ background, WebkitMask: maskStyle, mask: maskStyle }}
        />
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-4xl font-black tabular-nums font-display tracking-tight text-foreground">
              {total > 0 ? `${pct}%` : "—"}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {centerLabel}
            </p>
          </div>
        </div>
      </div>
      <ul className="w-full min-w-0 flex-1 space-y-2.5">
        {data.map((entry) => (
          <li key={entry.outcome} className="flex items-center justify-between gap-3 flex-wrap">
            <span className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-foreground">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: entry.color }} />
              {entry.label}
            </span>
            <span className="text-sm font-black tabular-nums text-foreground">{entry.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function compactNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1000) {
    const scaled = value / 1000;
    return `${scaled >= 10 ? Math.round(scaled) : scaled.toFixed(1)}k`;
  }
  return `${Math.round(value)}`;
}

export function DayStrip({ data }: { data: DayStripRow[] }) {
  return (
    <div className="max-h-80 overflow-y-auto overscroll-y-contain pr-1">
      <ul className="grid grid-cols-7 gap-1.5 sm:gap-2" role="img" aria-label="Target vs actual by day">
        {data.map((row, index) => {
          const met = row.target > 0 && row.actual >= row.target;
          const pct = row.target > 0 ? (row.actual / row.target) * 100 : 0;
          const height = row.target > 0 ? Math.max(4, Math.min(100, pct)) : 4;
          return (
            <li
              key={`${row.label}-${index}`}
              className="flex flex-col items-center gap-1.5 rounded-xl px-1 pb-2 pt-1.5 transition-colors hover:bg-muted/60"
              title={`${row.label}: ${compactNumber(row.actual)} of target ${compactNumber(row.target)}`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {row.label}
              </span>
              <div className="flex h-14 items-end">
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all duration-500",
                    row.target > 0 ? (met ? "bg-success" : "bg-brand") : "bg-muted",
                  )}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
                {compactNumber(row.actual)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}