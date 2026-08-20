import { AlertTriangle, LockKeyhole, RefreshCw, UsersRound } from "lucide-react";
import { BillingPlanCard } from "@/components/billing/BillingPlanCard";
import { useBillingData, useStartCheckout } from "@/hooks/billing/useBilling";
import { getApiErrorMessage } from "@/lib/api";

export function BillingUpgradePanel({
  reason,
  returnTo,
}: {
  reason: "client-limit" | "ai";
  returnTo: string;
}) {
  const { plans, billing, isLoading, plansError, billingError, refetch } = useBillingData();
  const checkout = useStartCheckout();
  const paidPlans = plans.filter((plan) => plan.plan !== "free");

  const title = reason === "client-limit" ? "You have reached your active-client limit" : "Unlock new AI plan generation";
  const description =
    reason === "client-limit"
      ? "Only active clients count toward this limit. Your current clients stay available, and a paid plan lets you add more."
      : "Your existing AI suggestions stay available. Choose Solo or Studio to generate new training and nutrition plans.";

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Loading available plans...
      </div>
    );
  }

  if (!billing || plansError || billingError) {
    return (
      <div className="rounded-3xl border border-danger/25 bg-danger/5 p-6">
        <div className="flex items-start gap-3 text-danger">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Plans could not be loaded</p>
            <p className="mt-1 text-sm">
              {getApiErrorMessage(plansError ?? billingError, "Please try again in a moment.")}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-danger/25 px-4 py-2.5 text-sm font-semibold text-danger"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-brand/25 bg-brand/5 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex max-w-2xl items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/12 text-brand">
            {reason === "client-limit" ? <UsersRound className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
          </span>
          <div>
            <h2 className="text-lg font-black text-foreground">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>

        {reason === "client-limit" ? (
          <span className="w-fit rounded-full bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-sm">
            {billing.activeClientLimit === null
              ? `${billing.activeClientCount} active clients`
              : `${billing.activeClientCount} / ${billing.activeClientLimit} active clients`}
          </span>
        ) : null}
      </div>

      {checkout.error ? (
        <p role="alert" className="mt-4 rounded-2xl bg-danger/10 p-3 text-sm text-danger">
          {getApiErrorMessage(checkout.error, "Secure checkout could not be opened. Please try again.")}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {paidPlans.map((plan) => (
          <BillingPlanCard
            key={plan.plan}
            plan={plan}
            billing={billing}
            compact
            selectedPlan={checkout.isStartingCheckout ? checkout.selectedPlan : null}
            onSelect={(selectedPlan) => {
              checkout.reset();
              void checkout.startCheckout({ plan: selectedPlan, returnTo });
            }}
          />
        ))}
      </div>
    </section>
  );
}
