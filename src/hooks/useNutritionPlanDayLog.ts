import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getNutritionPlanDayLog } from "@/services/nutritionPlans";
import { getClients } from "@/services/clients";
import { getApiErrorMessage } from "@/lib/api";
import type { NutritionPlanDayLogResponse } from "@/types/nutritionPlans";
import type { ClientConnection } from "@/types/client";

export function useNutritionPlanDayLog() {
  const { planId, dayId } = useParams();
  const [data, setData] = useState<NutritionPlanDayLogResponse | null>(null);
  const [client, setClient] = useState<ClientConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    if (!planId || !dayId) {
      setError("Plan ID or Day ID is missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError("");
    void (async () => {
      try {
        const res = await getNutritionPlanDayLog(planId, dayId);
        if (!isActive) return;
        setData(res);
        if (res.plan?.membershipId) {
          try {
            const allClients = await getClients();
            const found = allClients.find(
              (c) => c.id === res.plan.membershipId,
            );
            if (isActive && found) setClient(found);
          } catch {
            // optional
          }
        }
      } catch (err) {
        if (isActive)
          setError(
            getApiErrorMessage(err, "Failed to load nutrition day log."),
          );
      } finally {
        if (isActive) setIsLoading(false);
      }
    })();
    return () => {
      isActive = false;
    };
  }, [planId, dayId]);

  return {
    planId,
    dayId,
    plan: data?.plan ?? null,
    scheduledDate: data?.scheduledDate ?? null,
    prescription: data?.prescription ?? null,
    comparisons: data?.comparisons ?? null,
    client,
    isLoading,
    error,
  };
}
