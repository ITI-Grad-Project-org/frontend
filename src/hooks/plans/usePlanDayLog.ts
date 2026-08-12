import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { getProgramDayWorkoutLog } from "@/services/plans";
import { getClients } from "@/services/clients";
import { getApiErrorMessage } from "@/lib/api";

const toError = (error: unknown, fallback: string) =>
  error ? getApiErrorMessage(error, fallback) : "";

export function usePlanDayLog() {
  const { programId, programDayId } = useParams();

  const dayLogQuery = useQuery({
    queryKey: ["plan-day-log", programId, programDayId],
    queryFn: () => getProgramDayWorkoutLog(programId!, programDayId!),
    enabled: !!programId && !!programDayId,
  });

  // The clients list is cached from the Clients page, so the owner lookup
  // usually resolves without a network call.
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClients(),
    staleTime: 5 * 60_000,
  });

  const membershipId = dayLogQuery.data?.program?.membershipId;
  const client = membershipId
    ? clientsQuery.data?.find((c) => c.id === membershipId) ?? null
    : null;

  const error = !programId || !programDayId
    ? "Program ID or Day ID is missing."
    : toError(dayLogQuery.error, "Failed to load workout log for this program day.");

  return {
    programId,
    programDayId,
    program: dayLogQuery.data?.program || null,
    scheduledDate: dayLogQuery.data?.scheduledDate || null,
    prescription: dayLogQuery.data?.prescription || null,
    workoutLog: dayLogQuery.data?.workoutLog || null,
    client,
    isLoading: dayLogQuery.isPending,
    error,
  };
}