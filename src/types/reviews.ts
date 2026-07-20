import type { Certification } from "./auth";

export type ReviewClient = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

export type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  client: ReviewClient;
};

export type RatingSummary = {
  average: number;
  count: number;
};

export type CoachPublicProfile = {
  coach: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    bio: string | null;
    specialties: string[];
    yearsExperience: number | null;
    certifications: Certification[];
    tenant: {
      id: string;
      name: string;
      slug: string;
      logoUrl: string | null;
    };
  };
  rating: RatingSummary;
  reviews: Review[];
};
