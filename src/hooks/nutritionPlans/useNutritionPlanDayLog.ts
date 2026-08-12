import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { getNutritionPlanDayLog } from "@/services/nutritionPlans";
import { getClients } from "@/services/clients";
import { getApiErrorMessage } from "@/lib/api";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function useNutritionPlanDayLog() {
  const { planId, dayId } = useParams();

  const dayLogQuery = useQuery({
    queryKey: ["nutrition-plan-day-log", planId, dayId],
    queryFn: () => getNutritionPlanDayLog(planId!, dayId!),
    enabled: !!planId && !!dayId,
  });

  // The clients list is cached from the Clients page, so the owner lookup
  // usually resolves without a network call.
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClients(),
    staleTime: 5 * 60_000,
  });

  const membershipId = dayLogQuery.data?.plan?.membershipId;
  const client = membershipId
    ? clientsQuery.data?.find((c) => c.id === membershipId) ?? null
    : null;

  const error = !planId || !dayId
    ? "Plan ID or Day ID is missing."
    : toError(dayLogQuery.error, "Failed to load nutrition day log.");

  return {
    planId,
    dayId,
    plan: dayLogQuery.data?.plan ?? null,
    scheduledDate: dayLogQuery.data?.scheduledDate ?? null,
    prescription: dayLogQuery.data?.prescription ?? null,
    comparisons: dayLogQuery.data?.comparisons ?? null,
    client,
    isLoading: dayLogQuery.isPending,
    error,
  };
}