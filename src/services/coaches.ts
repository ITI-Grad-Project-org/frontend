import { api } from "@/lib/api";
import type { Coach, UpdateCoachPayload } from "@/types/auth";

// ── Profile ────────────────────────────────────────────────────────────────────

export async function getCoachProfile(): Promise<Coach> {
  const { data } = await api.get<Coach>("/coaches/me");
  return data;
}

export async function updateCoachProfile(
  payload: UpdateCoachPayload,
): Promise<Coach> {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));
  const { data } = await api.patch<Coach>("/coaches/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteCoachProfile(): Promise<void> {
  await api.delete("/coaches/me");
}

// ── Avatar ─────────────────────────────────────────────────────────────────────

/** PUT /coaches/me/avatar — set or replace profile photo */
export async function uploadCoachAvatar(file: File): Promise<Coach> {
  const formData = new FormData();
  formData.append("avatar", file);
  const { data } = await api.put<Coach>("/coaches/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** DELETE /coaches/me/avatar — remove profile photo */
export async function removeCoachAvatar(): Promise<Coach> {
  const { data } = await api.delete<Coach>("/coaches/me/avatar");
  return data;
}

// ── Transformation photos ──────────────────────────────────────────────────────

/** POST /coaches/me/transformation-photos — upload one or more photos */
export async function addTransformationPhotos(files: File[]): Promise<Coach> {
  const formData = new FormData();
  files.forEach((file) => formData.append("photos", file));
  const { data } = await api.post<Coach>(
    "/coaches/me/transformation-photos",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
}

/** DELETE /coaches/me/transformation-photos?url=... — remove one photo by URL */
export async function removeTransformationPhoto(url: string): Promise<Coach> {
  const { data } = await api.delete<Coach>(
    "/coaches/me/transformation-photos",
    {
      params: { url },
    },
  );
  return data;
}

// ── Certifications ─────────────────────────────────────────────────────────────

export interface AddCertificationOptions {
  name: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialUrl?: string;
  file: File;
}

/** POST /coaches/me/certifications — add a certification with its file */
export async function addCertification(
  options: AddCertificationOptions,
): Promise<Coach> {
  const formData = new FormData();
  formData.append("name", options.name);
  if (options.issuer) formData.append("issuer", options.issuer);
  if (options.issueDate) formData.append("issueDate", options.issueDate);
  if (options.expiryDate) formData.append("expiryDate", options.expiryDate);
  if (options.credentialUrl)
    formData.append("credentialUrl", options.credentialUrl);
  formData.append("file", options.file);

  const { data } = await api.post<Coach>(
    "/coaches/me/certifications",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
}

/** DELETE /coaches/me/certifications/{certificationId} — remove a certification */
export async function removeCertification(
  certificationId: string,
): Promise<Coach> {
  const { data } = await api.delete<Coach>(
    `/coaches/me/certifications/${certificationId}`,
  );
  return data;
}
