import { api } from "@/lib/api";
import type {
  BillingPlan,
  BillingSummary,
  CreateCheckoutRequest,
  CreateCheckoutResponse,
  PaymentAttempt,
} from "@/types/billing";

export async function getBillingPlans(): Promise<BillingPlan[]> {
  const { data } = await api.get<BillingPlan[]>("/billing/plans");
  return data;
}

export async function getMyBilling(): Promise<BillingSummary> {
  const { data } = await api.get<BillingSummary>("/billing/me");
  return data;
}

export async function createBillingCheckout(
  plan: CreateCheckoutRequest["plan"],
): Promise<CreateCheckoutResponse> {
  const { data } = await api.post<CreateCheckoutResponse>("/billing/checkout", {
    plan,
  });
  return data;
}

export async function getPaymentAttempt(
  paymentAttemptId: string,
): Promise<PaymentAttempt> {
  const { data } = await api.get<PaymentAttempt>(
    `/billing/payments/${encodeURIComponent(paymentAttemptId)}`,
  );
  return data;
}
