export type PlanGoal =
  | "fat_loss"
  | "muscle_gain"
  | "recomposition"
  | "strength"
  | "endurance"
  | "general_health"
  | "yoga_mobility";

export type PlanDifficulty = "beginner" | "intermediate" | "advanced";

export type CreateClientProgramPayload = {
  membershipId: string;
  name: string;
  description?: string;
  goal: PlanGoal;
  difficulty: PlanDifficulty;
  durationWeeks: number;
  startDate: string;
};

export type UpdateClientProgramPayload = {
  name?: string;
  description?: string;
  goal?: PlanGoal;
  difficulty?: PlanDifficulty;
  startDate?: string;
};

export type PlanStatus = "draft" | "published" | "cancelled";
export type PlanSchedulePhase = "scheduled" | "active" | "ended";

export type ClientProgramDraft = {
  id: string;
  tenantId: string;
  programType: "client";
  membershipId: string;
  sourceTemplateId: string | null;
  name: string;
  description?: string | null;
  goal: PlanGoal;
  difficulty: PlanDifficulty;
  durationWeeks: number;
  startDate: string;
  endDate: string;
  status: PlanStatus;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  schedulePhase: PlanSchedulePhase | null;
};

export type RescheduleClientProgramPayload = {
  startDate: string;
};

export type ClientProgramExerciseNode = Record<string, unknown>;

export type PlannedExerciseSet = {
  id: string;
  setNumber: number;
  setType: "working" | "warmup" | "drop_set" | "amrap" | "to_failure";
  repsMin: number | null;
  repsMax: number | null;
  durationSeconds?: number | null;
  weightKg: number | null;
  intensityType?: "rpe" | "rir" | "percent_1rm" | null;
  intensityValue?: number | null;
};

export type PlannedExercise = {
  id: string;
  programDayId: string;
  exerciseId: string;
  exerciseName: string;
  position: number;
  supersetGroup: number | null;
  restSeconds: number;
  tempo: string | null;
  coachNotes: string | null;
  sets: PlannedExerciseSet[];
};

export type AddLibraryExerciseToDayPayload = {
  exerciseId: string;
  position?: number;
  supersetGroup?: number | null;
  restSeconds?: number;
  tempo?: string | null;
  coachNotes?: string | null;
  sets: Array<{
    setType: "working" | "warmup" | "drop_set" | "amrap" | "to_failure";
    repsMin?: number | null;
    repsMax?: number | null;
    weightKg?: number | null;
    intensityType?: "rpe" | "rir" | "percent_1rm" | null;
    intensityValue?: number | null;
  }>;
};

export type CreateExerciseInLibraryAndAddToDayPayload = {
  exercise: {
    name: string;
    category: string;
    primaryMuscle: string;
    secondaryMuscles?: string[];
    equipment?: string[];
    demoVideoUrl?: string | null;
    demoGifUrl?: string | null;
    thumbnailUrl?: string | null;
    instructionSteps: string[];
  };
  prescription: {
    position?: number;
    supersetGroup?: number | null;
    restSeconds?: number;
    tempo?: string | null;
    coachNotes?: string | null;
    sets: Array<{
      setType: PlannedExerciseSet["setType"];
      repsMin?: number | null;
      repsMax?: number | null;
      durationSeconds?: number | null;
      weightKg?: number | null;
      intensityType?: PlannedExerciseSet["intensityType"];
      intensityValue?: number | null;
    }>;
  };
};

export type UpdateProgramDayPayload = {
  name?: string | null;
  notes?: string | null;
  isRestDay?: boolean;
};

export type UpdatePlannedExercisePayload = {
  position?: number;
  supersetGroup?: number | null;
  restSeconds?: number;
  tempo?: string | null;
  coachNotes?: string | null;
};

export type ReplacePlannedExerciseSetsPayload = {
  sets: Array<{
    setType: PlannedExerciseSet["setType"];
    repsMin?: number | null;
    repsMax?: number | null;
    durationSeconds?: number | null;
    weightKg?: number | null;
    intensityType?: PlannedExerciseSet["intensityType"];
    intensityValue?: number | null;
  }>;
};

export type ClientProgramDay = {
  id: string;
  tenantId: string;
  programWeekId: string;
  dayNumber: number;
  name: string | null;
  isRestDay: boolean;
  notes: string | null;
  exercises: ClientProgramExerciseNode[];
  scheduledDate: string;
};

export type ClientProgramWeek = {
  id: string;
  tenantId: string;
  programId: string;
  weekNumber: number;
  notes: string | null;
  days: ClientProgramDay[];
};

export type ClientProgramTree = ClientProgramDraft & {
  weeks: ClientProgramWeek[];
};
