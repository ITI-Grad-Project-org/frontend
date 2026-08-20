export type SubscriptionPlan = "free" | "solo" | "studio";

export type PaymentAttemptStatus = "pending" | "succeeded" | "failed";

export interface BillingPlan {
  plan: SubscriptionPlan;
  displayName: string;
  priceCents: number;
  currency: "EGP";
  durationDays: number | null;
  activeClientLimit: number | null;
  aiPlanBuilderEnabled: boolean;
}

export interface BillingSummary {
  plan: SubscriptionPlan;
  storedPlan: SubscriptionPlan;
  subscriptionExpiresAt: string | null;
  isPaidSubscriptionActive: boolean;
  activeClientCount: number;
  activeClientLimit: number | null;
  canAddActiveClient: boolean;
  aiPlanBuilderEnabled: boolean;
}

export interface CreateCheckoutRequest {
  plan: "solo" | "studio";
}

export interface CreateCheckoutResponse {
  paymentAttemptId: string;
  checkoutUrl: string;
}

export interface PaymentAttempt {
  id: string;
  plan: "solo" | "studio";
  amountCents: number;
  currency: "EGP";
  status: PaymentAttemptStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface PendingCheckoutContext {
  paymentAttemptId: string;
  tenantId: string;
  requestedPlan: "solo" | "studio";
  createdAt: string;
  returnTo: string;
}
