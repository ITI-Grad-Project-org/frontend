import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { reviewMeasurement } from "@/services/clients";
import { getApiErrorMessage } from "@/lib/api";

export interface ReviewMeasurementVariables {
  measurementId: string;
  coachFeedback: string;
}

export function useReviewMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ measurementId, coachFeedback }: ReviewMeasurementVariables) =>
      reviewMeasurement(measurementId, coachFeedback),
    onSuccess: () => {
      toast.success("Review saved — the client can now see your feedback.");
      void queryClient.invalidateQueries({
        queryKey: ["measurements-reviews-pending"],
      });
      void queryClient.invalidateQueries({ queryKey: ["client-measurements"] });
      void queryClient.invalidateQueries({
        queryKey: ["analytics-attention"],
        refetchType: "none",
      });
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Could not save this review. Please try again."),
      ),
  });
}