import { z } from "zod";
import type {
  Coach,
  CoachAvailability,
  CoachGender,
  UpdateCoachPayload,
} from "@/types/auth";

const optionalUrlSchema = z.union([
  z.string().trim().url("Enter a valid URL"),
  z.literal(""),
]);

const optionalTextSchema = z.union([z.string().trim().min(1), z.literal("")]);

const optionalDateSchema = z.union([
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  z.literal(""),
]);

const optionalNumberSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" || (/^\d+(\.\d+)?$/.test(value) && Number(value) >= 0),
    {
      message: "Use a valid number",
    },
  );

function boundedNumberSchema(min: number, max: number, message: string) {
  return optionalNumberSchema.refine(
    (value) => value === "" || (Number(value) >= min && Number(value) <= max),
    { message },
  );
}

export const certificationSchema = z.object({
  id: z.string().optional(), // present for existing server-side certs
  name: z.string().trim().min(1, "Certification name is required"),
  issuer: optionalTextSchema.optional(),
  issueDate: optionalDateSchema.optional(),
  expiryDate: optionalDateSchema.optional(),
  fileUrl: optionalUrlSchema.optional(),
  credentialUrl: optionalUrlSchema.optional(),
  file: z.instanceof(File).optional().nullable(),
  fileKey: z.string().optional(),
});

export const specialtyOptions = [
  { value: "strength", label: "Strength" },
  { value: "hypertrophy", label: "Hypertrophy" },
  { value: "endurance", label: "Endurance" },
  { value: "weight_loss", label: "Weight loss" },
  { value: "mobility", label: "Mobility" },
  { value: "rehab", label: "Rehab" },
  { value: "postpartum", label: "Postpartum" },
  { value: "yoga", label: "Yoga" },
  { value: "nutrition", label: "Nutrition" },
  { value: "powerlifting", label: "Powerlifting" },
  { value: "crossfit", label: "CrossFit" },
  { value: "calisthenics", label: "Calisthenics" },
  { value: "general_fitness", label: "General fitness" },
] as const;

export const genderOptions: Array<{ value: CoachGender; label: string }> = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const availabilityOptions: Array<{
  value: CoachAvailability;
  label: string;
}> = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "hybrid", label: "Hybrid" },
];

export const weekdayOptions = [
  { value: "Mon", label: "Monday" },
  { value: "Tue", label: "Tuesday" },
  { value: "Wed", label: "Wednesday" },
  { value: "Thu", label: "Thursday" },
  { value: "Fri", label: "Friday" },
  { value: "Sat", label: "Saturday" },
  { value: "Sun", label: "Sunday" },
] as const;

const timeOptions = [
  "12 AM",
  "1 AM",
  "2 AM",
  "3 AM",
  "4 AM",
  "5 AM",
  "6 AM",
  "7 AM",
  "8 AM",
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
  "6 PM",
  "7 PM",
  "8 PM",
  "9 PM",
  "10 PM",
  "11 PM",
] as const;

export const availabilityTimeOptions = timeOptions;

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters"),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
  phone: z
    .union([
      z
        .string()
        .trim()
        .regex(/^\+\d{8,15}$/, "Use an international phone number"),
      z.literal(""),
    ])
    .optional(),
  age: boundedNumberSchema(16, 100, "Use a whole number between 16 and 100"),
  gender: z
    .union([z.enum(["male", "female", "other"]), z.literal("")])
    .optional(),
  location: optionalTextSchema.optional(),
  specialties: z.string().trim(),
  yearsExperience: boundedNumberSchema(
    0,
    70,
    "Use a whole number between 0 and 70",
  ),
  careerExperience: z
    .string()
    .trim()
    .max(2000, "Career experience must be 2,000 characters or fewer")
    .optional(),
  certifications: z.array(certificationSchema),
  portfolioUrl: optionalUrlSchema.optional(),
  transformationPhotos: z
    .array(
      z.object({
        url: optionalUrlSchema,
        file: z.instanceof(File).optional().nullable(),
        key: z.string().optional(),
      }),
    )
    .default([]),
  featuredReviews: z
    .string()
    .trim()
    .max(1000, "Featured reviews must be 1,000 characters or fewer")
    .optional(),
  bio: z.string().trim().max(1000, "Bio must be 1,000 characters or fewer"),
  offlineAvailability: z
    .union([z.enum(["yes", "no", "hybrid"]), z.literal("")])
    .optional(),
  availabilityWeekdayStart: z.union([
    z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
    z.literal(""),
  ]),
  availabilityWeekdayEnd: z.union([
    z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
    z.literal(""),
  ]),
  availabilityStartHour: z.union([z.enum(timeOptions), z.literal("")]),
  availabilityEndHour: z.union([z.enum(timeOptions), z.literal("")]),
  priceFrom: boundedNumberSchema(
    0,
    Number.MAX_SAFE_INTEGER,
    "Use a whole number at or above 0",
  ),
  priceTo: boundedNumberSchema(
    0,
    Number.MAX_SAFE_INTEGER,
    "Use a whole number at or above 0",
  ),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const emptyProfile: ProfileFormData = {
  firstName: "",
  lastName: "",
  phone: "",
  age: "",
  gender: "",
  location: "",
  specialties: "",
  yearsExperience: "",
  careerExperience: "",
  certifications: [],
  portfolioUrl: "",
  transformationPhotos: [],
  featuredReviews: "",
  bio: "",
  offlineAvailability: "",
  availabilityWeekdayStart: "",
  availabilityWeekdayEnd: "",
  availabilityStartHour: "",
  availabilityEndHour: "",
  priceFrom: "",
  priceTo: "",
};

export function specialtyLabel(value: string): string {
  return (
    specialtyOptions.find((specialty) => specialty.value === value)?.label ??
    value
  );
}

