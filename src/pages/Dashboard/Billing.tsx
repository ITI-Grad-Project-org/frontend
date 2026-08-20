import {
  AlertTriangle,
  CalendarClock,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useSearchParams } from "react-router";
import { BillingPlanCard } from "@/components/billing/BillingPlanCard";
import { useBillingData, useStartCheckout } from "@/hooks/billing/useBilling";
import { useDocumentTitle } from "@/hooks/shared/useDocumentTitle";
import { getApiErrorMessage } from "@/lib/api";
import { formatBillingDate, safeReturnPath } from "@/lib/billing";

function BillingLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-3xl bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-28 rounded-3xl bg-muted" />
        <div className="h-28 rounded-3xl bg-muted" />
        <div className="h-28 rounded-3xl bg-muted" />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-80 rounded-3xl bg-muted" />
        <div className="h-80 rounded-3xl bg-muted" />
        <div className="h-80 rounded-3xl bg-muted" />
      </div>
    </div>
  );
}

export default function Billing() {
  useDocumentTitle("Uply | Billing");
  const [searchParams] = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get("returnTo"));
  const reason = searchParams.get("reason");
  const { plans, billing, isLoading, plansError, billingError, refetch } = useBillingData();
  const checkout = useStartCheckout();

  const loadError = plansError ?? billingError;
  const isExpiredPaidPlan =
    billing?.plan === "free" &&
    billing.storedPlan !== "free" &&
    billing.subscriptionExpiresAt !== null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Subscription</p>
          <h1 className="mt-2 text-4xl font-black text-foreground">Billing and plans</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage your active-client capacity and AI plan access. Paid plans add 30 days per payment and do not renew automatically.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" />
          Secure checkout by Paymob
        </span>
      </div>

      {isLoading ? <BillingLoading /> : null}

      {!isLoading && loadError ? (
        <div className="rounded-3xl border border-danger/25 bg-danger/5 p-6">
          <div className="flex items-start gap-3 text-danger">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h2 className="font-bold">Billing details could not be loaded</h2>
              <p className="mt-1 text-sm">
                {getApiErrorMessage(loadError, "Please check your connection and try again.")}
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
      ) : null}

      {!isLoading && billing && plans.length > 0 ? (
        <>
          {reason === "client-limit" ? (
            <div className="rounded-3xl border border-warn/25 bg-warn/8 p-5 text-sm text-foreground">
              <p className="font-bold">Your current plan is at its active-client limit.</p>
              <p className="mt-1 text-muted-foreground">Choose a larger plan below, then return to Clients after payment is confirmed.</p>
            </div>
          ) : null}

          {reason === "ai" ? (
            <div className="rounded-3xl border border-violet/25 bg-violet/8 p-5 text-sm text-foreground">
              <p className="font-bold">New AI generation needs Solo or Studio.</p>
              <p className="mt-1 text-muted-foreground">Your existing suggestions remain available while you choose a plan.</p>
            </div>
          ) : null}

          {isExpiredPaidPlan ? (
            <div className="rounded-3xl border border-warn/25 bg-warn/8 p-5 text-sm text-foreground">
              <p className="font-bold">Your {billing.storedPlan} access expired on {formatBillingDate(billing.subscriptionExpiresAt!)}.</p>
              <p className="mt-1 text-muted-foreground">Your account now uses Free access. Existing clients and AI suggestions have not been removed.</p>
            </div>
          ) : null}

          <section className="rounded-3xl border border-border bg-ink p-6 text-ink-foreground shadow-(--shadow-card) sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Current access</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-black capitalize">{billing.plan}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${billing.isPaidSubscriptionActive ? "bg-success/15 text-success" : "bg-white/8 text-ink-foreground"}`}>
                    {billing.isPaidSubscriptionActive ? "Active" : "Free access"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-foreground/65">
                  {billing.subscriptionExpiresAt && billing.isPaidSubscriptionActive
                    ? `Access through ${formatBillingDate(billing.subscriptionExpiresAt)}`
                    : "No paid expiry date"}
                </p>
              </div>
              <CreditCard className="hidden h-20 w-20 text-brand/35 lg:block" />
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-(--shadow-card)">
              <UsersRound className="h-5 w-5 text-brand" />
              <p className="mt-4 text-2xl font-black text-foreground">
                {billing.activeClientLimit === null
                  ? billing.activeClientCount
                  : `${billing.activeClientCount} / ${billing.activeClientLimit}`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {billing.activeClientLimit === null ? "Active clients, unlimited capacity" : "Active-client usage"}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-(--shadow-card)">
              <Sparkles className="h-5 w-5 text-violet" />
              <p className="mt-4 text-2xl font-black text-foreground">
                {billing.aiPlanBuilderEnabled ? "Available" : "Locked"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">New AI plan generation</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-(--shadow-card)">
              <CalendarClock className="h-5 w-5 text-info" />
              <p className="mt-4 text-2xl font-black text-foreground">30 days</p>
              <p className="mt-1 text-sm text-muted-foreground">Added by every successful paid checkout</p>
            </div>
          </div>

          {checkout.error ? (
            <p role="alert" className="rounded-2xl bg-danger/10 p-4 text-sm text-danger">
              {getApiErrorMessage(checkout.error, "Secure checkout could not be opened. Please try again.")}
            </p>
          ) : null}

          <section>
            <div>
              <h2 className="text-2xl font-black text-foreground">Choose your access</h2>
              <p className="mt-1 text-sm text-muted-foreground">Prices and limits are loaded from the billing service.</p>
            </div>
            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              {plans.map((plan) => (
                <BillingPlanCard
                  key={plan.plan}
                  plan={plan}
                  billing={billing}
                  selectedPlan={checkout.isStartingCheckout ? checkout.selectedPlan : null}
                  onSelect={(selectedPlan) => {
                    checkout.reset();
                    void checkout.startCheckout({ plan: selectedPlan, returnTo });
                  }}
                />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
