export interface ClientDetail {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  dateOfBirth: string; // "YYYY-MM-DD"
  gender: string;
  heightCm: number;
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
