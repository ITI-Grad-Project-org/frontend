export interface ClientDetail {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  dateOfBirth: string; // "YYYY-MM-DD"
  gender: string;
  timezone: string | null;
  heightCm: number;
  weightKg: string;
  googleId: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ClientConnection {
  id: string;
  status: string; // e.g. "active"
  blockReason: string | null;
  joinedAt: string; // ISO date string
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  client: ClientDetail;
}

export interface ClientTenant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  acceptingClients: boolean;
  timezone: string;
  currency: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ClientConnectionDetail extends ClientConnection {
  requestMessage: string | null;
  decidedAt: string | null;
  monthlyPrice: number | null;
  currency: string | null;
  tenant: ClientTenant;
}

export interface MeasurementReviewEntry {
  id: string;
  measuredAt: string; // "YYYY-MM-DD"
  weightKg: number | null;
  bodyFatPct: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipsCm: number | null;
  armCm: number | null;
  thighCm: number | null;
  photos: string[];
}

export interface ClientMeasurement extends MeasurementReviewEntry {
  tenantId: string;
  membershipId: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  coachFeedback: string | null;
}

export interface PendingMeasurementReview extends MeasurementReviewEntry {
  reviewedAt: string | null;
  reviewedBy: string | null;
  coachFeedback: string | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export interface PendingMeasurementReviewsResponse {
  docs: PendingMeasurementReview[];
  meta: MeasurementPaginationMeta;
}

export interface MeasurementPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MeasurementListResponse {
  docs: ClientMeasurement[];
  meta: MeasurementPaginationMeta;
}

export interface MeasurementQueryParams {
  page?: number;
  limit?: number;
  from?: string; // "YYYY-MM-DD"
  to?: string; // "YYYY-MM-DD"
}

export interface ClientInvitation {
  id: string;
  email: string;
  clientName: string;
  status: string; // e.g. "pending", "accepted", "revoked"
  token: string;
  expiresAt: string;
  created_at: string;
  updated_at: string;
}

export interface JoinRequest {
  id: string;
  status: string; // e.g. "requested"
  blockReason: string | null;
  requestMessage: string | null;
  decidedAt: string | null;
  joinedAt: string | null;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  client: ClientDetail;
}
