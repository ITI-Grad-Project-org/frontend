import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { Link } from "react-router";
import { usePaymentResult } from "@/hooks/billing/usePaymentResult";
import { useDocumentTitle } from "@/hooks/shared/useDocumentTitle";
import { createBillingPath, formatBillingDate, safeReturnPath } from "@/lib/billing";
import { useTheme } from "@/theme";

export default function BillingResult() {
  useDocumentTitle("Uply | Payment result");
  const { isDark } = useTheme();
  const { state, checkoutContext, checkAgain } = usePaymentResult();
  const returnTo = safeReturnPath(checkoutContext?.returnTo);
  const billingPath = createBillingPath(returnTo);

  const content = (() => {
    if (state.type === "loading" || state.type === "pending") {
      return {
        icon: <Loader2 className="h-9 w-9 animate-spin text-brand" />,
        title: "Confirming your payment",
        description: "Do not close this page. We are waiting for secure confirmation from the payment service.",
      };
    }

    if (state.type === "succeeded") {
      const expiry = state.billing?.subscriptionExpiresAt;
      return {
        icon: <CheckCircle2 className="h-10 w-10 text-success" />,
        title: "Payment confirmed",
        description: expiry
          ? `Your ${state.attempt.plan} plan is active until ${formatBillingDate(expiry)}.`
          : `Your ${state.attempt.plan} payment was confirmed. Your billing details will refresh automatically.`,
      };
    }

    if (state.type === "failed") {
      return {
        icon: <XCircle className="h-10 w-10 text-danger" />,
        title: "Payment was not completed",
        description: "Your current plan has not changed. You can return to Billing and try again.",
      };
    }

    if (state.type === "delayed") {
      return {
        icon: <Clock3 className="h-10 w-10 text-warn" />,
        title: "Payment is still being confirmed",
        description: "This is not a payment failure. Check again now or return to Billing and check later.",
      };
    }

    if (state.type === "tenant_mismatch") {
      return {
        icon: <ShieldAlert className="h-10 w-10 text-warn" />,
        title: "Switch back to the checkout workspace",
        description: "This payment belongs to the workspace that started checkout. Switch to that workspace before checking it again.",
      };
    }

    if (state.type === "request_error") {
      return {
        icon: <AlertTriangle className="h-10 w-10 text-danger" />,
        title: "Payment status could not be checked",
        description: state.message,
      };
    }

    return {
      icon: <ShieldAlert className="h-10 w-10 text-muted-foreground" />,
      title: "No pending payment was found",
      description: "Return to Billing to view your current plan or start a new secure checkout.",
    };
  })();

  const canCheckAgain = state.type === "delayed" || state.type === "request_error" || state.type === "tenant_mismatch";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-xl">
        <Link to="/" className="mx-auto mb-8 flex w-fit items-center justify-center">
          <img
            src={isDark ? "/uply-logo-extra-bold-dark-transparent.webp" : "/uply-logo-extra-bold-transparent.webp"}
            alt="Uply"
            className="h-12 w-auto"
          />
        </Link>

        <section className="rounded-3xl border border-border bg-card p-7 text-center shadow-(--shadow-card) sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/60">
            {content.icon}
          </div>
          <h1 className="mt-6 text-3xl font-black text-foreground">{content.title}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">{content.description}</p>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <Link
              to={billingPath}
              className="inline-flex items-center justify-center rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Return to Billing
            </Link>

            {canCheckAgain ? (
              <button
                type="button"
                onClick={checkAgain}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:opacity-90"
              >
                <RefreshCw className="h-4 w-4" />
                Check again
              </button>
            ) : null}

            {state.type === "succeeded" ? (
              <Link
                to={returnTo}
                className="inline-flex items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-bold text-brand-foreground transition hover:opacity-90"
              >
                Continue
              </Link>
            ) : null}
          </div>
        </section>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          This page confirms payment through Uply's backend. Browser redirect details are never used as proof of payment.
        </p>
      </div>
    </main>
  );
}
