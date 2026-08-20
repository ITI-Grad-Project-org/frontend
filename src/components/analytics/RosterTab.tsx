import { useRosterReport } from "@/hooks/analytics/useRosterReport";
import { useAdherence } from "@/hooks/analytics/useAdherence";

import { RosterLeaderboard } from "@/components/analytics/RosterLeaderboard";
import { AdherencePanel } from "@/components/analytics/AdherencePanel";
import { ClientOutcomesPanel } from "@/components/analytics/ClientOutcomesPanel";

interface RosterTabProps {
  from: string;
  to: string;
}

export function RosterTab({ from, to }: RosterTabProps) {
  const roster = useRosterReport(from, to);
  const adherence = useAdherence(from, to);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-surface p-6 lg:col-span-2">
          <RosterLeaderboard
            report={roster.report}
            loading={roster.loading}
            error={roster.error}
            onRetry={roster.refetch}
          />
        </div>
        <div className="card-surface p-6">
          <AdherencePanel
            summary={adherence.summary}
            loading={adherence.loading}
            error={adherence.error}
            onRetry={adherence.refetch}
          />
        </div>
      </div>

      <ClientOutcomesPanel from={from} to={to} />
    </div>
  );
}