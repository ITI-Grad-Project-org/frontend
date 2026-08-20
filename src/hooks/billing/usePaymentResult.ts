import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage, getApiStatus } from "@/lib/api";
import { clearPendingCheckout, readPendingCheckout } from "@/lib/billing";
import { queryClient } from "@/lib/query-client";
import { getMyBilling, getPaymentAttempt } from "@/services/billing";
import { useActiveTenantId, billingKeys } from "@/hooks/billing/useBilling";
import type {
  BillingSummary,
  PaymentAttempt,
  PendingCheckoutContext,
} from "@/types/billing";

const pollIntervalMs = 1_500;
const maximumAutomaticPolls = 30;

export type PaymentResultState =
  | { type: "loading" }
  | { type: "pending"; attempt: PaymentAttempt }
  | { type: "delayed"; attempt: PaymentAttempt }
  | { type: "succeeded"; attempt: PaymentAttempt; billing: BillingSummary | null }
  | { type: "failed"; attempt: PaymentAttempt }
  | { type: "missing_attempt" }
  | { type: "tenant_mismatch" }
  | { type: "request_error"; message: string };

export function usePaymentResult() {
  const activeTenantId = useActiveTenantId();
  const [checkoutContext] = useState<PendingCheckoutContext | null>(readPendingCheckout);
  const [state, setState] = useState<PaymentResultState>(() =>
    checkoutContext ? { type: "loading" } : { type: "missing_attempt" },
  );
  const [checkNumber, setCheckNumber] = useState(0);
  const hasTenantMismatch = Boolean(
    checkoutContext &&
      activeTenantId &&
      checkoutContext.tenantId !== "active-tenant" &&
      checkoutContext.tenantId !== activeTenantId,
  );

  useEffect(() => {
    const context = checkoutContext;
    if (!context) return;

    if (hasTenantMismatch) return;

    let isCancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pollCount = 0;

    const poll = async () => {
      pollCount += 1;

      try {
        const attempt = await getPaymentAttempt(context.paymentAttemptId);
        if (isCancelled) return;

        queryClient.setQueryData(
          billingKeys.payment(activeTenantId ?? context.tenantId, context.paymentAttemptId),
          attempt,
        );

        if (attempt.status === "succeeded") {
          clearPendingCheckout();
          let billing: BillingSummary | null = null;

          try {
            billing = await getMyBilling();
            if (isCancelled) return;
            queryClient.setQueryData(
              billingKeys.summary(activeTenantId ?? context.tenantId),
              billing,
            );
          } catch {
            // The payment is still confirmed even if the refreshed summary is
            // temporarily unavailable. The billing screen will load it again.
          }

          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["clients"] }),
            queryClient.invalidateQueries({ queryKey: ["billing", "me"] }),
          ]);
          if (!isCancelled) setState({ type: "succeeded", attempt, billing });
          return;
        }

        if (attempt.status === "failed") {
          clearPendingCheckout();
          setState({ type: "failed", attempt });
          return;
        }

        if (pollCount >= maximumAutomaticPolls) {
          setState({ type: "delayed", attempt });
          return;
        }

        setState({ type: "pending", attempt });
        timer = setTimeout(() => void poll(), pollIntervalMs);
      } catch (error) {
        if (isCancelled) return;

        if (getApiStatus(error) === 404 && activeTenantId === context.tenantId) {
          clearPendingCheckout();
        }

        setState({
          type: "request_error",
          message: getApiErrorMessage(
            error,
            "We could not check this payment yet. Your current plan has not been changed locally.",
          ),
        });
      }
    };

    void poll();

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [activeTenantId, checkNumber, checkoutContext, hasTenantMismatch]);

  const checkAgain = useCallback(() => {
    setState({ type: "loading" });
    setCheckNumber((current) => current + 1);
  }, []);

  const effectiveState: PaymentResultState = hasTenantMismatch
    ? { type: "tenant_mismatch" }
    : state;

  return {
    state: effectiveState,
    checkoutContext,
    checkAgain,
  };
}
