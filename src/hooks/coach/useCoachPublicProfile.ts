import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getCoachPublicProfile } from "@/services/reviews";
import { getApiErrorMessage } from "@/lib/api";

export function useCoachPublicProfile(tenantId?: string) {
  const query = useQuery({
    queryKey: ["coach-public-profile", tenantId],
    queryFn: () => getCoachPublicProfile(tenantId as string),
    enabled: Boolean(tenantId),
    staleTime: 5 * 60_000,
  });

  const isNotFound =
    Boolean(tenantId) &&
    query.isError &&
    axios.isAxiosError(query.error) &&
    query.error.response?.status === 404;

  const error =
    isNotFound || !query.isError
      ? ""
      : getApiErrorMessage(
          query.error,
          "Could not load this coach's profile. Please try again.",
        );

  return {
    profile: query.data ?? null,
    loading: query.isPending && Boolean(tenantId),
    error,
    isNotFound: !tenantId ? true : isNotFound,
    fetchProfile: () => {
      void query.refetch();
    },
  };
}