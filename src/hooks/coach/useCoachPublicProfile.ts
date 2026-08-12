import { useEffect, useState } from "react";
import axios from "axios";
import { getCoachPublicProfile } from "@/services/reviews";
import { getApiErrorMessage } from "@/lib/api";
import type { CoachPublicProfile } from "@/types/reviews";

export function useCoachPublicProfile(tenantId?: string) {
  const [profile, setProfile] = useState<CoachPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);

  const fetchProfile = () => {
    if (!tenantId) return;
    setLoading(true);
    setError("");
    setIsNotFound(false);
    getCoachPublicProfile(tenantId)
      .then((data) => { setProfile(data); })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setIsNotFound(true);
        } else {
          setError(getApiErrorMessage(err, "Could not load this coach's profile. Please try again."));
        }
      })
      .finally(() => { setLoading(false); });
  };

  useEffect(() => {
    void (async () => {
      if (!tenantId) return;
      setLoading(true);
      setError("");
      setIsNotFound(false);
      try {
        const data = await getCoachPublicProfile(tenantId);
        setProfile(data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setIsNotFound(true);
        } else {
          setError(getApiErrorMessage(err, "Could not load this coach's profile. Please try again."));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [tenantId]);

  return { profile, loading, error, isNotFound, fetchProfile };
}