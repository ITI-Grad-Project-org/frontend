import { useState } from "react";
import { Layers3, Loader2, UsersRound } from "lucide-react";
import type { TemplateEffectiveness } from "@/types/analytics";
import { useTemplateSurvival } from "@/hooks/analytics/useTemplateSurvival";
import { TemplateSurvivalChart } from "@/components/analytics/TemplateSurvivalChart";
import { cn } from "@/lib/utils";

interface ProgramEffectivenessProps {
  templates: TemplateEffectiveness[];
  loading: boolean;
  error: string;
  onRetry: () => void;
}

export function ProgramEffectiveness({
  templates,
  loading,
  error,
  onRetry,
}: ProgramEffectivenessProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = templates.find((t) => t.templateId === selectedId) ?? templates[0] ?? null;
  const survival = useTemplateSurvival(selected?.templateId ?? null);

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="text-xl font-black font-display tracking-tight text-foreground">
          Program effectiveness
        </h2>
        <p className="text-sm text-muted-foreground">
          Whole-history track record, not date-windowed. The gap between last active week and plan
          length is where a template loses people.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Template list */}
        <div>
          {loading ? (
            <div className="flex h-56 items-center justify-center rounded-2xl border border-border bg-card">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <p className="text-sm text-destructive">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-ink-foreground transition hover:opacity-90 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-6 text-center">
              <Layers3 className="size-6 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                No program templates assigned yet. Assignments build this track record.
              </p>
            </div>
          ) : (
            <ul className="flex max-h-[24rem] flex-col gap-2 overflow-y-auto pr-1">
              {templates.map((template) => {
                const gap = template.durationWeeks - template.avgLastActiveWeek;
                const retained = gap <= 1;
                const active = selected?.templateId === template.templateId;
                const pctOfLength = Math.max(
                  0,
                  Math.min(100, (template.avgLastActiveWeek / Math.max(1, template.durationWeeks)) * 100),
                );
                return (
                  <li key={template.templateId}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(template.templateId)}
                      className={cn(
                        "flex w-full flex-col gap-2 rounded-2xl border px-3.5 py-3 text-left transition hover:translate-y-[-1px] cursor-pointer",
                        active
                          ? "border-brand/50 bg-brand/5 shadow-(--shadow-card)"
                          : "border-border/60 bg-card hover:border-brand/30",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-foreground">
                          {template.templateName}
                        </span>
                        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                          <UsersRound className="size-3.5" />
                          {template.assignments}
                        </span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-info transition-all duration-500"
                          style={{ width: `${pctOfLength}%` }}
                        />
                        <div
                          className="absolute top-[-2px] bottom-[-2px] w-0.5 rounded-full bg-foreground/80"
                          style={{ left: `calc(${pctOfLength}% - 1px)` }}
                          title={`Last active: week ${template.avgLastActiveWeek}`}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-muted-foreground">
                          active through <span className="font-bold tabular-nums text-foreground">W{template.avgLastActiveWeek}</span>{" "}
                          of <span className="tabular-nums">{template.durationWeeks}</span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 font-bold",
                            retained ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
                          )}
                        >
                          {retained
                            ? "keeps everyone"
                            : `loses people ~${gap}wk early`}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Survival drill-down */}
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <p className="text-sm font-bold text-foreground">
              {selected?.templateName ?? "Survival curve"}
            </p>
            {selected && (
              <span className="text-xs tabular-nums text-muted-foreground">
                {Math.round(selected.avgCompletionPct)}% avg completion
              </span>
            )}
          </div>
          <TemplateSurvivalChart
            survival={survival.survival}
            loading={survival.loading}
            error={survival.error}
            onRetry={survival.refetch}
          />
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            A programme reaches week N if its last completed session was in week N or later, so the
            curve never rises — the week it drops is the week the template lost people.
          </p>
        </div>
      </div>
    </div>
  );
}