import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { adherenceColor } from "@/components/analytics/colors";

function pointOnArc(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.sin(rad),
    y: cy - r * Math.cos(rad),
  };
}

interface AdherenceDialProps {
  pct: number | null;
  completed: number;
  scheduled: number;
  className?: string;
}

export function AdherenceDial({
  pct,
  completed,
  scheduled,
  className,
}: AdherenceDialProps) {
  const cx = 100;
  const cy = 100;
  const r = 80;
  const startAngle = 225;
  const sweep = 270;

  const track = useMemo(() => {
    const start = pointOnArc(cx, cy, r, startAngle);
    const end = pointOnArc(cx, cy, r, startAngle - sweep);
    return `M ${start.x} ${start.y} A ${r} ${r} 0 1 0 ${end.x} ${end.y}`;
  }, []);

  const progress = useMemo(() => {
    if (pct == null || pct <= 0) return null;
    const clamped = Math.min(pct, 100);
    const endAngle = startAngle - sweep * (clamped / 100);
    const start = pointOnArc(cx, cy, r, startAngle);
    const end = pointOnArc(cx, cy, r, endAngle);
    const largeArc = sweep * (clamped / 100) > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }, [pct]);

  const color = adherenceColor(pct);
  const hasSchedule = scheduled > 0;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative w-[min(100%,260px)]">
        <svg viewBox="0 0 200 200" className="w-full" role="img" aria-label="Session completion">
          <path d={track} fill="none" stroke="var(--color-border)" strokeWidth={14} strokeLinecap="round" />
          {progress && (
            <path
              d={progress}
              fill="none"
              stroke={color}
              strokeWidth={14}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 600ms ease, stroke 300ms ease" }}
            />
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {hasSchedule && pct != null ? (
            <>
              <span
                className="text-6xl font-black tabular-nums font-display tracking-tight"
                style={{ color }}
              >
                {Math.round(pct)}
                <span className="text-3xl font-bold text-muted-foreground">%</span>
              </span>
              <span className="mt-1 text-xs font-semibold text-muted-foreground">
                {completed} of {scheduled} scheduled sessions
              </span>
            </>
          ) : (
            <>
              <span className="text-5xl font-black font-display text-muted-foreground">—</span>
              <span className="mt-1 text-xs font-semibold text-muted-foreground">
                Nothing scheduled yet
              </span>
            </>
          )}
        </div>
      </div>
      <p className="mt-2 max-w-[220px] text-center text-xs leading-relaxed text-muted-foreground">
        Completion counts logged sessions against what each programme scheduled — not sessions
        merely started.
      </p>
    </div>
  );
}