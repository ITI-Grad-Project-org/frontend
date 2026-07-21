import type { Certification, CoachAvailability } from "./auth";

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
    location: string | null;
    bio: string | null;
    specialties: string[];
    yearsExperience: number | null;
    careerExperience: string | null;
    certifications: Certification[];
    portfolioUrl: string | null;
    transformationPhotos: string[];
    featuredReviews: string | null;
    offlineAvailability: CoachAvailability | null;
    availabilityHours: string | null;
    priceFrom: number | null;
    priceTo: number | null;
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
