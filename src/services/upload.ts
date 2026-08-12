import { api } from "@/lib/api";
import { compressImageFile, compressImageFiles } from "@/lib/image-compress";

export type UploadType = "avatar" | "transformation" | "certificate";

export interface UploadImageResponse {
  url: string;
  key: string;
}

export interface UploadImagesResponse {
  urls: string[];
  keys: string[];
}

export interface UploadDocumentResponse {
  url: string;
  key: string;
}

/**
 * Upload a single image
 */
export async function uploadImage(
  file: File,
  type: UploadType,
): Promise<UploadImageResponse> {
  const prepared = await compressImageFile(file);
  const formData = new FormData();
  formData.append("file", prepared);
  formData.append("type", type);

  const { data } = await api.post<UploadImageResponse>(
    "/upload/image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
}

/**
 * Upload multiple images
 */
export async function uploadImages(
  files: File[],
  type: UploadType,
): Promise<UploadImagesResponse> {
  const prepared = await compressImageFiles(files);
  const formData = new FormData();
  prepared.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("type", type);

  const { data } = await api.post<UploadImagesResponse>(
    "/upload/images",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
}

/**
 * Upload a single document (PDF or image scan)
 */
export async function uploadDocument(
  file: File,
  type: UploadType,
): Promise<UploadDocumentResponse> {
  const prepared = await compressImageFile(file);
  const formData = new FormData();
  formData.append("file", prepared);
  formData.append("type", type);

  const { data } = await api.post<UploadDocumentResponse>(
    "/upload/document",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
}

/**
 * Delete a file by S3 key.
 * Accepts either a raw key ("avatars/abc.jpg") or a full S3/CDN URL
 * from which the key is extracted automatically.
 */
export async function deleteFile(keyOrUrl: string): Promise<void> {
  const key = extractKey(keyOrUrl);
  await api.delete(`/upload/${encodeURIComponent(key)}`);
}

/**
 * Derive the S3 object key from a full URL or return the value as-is
 * if it's already a plain key (no "/" after the host).
 *
 * Examples:
 *  "https://bucket.s3.region.amazonaws.com/avatars/abc.jpg" → "avatars/abc.jpg"
 *  "https://cdn.example.com/avatars/abc.jpg"               → "avatars/abc.jpg"
 *  "avatars/abc.jpg"                                        → "avatars/abc.jpg"
 */
function extractKey(keyOrUrl: string): string {
  try {
    const url = new URL(keyOrUrl);
    // Remove leading slash from pathname
    return url.pathname.replace(/^\//, "");
  } catch {
    // Not a valid URL — treat the whole string as the key
    return keyOrUrl;
  }
}
