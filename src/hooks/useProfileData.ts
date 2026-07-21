import { useEffect, useState } from "react";
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

export function useProfileData() {
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

  const updateSpecialties = (
    nextSpecialties: string[],
    shouldDirty: boolean,
  ) => {
    setSpecialties(nextSpecialties);
    setValue("specialties", nextSpecialties.join(", "), {
      shouldDirty,
      shouldValidate: true,
    });
  };

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
  }, [reset, setUser, setValue]);

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

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      toast.error("User session not found. Please log in again.");
      return;
    }

    setSubmissionError("");

    const payload = toUpdateCoachPayload({
      ...data,
      specialties: specialties.join(", "),
    });

    try {
      await updateCoachProfile(payload);
      const refreshedCoach = await getCoachProfile();
      setUser(refreshedCoach);
      reset(toFormValues(refreshedCoach));
      updateSpecialties(refreshedCoach.specialties ?? [], false);
      toast.success("Profile updated successfully!");
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
    handleSubmit: handleSubmit(onSubmit),
    handleSignOut,
    handleDeleteConfirm,
  };
}
