import CardMain from "@/components/cards/CardMain";
import { StrengthProgressionList } from "@/components/analytics/StrengthProgressionList";
import { useClientProgress } from "@/hooks/analytics/useClientProgress";
import { addDays, getLocalDateInputValue } from "@/lib/dates";

interface ClientStrengthOutcomesProps {
  membershipId: string;
}

export function ClientStrengthOutcomes({ membershipId }: ClientStrengthOutcomesProps) {
  const today = getLocalDateInputValue();
  const from = addDays(today, -(30 - 1));
  const progress = useClientProgress(membershipId, from, today);

  return (
    <CardMain className="gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Strength outcomes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Best estimated one-rep max per exercise over the last 30 days.
        </p>
      </div>

      {progress.loading ? (
        <div className="h-56 animate-pulse rounded-2xl bg-muted/40" />
      ) : progress.error ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
          <p className="text-sm text-destructive">{progress.error}</p>
          <button
            type="button"
            onClick={progress.refetch}
            className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-ink-foreground transition hover:opacity-90 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <StrengthProgressionList exercises={progress.progress?.strength ?? []} />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Estimated 1-rep max from logged sets, capped at 12 reps — above that the Epley formula
            inflates enough to invent personal bests.
          </p>
        </>
      )}
    </CardMain>
  );
}