export function formatAvailabilityHours(
  data: Pick<
    ProfileFormData,
    | "availabilityWeekdayStart"
    | "availabilityWeekdayEnd"
    | "availabilityStartHour"
    | "availabilityEndHour"
  >,
): string {
  const {
    availabilityWeekdayStart,
    availabilityWeekdayEnd,
    availabilityStartHour,
    availabilityEndHour,
  } = data;

  if (
    !availabilityWeekdayStart ||
    !availabilityWeekdayEnd ||
    !availabilityStartHour ||
    !availabilityEndHour
  ) {
    return "";
  }

  return `${availabilityWeekdayStart}–${availabilityWeekdayEnd} · ${availabilityStartHour} – ${availabilityEndHour}`;
}

export function parseAvailabilityHours(
  availabilityHours: string | null | undefined,
): Pick<
  ProfileFormData,
  | "availabilityWeekdayStart"
  | "availabilityWeekdayEnd"
  | "availabilityStartHour"
  | "availabilityEndHour"
> {
  if (!availabilityHours) {
    return {
      availabilityWeekdayStart: "",
      availabilityWeekdayEnd: "",
      availabilityStartHour: "",
      availabilityEndHour: "",
    };
  }

  const match = availabilityHours.match(
    /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)–(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*[·•]\s*(.+?)\s*[–-]\s*(.+)$/,
  );

  if (!match) {
    return {
      availabilityWeekdayStart: "",
      availabilityWeekdayEnd: "",
      availabilityStartHour: "",
      availabilityEndHour: "",
    };
  }

  const [
    ,
    availabilityWeekdayStart,
    availabilityWeekdayEnd,
    availabilityStartHour,
    availabilityEndHour,
  ] = match;

  return {
    availabilityWeekdayStart:
      availabilityWeekdayStart as ProfileFormData["availabilityWeekdayStart"],
    availabilityWeekdayEnd:
      availabilityWeekdayEnd as ProfileFormData["availabilityWeekdayEnd"],
    availabilityStartHour:
      availabilityStartHour.trim() as ProfileFormData["availabilityStartHour"],
    availabilityEndHour:
      availabilityEndHour.trim() as ProfileFormData["availabilityEndHour"],
  };
}

function cleanText(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

/** Returns the trimmed string, or null if empty — tells the backend to clear the field. */
function cleanNullableText(value: string | null | undefined): string | null {
  const nextValue = cleanText(value);
  return nextValue || null;
}

function cleanUrl(value: string | null | undefined): string | null {
  const nextValue = cleanText(value);
  return nextValue || null;
}

/** Returns the parsed number, or null if empty — tells the backend to clear the field. */
function cleanNullableNumber(value: string | undefined): number | null {
  if (!value || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function toFormValues(coach: Coach): ProfileFormData {
  return {
    firstName: coach.firstName ?? "",
    lastName: coach.lastName ?? "",
    phone: coach.phone ?? "",
    age: coach.age?.toString() ?? "",
    gender: coach.gender ?? "",
    location: coach.location ?? "",
    specialties: coach.specialties?.join(", ") ?? "",
    yearsExperience: coach.yearsExperience?.toString() ?? "",
    careerExperience: coach.careerExperience ?? "",
    certifications:
      coach.certifications?.map((cert) => ({
        id: cert.id ?? "",
        name: cert.name ?? "",
        issuer: cert.issuer ?? "",
        issueDate: cert.issueDate ?? "",
        expiryDate: cert.expiryDate ?? "",
        fileUrl: cert.fileUrl ?? "",
        credentialUrl: cert.credentialUrl ?? "",
        file: null,
        fileKey: "",
      })) ?? [],
    portfolioUrl: coach.portfolioUrl ?? "",
    transformationPhotos: coach.transformationPhotos?.length
      ? coach.transformationPhotos.map((url) => ({ url, file: null, key: "" }))
      : [],
    featuredReviews: coach.featuredReviews ?? "",
    bio: coach.bio ?? "",
    offlineAvailability: coach.offlineAvailability ?? "",
    ...parseAvailabilityHours(coach.availabilityHours),
    priceFrom: coach.priceFrom?.toString() ?? "",
    priceTo: coach.priceTo?.toString() ?? "",
  };
}

export function toUpdateCoachPayload(data: ProfileFormData): {
  payload: UpdateCoachPayload;
  newTransformationPhotos: File[];
} {
  const availabilityHours = formatAvailabilityHours(data);

  // Only new photos (no URL yet) need to be uploaded
  const newTransformationPhotos = data.transformationPhotos
    .map((photo) => photo.file)
    .filter((file): file is File => file instanceof File);

  const payload: UpdateCoachPayload = {
    firstName: cleanText(data.firstName),
    lastName: cleanText(data.lastName),
    phone: cleanNullableText(data.phone),
    age: cleanNullableNumber(data.age),
    gender: (data.gender || null) as UpdateCoachPayload["gender"],
    location: cleanNullableText(data.location),
    specialties: data.specialties
      .split(",")
      .map((specialty) => specialty.trim())
      .filter(Boolean),
    yearsExperience: cleanNullableNumber(data.yearsExperience),
    careerExperience: cleanNullableText(data.careerExperience),
    portfolioUrl: cleanUrl(data.portfolioUrl),
    featuredReviews: cleanNullableText(data.featuredReviews),
    bio: cleanNullableText(data.bio),
    offlineAvailability: (data.offlineAvailability ||
      null) as UpdateCoachPayload["offlineAvailability"],
    availabilityHours: availabilityHours || null,
    priceFrom: cleanNullableNumber(data.priceFrom),
    priceTo: cleanNullableNumber(data.priceTo),
  };

  return { payload, newTransformationPhotos };
}

export const inputClassName =
  "w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";
