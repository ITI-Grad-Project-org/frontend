import { useCallback, useEffect, useState } from "react";
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
} from "@/services/coaches";
import { useAuthStore } from "@/stores/auth-store";
import {
  profileSchema,
  emptyProfile,
  toFormValues,
  toUpdateCoachPayload,
  type ProfileFormData,
} from "../schemas/profileSchema";

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

  const [loadError, setLoadError] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    let isActive = true;

    void getCoachProfile()
      .then((coach) => {
        if (isActive) {
          setUser(coach);
          reset(toFormValues(coach));
          updateSpecialties(coach.specialties ?? [], false);
        }
      })
      .catch((error) => {
        if (isActive) {
          setLoadError(
            getApiErrorMessage(
              error,
              "We could not load your profile. Please refresh and try again.",
            ),
          );
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [reset, setUser, updateSpecialties]);

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

  /**
   * Deletes one transformation photo from S3, then saves the whole profile
   * with the remaining photos so the backend array stays in sync.
   * The Remove row button calls this too.
   */
  const clearTransformationPhoto = async (photoUrl: string) => {
    const current = form.getValues("transformationPhotos");
    const remaining = current.filter((p) => p.url !== photoUrl);

    // Optimistic UI update
    form.setValue("transformationPhotos", remaining, { shouldDirty: false });

    try {
      if (photoUrl) {
        const { deleteFile } = await import("@/services/upload");
        await deleteFile(photoUrl);
      }

      // Re-save the entire profile. The remaining photos that already have URLs
      // will be preserved by sending the full form values — the deleted photo's
      // URL is gone from form state so it won't be included.
      const currentFormValues = form.getValues();
      const {
        payload,
        transformationPhotos: newPhotos,
        certificateFiles,
      } = toUpdateCoachPayload({
        ...currentFormValues,
        specialties: specialties.join(", "),
      });

      await updateCoachProfile({
        data: payload,
        transformationPhotos: newPhotos,
        certificateFiles,
      });

      const refreshed = await getCoachProfile();
      setUser(refreshed);
      reset(toFormValues(refreshed));
      updateSpecialties(refreshed.specialties ?? [], false);
      toast.success("Photo removed.");
    } catch {
      toast.error("Could not remove photo. Please try again.");
      form.setValue("transformationPhotos", current);
    }
  };

  /**
   * Deletes a certificate file from S3, clears its fileUrl in form state,
   * then re-saves the full profile so the backend record is updated immediately.
   */
  const clearCertificateFile = async (certIndex: number, fileUrl: string) => {
    // Optimistic UI update
    form.setValue(`certifications.${certIndex}.fileUrl`, "", {
      shouldDirty: false,
    });
    form.setValue(`certifications.${certIndex}.file`, null, {
      shouldDirty: false,
    });

    try {
      if (fileUrl) {
        const { deleteFile } = await import("@/services/upload");
        await deleteFile(fileUrl);
      }

      // Re-save the full profile so the cleared fileUrl is persisted in the DB
      const currentFormValues = form.getValues();
      const {
        payload,
        transformationPhotos: newPhotos,
        certificateFiles,
      } = toUpdateCoachPayload({
        ...currentFormValues,
        specialties: specialties.join(", "),
      });

      await updateCoachProfile({
        data: payload,
        transformationPhotos: newPhotos,
        certificateFiles,
      });

      const refreshed = await getCoachProfile();
      setUser(refreshed);
      reset(toFormValues(refreshed));
      updateSpecialties(refreshed.specialties ?? [], false);
      toast.success("Certificate file removed.");
    } catch {
      toast.error("Could not remove certificate file. Please try again.");
      form.setValue(`certifications.${certIndex}.fileUrl`, fileUrl);
    }
  };

  /**
   * Deletes a certificate file from S3 only — no profile re-save.
   * Used when removing an entire certification card; the cert's removal
   * from the DB happens on the next form save.
   */
  const deleteCertFileFromStorage = async (fileUrl: string) => {
    try {
      const { deleteFile } = await import("@/services/upload");
      await deleteFile(fileUrl);
    } catch {
      // Best-effort — the cert card is being removed from the form anyway
      console.warn("Could not delete certificate file from storage:", fileUrl);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      toast.error("User session not found. Please log in again.");
      return;
    }

    setSubmissionError("");

    const { payload, transformationPhotos, certificateFiles } =
      toUpdateCoachPayload({
        ...data,
        specialties: specialties.join(", "),
      });

    try {
      await updateCoachProfile({
        data: payload,
        transformationPhotos,
        certificateFiles,
      });
      const refreshedCoach = await getCoachProfile();
      setUser(refreshedCoach);
      reset(toFormValues(refreshedCoach));
      updateSpecialties(refreshedCoach.specialties ?? [], false);
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
    isLoading,
    loadError,
    submissionError,
    isDeleting,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    addSpecialty,
    removeSpecialty,
    clearTransformationPhoto,
    clearCertificateFile,
    deleteCertFileFromStorage,
    handleSubmit: handleSubmit(onSubmit),
    handleSignOut,
    handleDeleteConfirm,
  };
}
