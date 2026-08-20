import { Check, Loader2, Sparkles, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPlanPrice } from "@/lib/billing";
import type { BillingPlan, BillingSummary } from "@/types/billing";

function getActionLabel(plan: BillingPlan, billing: BillingSummary) {
  if (plan.plan === "free") return billing.plan === "free" ? "Current plan" : "Included plan";
  if (billing.plan === "studio" && plan.plan === "solo") return "Unavailable on Studio";
  if (billing.plan === plan.plan) return `Renew ${plan.displayName} for 30 days`;
  if (billing.plan === "solo" && plan.plan === "studio") return "Upgrade to Studio";
  return `Upgrade to ${plan.displayName}`;
}

export function BillingPlanCard({
  plan,
  billing,
  selectedPlan,
  compact = false,
  onSelect,
}: {
  plan: BillingPlan;
  billing: BillingSummary;
  selectedPlan: "solo" | "studio" | null;
  compact?: boolean;
  onSelect: (plan: "solo" | "studio") => void;
}) {
  const isCurrent = billing.plan === plan.plan;
  const isStudioToSolo = billing.plan === "studio" && plan.plan === "solo";
  const isFree = plan.plan === "free";
  const isStarting = selectedPlan === plan.plan;
  const isDisabled = isFree || isStudioToSolo || selectedPlan !== null;

  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-3xl border bg-card shadow-(--shadow-card)",
        compact ? "p-5" : "p-6",
        isCurrent ? "border-brand ring-1 ring-brand/20" : "border-border",
      )}
    >
      {isCurrent ? (
        <span className="absolute right-4 top-4 rounded-full bg-brand/12 px-2.5 py-1 text-[11px] font-bold text-brand">
          Current access
        </span>
      ) : null}

      <div className="pr-20">
        <h3 className="text-xl font-black text-foreground">{plan.displayName}</h3>
        <div className="mt-2 flex items-end gap-1.5">
          <span className="text-3xl font-black tracking-tight text-foreground">
            {formatPlanPrice(plan)}
          </span>
          {plan.durationDays ? (
            <span className="pb-1 text-xs text-muted-foreground">/ {plan.durationDays} days</span>
          ) : null}
        </div>
      </div>

      <div className={cn("space-y-3 text-sm", compact ? "mt-5" : "mt-7")}>
        <p className="flex items-center gap-2 text-foreground">
          <UsersRound className="h-4 w-4 text-brand" />
          {plan.activeClientLimit === null
            ? "Unlimited active clients"
            : `Up to ${plan.activeClientLimit} active clients`}
        </p>
        <p className="flex items-center gap-2 text-foreground">
          <Sparkles className="h-4 w-4 text-violet" />
          {plan.aiPlanBuilderEnabled ? "AI plan builder included" : "AI plan builder not included"}
        </p>
        <p className="flex items-center gap-2 text-foreground">
          <Check className="h-4 w-4 text-success" />
          {plan.durationDays ? "Manual renewal, no automatic charge" : "No expiry"}
        </p>
      </div>

      <button
        type="button"
        disabled={isDisabled}
        onClick={() => {
          if (plan.plan !== "free") onSelect(plan.plan);
        }}
        className={cn(
          "mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
          compact ? "mt-5" : "mt-7",
          isCurrent && !isFree
            ? "border border-brand text-brand hover:bg-brand/5"
            : "bg-ink text-ink-foreground hover:opacity-90",
        )}
      >
        {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isStarting ? "Opening secure checkout..." : getActionLabel(plan, billing)}
      </button>
    </article>
  );
}
