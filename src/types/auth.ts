export type Certification = {
    name: string;
    issuer: string;
    year: number;
    credentialUrl?: string | null;
};

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
    phone: string;
    firstName: string;
    lastName: string;
    bio?: string | null;
    specialties?: string[];
    yearsExperience?: number | null;
    certifications?: Certification[];
    avatarUrl?: string | null;
    lastLoginAt?: string | null;
    socialLinks?: Record<string, string>;
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
    phone: string;
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
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bio?: string;
    specialties?: string[];
    yearsExperience?: number;
    certifications?: Certification[];
};
