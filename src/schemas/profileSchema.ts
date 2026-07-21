import { z } from "zod";
import type { Coach } from "@/types/auth";

export const certificationSchema = z.object({
  name: z.string().trim().min(1, "Certification name is required"),
  issuer: z.string().trim().min(1, "Issuer is required"),
  year: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Use a four-digit year"),
  credentialUrl: z.union([
    z.string().trim().url("Enter a valid URL"),
    z.literal(""),
  ]),
});

export const specialtyOptions = [
  { value: "strength", label: "Strength" },
  { value: "hypertrophy", label: "Hypertrophy" },
  { value: "weight_loss", label: "Weight loss" },
  { value: "powerlifting", label: "Powerlifting" },
  { value: "crossfit", label: "CrossFit" },
  { value: "calisthenics", label: "Calisthenics" },
  { value: "nutrition", label: "Nutrition" },
  { value: "rehab", label: "Rehab" },
  { value: "general_fitness", label: "General fitness" },
] as const;

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters"),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^\+\d{8,15}$/, "Use an international phone number"),
  bio: z.string().trim().max(1000, "Bio must be 1,000 characters or fewer"),
  specialties: z.string().trim(),
  yearsExperience: z
    .string()
    .trim()
    .refine(
      (val) => !val || (/^\d+$/.test(val) && Number(val) <= 99),
      "Use a whole number between 0 and 99",
    ),
  certifications: z.array(certificationSchema),
  avatarUrl: z.union([
    z.string().trim().url("Enter a valid URL"),
    z.literal(""),
  ]),
  socialLinks: z
    .object({
      instagram: z.union([
        z.string().trim().url("Enter a valid URL"),
        z.literal(""),
      ]),
      facebook: z.union([
        z.string().trim().url("Enter a valid URL"),
        z.literal(""),
      ]),
      twitter: z.union([
        z.string().trim().url("Enter a valid URL"),
        z.literal(""),
      ]),
      linkedin: z.union([
        z.string().trim().url("Enter a valid URL"),
        z.literal(""),
      ]),
    })
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const emptyProfile: ProfileFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  bio: "",
  specialties: "",
  yearsExperience: "",
  certifications: [],
  avatarUrl: "",
  socialLinks: { instagram: "", facebook: "", twitter: "", linkedin: "" },
};

export function specialtyLabel(value: string): string {
  return (
    specialtyOptions.find((specialty) => specialty.value === value)?.label ??
    value
  );
}

export function toFormValues(coach: Coach): ProfileFormData {
  return {
    firstName: coach.firstName ?? "",
    lastName: coach.lastName ?? "",
    email: coach.email ?? "",
    phone: coach.phone ?? "",
    bio: coach.bio ?? "",
    specialties: coach.specialties?.join(", ") ?? "",
    yearsExperience: coach.yearsExperience?.toString() ?? "",
    certifications:
      coach.certifications?.map((cert) => ({
        name: cert.name,
        issuer: cert.issuer,
        year: cert.year.toString(),
        credentialUrl: cert.credentialUrl ?? "",
      })) ?? [],
    avatarUrl: coach.avatarUrl ?? "",
    socialLinks: {
      instagram: coach.socialLinks?.instagram ?? "",
      facebook: coach.socialLinks?.facebook ?? "",
      twitter: coach.socialLinks?.twitter ?? "",
      linkedin: coach.socialLinks?.linkedin ?? "",
    },
  };
}

export const inputClassName =
  "w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";
