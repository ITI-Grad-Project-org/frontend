import { describe, expect, it } from "vitest";
import { createBillingPath, formatPlanPrice, safeReturnPath } from "@/lib/billing";
import type { BillingPlan } from "@/types/billing";

const soloPlan: BillingPlan = {
  plan: "solo",
  displayName: "Solo",
  priceCents: 29_900,
  currency: "EGP",
  durationDays: 30,
  activeClientLimit: 20,
  aiPlanBuilderEnabled: true,
};

describe("billing helpers", () => {
  it("formats backend cents as an EGP display price", () => {
    expect(formatPlanPrice(soloPlan)).toContain("299");
  });

  it("keeps internal return paths and rejects external-looking paths", () => {
    expect(safeReturnPath("/dashboard/clients")).toBe("/dashboard/clients");
    expect(safeReturnPath("//example.com/unsafe")).toBe("/dashboard/billing");
    expect(safeReturnPath("https://example.com/unsafe")).toBe("/dashboard/billing");
  });

  it("builds a billing route with the upgrade reason and return path", () => {
    const path = createBillingPath("/dashboard/ai-suggestions", "ai");
    const url = new URL(path, "https://uply.example");

    expect(url.pathname).toBe("/dashboard/billing");
    expect(url.searchParams.get("returnTo")).toBe("/dashboard/ai-suggestions");
    expect(url.searchParams.get("reason")).toBe("ai");
  });
});
