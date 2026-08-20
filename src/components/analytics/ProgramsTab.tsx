import { useProgramEffectiveness } from "@/hooks/analytics/useProgramEffectiveness";
import { ProgramEffectiveness } from "@/components/analytics/ProgramEffectiveness";

export function ProgramsTab() {
  const effectiveness = useProgramEffectiveness();

  return (
    <div className="card-surface p-6">
      <ProgramEffectiveness
        templates={effectiveness.templates}
        loading={effectiveness.loading}
        error={effectiveness.error}
        onRetry={effectiveness.refetch}
      />
    </div>
  );
}