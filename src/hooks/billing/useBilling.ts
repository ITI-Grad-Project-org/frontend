import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { safeReturnPath, savePendingCheckout } from "@/lib/billing";
import {
  createBillingCheckout,
  getBillingPlans,
  getMyBilling,
} from "@/services/billing";
import { useAuthStore } from "@/stores/auth-store";
import type { SubscriptionPlan } from "@/types/billing";

export const billingKeys = {
  plans: ["billing", "plans"] as const,
  summary: (tenantId: string) => ["billing", "me", tenantId] as const,
  payment: (tenantId: string, attemptId: string) =>
    ["billing", "payment", tenantId, attemptId] as const,
};

export function useActiveTenantId() {
  return useAuthStore((state) => state.user?.tenants?.[0]?.id ?? null);
}

export function useBillingData() {
  const activeTenantId = useActiveTenantId();
  const tenantCacheId = activeTenantId ?? "active-tenant";

  const plansQuery = useQuery({
    queryKey: billingKeys.plans,
    queryFn: getBillingPlans,
    staleTime: 5 * 60_000,
  });

  const summaryQuery = useQuery({
    queryKey: billingKeys.summary(tenantCacheId),
    queryFn: getMyBilling,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });

  return {
    activeTenantId,
    tenantCacheId,
    plans: plansQuery.data ?? [],
    billing: summaryQuery.data ?? null,
    isLoading: plansQuery.isPending || summaryQuery.isPending,
    plansError: plansQuery.error,
    billingError: summaryQuery.error,
    refetch: async () => {
      await Promise.all([plansQuery.refetch(), summaryQuery.refetch()]);
    },
  };
}

export function useBillingSummary() {
  const activeTenantId = useActiveTenantId();
  const tenantCacheId = activeTenantId ?? "active-tenant";
  const query = useQuery({
    queryKey: billingKeys.summary(tenantCacheId),
    queryFn: getMyBilling,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });

  return {
    activeTenantId,
    tenantCacheId,
    billing: query.data ?? null,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useStartCheckout() {
  const activeTenantId = useActiveTenantId();

  const checkout = useMutation({
    mutationFn: async ({
      plan,
      returnTo,
    }: {
      plan: Exclude<SubscriptionPlan, "free">;
      returnTo: string;
    }) => {
      const response = await createBillingCheckout(plan);
      return { response, plan, returnTo };
    },
    onSuccess: ({ response, plan, returnTo }) => {
      savePendingCheckout({
        paymentAttemptId: response.paymentAttemptId,
        tenantId: activeTenantId ?? "active-tenant",
        requestedPlan: plan,
        createdAt: new Date().toISOString(),
        returnTo: safeReturnPath(returnTo),
      });

      window.location.assign(response.checkoutUrl);
    },
  });

  return {
    startCheckout: checkout.mutateAsync,
    selectedPlan: checkout.variables?.plan ?? null,
    isStartingCheckout: checkout.isPending,
    error: checkout.error,
    reset: checkout.reset,
  };
}

export function invalidateBillingSummary() {
  return queryClient.invalidateQueries({ queryKey: ["billing", "me"] });
}
