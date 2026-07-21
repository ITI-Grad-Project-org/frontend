export type ExerciseCategory =
  | "strength"
  | "cardio"
  | "mobility"
  | "plyometric"
  | "core";

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core"
  | "full_body";

export type Exercise = {
  id: string;
  tenantId: string;
  name: string;
  category: ExerciseCategory;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: string[];
  demoVideoUrl?: string | null;
  demoGifUrl?: string | null;
  thumbnailUrl?: string | null;
  instructionSteps: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ExercisePayload = {
  name: string;
  category: ExerciseCategory;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: string[];
  equipment: string[];
  demoVideoUrl?: string | null;
  demoGifUrl?: string | null;
  thumbnailUrl?: string | null;
  instructionSteps: string[];
};

export type GetExercisesParams = {
  category?: string;
  primaryMuscle?: string;
  search?: string;
  includeInactive?: boolean;
};
