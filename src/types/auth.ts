export type Certification = {
  id?: string;
  name: string;
  issuer?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  fileUrl?: string | null;
  credentialUrl?: string | null;
};

export type CoachGender = "male" | "female" | "other";
export type CoachAvailability = "yes" | "no" | "hybrid";

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  timezone: string;
  currency: string;
  settings?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type Coach = {
  id: string;
  email: string;
  phone?: string | null;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  age?: number | null;
  gender?: CoachGender | null;
  location?: string | null;
  specialties?: string[];
  yearsExperience?: number | null;
  careerExperience?: string | null;
  certifications?: Certification[];
  portfolioUrl?: string | null;
  transformationPhotos?: string[];
  featuredReviews?: string | null;
  offlineAvailability?: CoachAvailability | null;
  availabilityHours?: string | null;
  priceFrom?: number | null;
  priceTo?: number | null;
  socialLinks?: Record<string, string>;
  lastLoginAt?: string | null;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  tenants?: Tenant[];
};

export type AuthResponse = {
  user: Coach;
  accessToken: string;
  refreshToken?: string;
  isNew?: boolean;
};

export type TokenResponse = {
  accessToken: string;
  refreshToken?: string;
  user?: Coach;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  timezone: string;
  currency: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type UpdateCoachPayload = {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  avatarUrl?: string | null;
  phone?: string | null;
  age?: number | null;
  gender?: CoachGender | null;
  location?: string | null;
  specialties?: string[];
  yearsExperience?: number | null;
  careerExperience?: string | null;
  portfolioUrl?: string | null;
  featuredReviews?: string | null;
  bio?: string | null;
  offlineAvailability?: CoachAvailability | null;
  availabilityHours?: string | null;
  priceFrom?: number | null;
  priceTo?: number | null;
};
