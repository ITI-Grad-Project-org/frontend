import { api } from "@/lib/api";
import type { Coach, UpdateCoachPayload } from "@/types/auth";

export async function getCoachProfile() {
  const { data } = await api.get<Coach>("/coaches/me");
  return data;
}

export interface UpdateCoachProfileOptions {
  data: UpdateCoachPayload;
  transformationPhotos?: File[];
  certificateFiles?: File[];
}

export async function updateCoachProfile(options: UpdateCoachProfileOptions) {
  const { data: profileData, transformationPhotos, certificateFiles } = options;

  const formData = new FormData();
  formData.append("data", JSON.stringify(profileData));

  if (transformationPhotos && transformationPhotos.length > 0) {
    transformationPhotos.forEach((photo) => {
      formData.append("transformationPhotos", photo);
    });
  }

  if (certificateFiles && certificateFiles.length > 0) {
    certificateFiles.forEach((file) => {
      formData.append("certificateFiles", file);
    });
  }

  const { data } = await api.patch<Coach>("/coaches/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function deleteCoachProfile() {
  await api.delete(`/coaches/me`);
}

/**
 * Upload a new coach avatar. Sends only the avatar file — no other profile
 * fields are touched. Returns the updated Coach object.
 */
export async function uploadCoachAvatar(file: File): Promise<Coach> {
  const formData = new FormData();
  formData.append("data", JSON.stringify({}));
  formData.append("avatar", file);

  const { data } = await api.patch<Coach>("/coaches/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}
