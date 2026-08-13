import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api";
import { signOut } from "@/services/auth";
import {
  deleteCoachProfile,
  getCoachProfile,
  updateCoachProfile,
  addCertification,
  addTransformationPhotos,
  removeTransformationPhoto,
  removeCertification,
} from "@/services/coaches";
import { useAuthStore } from "@/stores/auth-store";
import {
  profileSchema,
  emptyProfile,
  toFormValues,
  toUpdateCoachPayload,
  toNewCertification,
  type ProfileFormData,
} from "../../schemas/profileSchema";

interface UseProfileDataOptions {
  onSuccessfulSave?: () => void;
}

export function useProfileData({
  onSuccessfulSave,
}: UseProfileDataOptions = {}) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  const [submissionError, setSubmissionError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileFormData>,
    defaultValues: user ? toFormValues(user) : emptyProfile,
  });

  const { reset, setValue, handleSubmit } = form;

  const updateSpecialties = useCallback(
    (nextSpecialties: string[], shouldDirty: boolean) => {
      setSpecialties(nextSpecialties);
      setValue("specialties", nextSpecialties.join(", "), {
        shouldDirty,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const applyProfile = useCallback(
    (coach: Awaited<ReturnType<typeof getCoachProfile>>) => {
      setUser(coach);
      reset(toFormValues(coach));
      updateSpecialties(coach.specialties ?? [], false);
    },
    [reset, setUser, updateSpecialties],
  );

  // Cached profile — revisits within the stale window skip the network call.
  const profileQuery = useQuery({
    queryKey: ["coach-profile"],
    queryFn: () => getCoachProfile(),
    staleTime: 5 * 60_000,
  });

  // Populate the form + auth store once from the first result. Later background
  // refetches are ignored so the user's in-progress edits survive.
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current || !profileQuery.data) return;
    initializedRef.current = true;
    applyProfile(profileQuery.data);
  }, [profileQuery.data, applyProfile]);

  const loadError = profileQuery.error
    ? getApiErrorMessage(
        profileQuery.error,
        "We could not load your profile. Please refresh and try again.",
      )
    : "";

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const refreshProfile = useCallback(async () => {
    const result = await profileQuery.refetch();
    const coach = result.data;
    if (coach) applyProfile(coach);
    return coach;
  }, [profileQuery, applyProfile]);

  const addSpecialty = (nextSpecialty: string) => {
    if (!specialties.includes(nextSpecialty)) {
      updateSpecialties([...specialties, nextSpecialty], true);
    }
  };

  const removeSpecialty = (specialtyToRemove: string) => {
    updateSpecialties(
      specialties.filter((s) => s !== specialtyToRemove),
      true,
    );
  };

  // ── Transformation photos ─────────────────────────────────────────────────────

  /**
   * DELETE /coaches/me/transformation-photos?url=...
   * Removes the photo from the backend and refreshes the form.
   */
  const clearTransformationPhoto = async (photoUrl: string) => {
    const current = form.getValues("transformationPhotos");
    // Optimistic UI update
    form.setValue(
      "transformationPhotos",
      current.filter((p) => p.url !== photoUrl),
      { shouldDirty: false },
    );

    try {
      await removeTransformationPhoto(photoUrl);
      await refreshProfile();
      toast.success("Photo removed.");
    } catch {
      toast.error("Could not remove photo. Please try again.");
      form.setValue("transformationPhotos", current);
    }
  };

  // ── Certifications ────────────────────────────────────────────────────────────

  /**
   * DELETE /coaches/me/certifications/{id}
   * Removes the certification from the backend and refreshes the form.
   */
  const clearCertification = async (certificationId: string) => {
    try {
      await removeCertification(certificationId);
      await refreshProfile();
      toast.success("Certification removed.");
    } catch {
      toast.error("Could not remove certification. Please try again.");
    }
  };

  // ── Main form submit ──────────────────────────────────────────────────────────

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      toast.error("User session not found. Please log in again.");
      return;
    }

    setSubmissionError("");

    const { payload, newTransformationPhotos } = toUpdateCoachPayload(
      {
        ...data,
        specialties: specialties.join(", "),
      },
      form.formState.dirtyFields as Partial<Record<keyof ProfileFormData, boolean>>,
    );

    try {
      // 1. Save all text/scalar profile fields
      await updateCoachProfile(payload);

      // 2. Upload any new transformation photos
      if (newTransformationPhotos.length > 0) {
        await addTransformationPhotos(newTransformationPhotos);
      }

      // 3. Add staged certifications (each carries its own file)
      for (const stagedCert of data.stagedCertifications) {
        const newCert = toNewCertification(stagedCert);
        if (newCert) await addCertification(newCert);
      }

      // 4. Remove certifications staged for deletion
      for (const certificationId of data.removedCertificationIds) {
        await removeCertification(certificationId);
      }

      await refreshProfile();
      toast.success("Profile updated successfully!");
      onSuccessfulSave?.();
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        "We could not save your profile. Please try again.",
      );
      setSubmissionError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleFormInvalid = () => {
    toast.error("Please fill in the highlighted fields before saving.");
  };

  // ── Auth ──────────────────────────────────────────────────────────────────────

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.log(error);
    } finally {
      clearSession();
      toast.success("You've been signed out.");
      navigate("/", { replace: true });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!user) return;
    setIsDeleting(true);
    setSubmissionError("");

    try {
      await deleteCoachProfile();
      clearSession();
      navigate("/", { replace: true });
    } catch (error) {
      setSubmissionError(
        getApiErrorMessage(
          error,
          "We could not delete your profile. Please try again.",
        ),
      );
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    user,
    form,
    specialties,
    isLoading: profileQuery.isPending,
    loadError,
    submissionError,
    isDeleting,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    addSpecialty,
    removeSpecialty,
    clearTransformationPhoto,
    clearCertification,
    refreshProfile,
    handleSubmit: handleSubmit(onSubmit, handleFormInvalid),
    handleSignOut,
    handleDeleteConfirm,
  };
}