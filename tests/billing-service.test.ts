import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: apiMocks.post,
  },
}));

import { createBillingCheckout } from "@/services/billing";

describe("billing service", () => {
  beforeEach(() => {
    apiMocks.post.mockReset();
  });

  it("sends only the selected paid plan when checkout starts", async () => {
    apiMocks.post.mockResolvedValue({
      data: {
        paymentAttemptId: "11111111-1111-4111-8111-111111111111",
        checkoutUrl: "https://accept.paymob.com/unifiedcheckout/example",
      },
    });

    await createBillingCheckout("solo");

    expect(apiMocks.post).toHaveBeenCalledWith("/billing/checkout", {
      plan: "solo",
    });
  });
});
