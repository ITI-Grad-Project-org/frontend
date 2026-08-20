import type { BillingPlan, PendingCheckoutContext } from "@/types/billing";

export const pendingCheckoutStorageKey = "uply.billing.pending-checkout";

export function safeReturnPath(path?: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard/billing";
  }

  return path;
}

export function createBillingPath(returnTo: string, reason?: "client-limit" | "ai") {
  const params = new URLSearchParams({ returnTo: safeReturnPath(returnTo) });
  if (reason) params.set("reason", reason);
  return `/dashboard/billing?${params.toString()}`;
}

export function savePendingCheckout(context: PendingCheckoutContext) {
  try {
    window.sessionStorage.setItem(pendingCheckoutStorageKey, JSON.stringify(context));
  } catch {
    // Checkout can continue even when browser storage is unavailable. The result
    // page will then show its normal missing-attempt recovery state.
  }
}

export function readPendingCheckout(): PendingCheckoutContext | null {
  try {
    const stored = window.sessionStorage.getItem(pendingCheckoutStorageKey);
    if (!stored) return null;

    const value = JSON.parse(stored) as Partial<PendingCheckoutContext>;
    if (
      typeof value.paymentAttemptId !== "string" ||
      typeof value.tenantId !== "string" ||
      (value.requestedPlan !== "solo" && value.requestedPlan !== "studio") ||
      typeof value.createdAt !== "string"
    ) {
      return null;
    }

    return {
      paymentAttemptId: value.paymentAttemptId,
      tenantId: value.tenantId,
      requestedPlan: value.requestedPlan,
      createdAt: value.createdAt,
      returnTo: safeReturnPath(value.returnTo),
    };
  } catch {
    return null;
  }
}

export function clearPendingCheckout() {
  try {
    window.sessionStorage.removeItem(pendingCheckoutStorageKey);
  } catch {
    return;
  }
}

export function formatPlanPrice(plan: BillingPlan) {
  if (plan.priceCents === 0) return "Free";

  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: plan.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(plan.priceCents / 100);
}

export function formatBillingDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
