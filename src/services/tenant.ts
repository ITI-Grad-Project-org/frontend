import { api } from "@/lib/api";
import type { Tenant } from "@/types/auth";

export async function updateTenantName(name: string): Promise<Tenant> {
  const { data } = await api.patch<Tenant>("/tenant/me", { name });

  return data;
}

export async function uploadTenantLogo(file: File): Promise<Tenant> {
  const formData = new FormData();
  formData.append("logo", file);

  const { data } = await api.patch<Tenant>("/tenant/me/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}
