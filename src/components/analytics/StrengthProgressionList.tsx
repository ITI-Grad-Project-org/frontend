import { useMemo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { StrengthExercise } from "@/types/analytics";

interface StrengthRow {
  name: string;
  latest: number;
  gain: number;
}

interface StrengthProgressionListProps {
  exercises: StrengthExercise[];
}

export function StrengthProgressionList({ exercises }: StrengthProgressionListProps) {
  const rows = useMemo<StrengthRow[]>(
    () =>
      [...exercises]
        .map((exercise) => ({
          name: exercise.exerciseName,
          latest: exercise.latestE1rmKg,
          gain: +(exercise.latestE1rmKg - exercise.firstE1rmKg).toFixed(2),
        }))
        .sort((a, b) => b.gain - a.gain || b.latest - a.latest),
    [exercises],
  );

  if (rows.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
        No strength data in this window
      </div>
    );
  }

  const maxStrength = Math.max(...rows.map((row) => row.latest), 1);

  return (
    <ul className="flex max-h-80 flex-col gap-1.5 overflow-y-auto pr-1">
      {rows.map((row) => {
        const positive = row.gain > 0.05;
        const negative = row.gain < -0.05;
        return (
          <li
            key={row.name}
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/25 px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-xs font-semibold text-foreground">{row.name}</span>
                <span className="flex shrink-0 items-center gap-1 text-xs font-bold tabular-nums text-foreground">
                  {row.latest}
                  {positive ? (
                    <span className="flex items-center gap-0.5 text-success">
                      <TrendingUp className="size-3" />
                      +{row.gain}
                    </span>
                  ) : negative ? (
                    <span className="flex items-center gap-0.5 text-danger">
                      <TrendingDown className="size-3" />
                      {row.gain}
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-violet transition-all duration-500"
                  style={{ width: `${(row.latest / maxStrength) * 100}%` }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}