import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getProgramDayWorkoutLog } from "@/services/plans";
import { getClients } from "@/services/clients";
import { getApiErrorMessage } from "@/lib/api";
import type { ProgramDayLogResponse } from "@/types/plans";
import type { ClientConnection } from "@/types/client";

export function usePlanDayLog() {
  const { programId, programDayId } = useParams();
  const [data, setData] = useState<ProgramDayLogResponse | null>(null);
  const [client, setClient] = useState<ClientConnection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isActive = true;

    if (!programId || !programDayId) {
      setError("Program ID or Day ID is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    void (async () => {
      try {
        const res = await getProgramDayWorkoutLog(programId, programDayId);
        if (!isActive) return;
        setData(res);

        if (res.program?.membershipId) {
          try {
            const allClients = await getClients();
            const found = allClients.find((c) => c.id === res.program.membershipId);
            if (isActive && found) setClient(found);
          } catch {
            // Optional fallback
          }
        }
      } catch (err) {
        if (isActive) {
          setError(getApiErrorMessage(err, "Failed to load workout log for this program day."));
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [programId, programDayId]);

  return {
    programId,
    programDayId,
    program: data?.program || null,
    scheduledDate: data?.scheduledDate || null,
    prescription: data?.prescription || null,
    workoutLog: data?.workoutLog || null,
    client,
    isLoading,
    error,
  };
}
