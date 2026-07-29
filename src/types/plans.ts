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

export type ClientProgramSummary = {
  id: string;
  membershipId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: PlanStatus | string;
};

export type WorkoutLogSetOutcome = "completed" | "skipped" | "failed" | string;

export type WorkoutLogSet = {
  id: string;
  loggedExerciseId: string;
  plannedSetId: string | null;
  setNumber: number;
  isExtra: boolean;
  prescribedSetType: PlannedExerciseSet["setType"] | string;
  prescribedRepsMin: number | null;
  prescribedRepsMax: number | null;
  prescribedDurationSeconds: number | null;
  prescribedWeightKg: number | null;
  prescribedIntensityType: PlannedExerciseSet["intensityType"] | string | null;
  prescribedIntensityValue: number | null;
  reps: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
  rpe: number | null;
  outcome: WorkoutLogSetOutcome;
};

export type WorkoutLogExercise = {
  id: string;
  loggedWorkoutId: string;
  plannedExerciseId: string | null;
  exerciseId: string;
  exerciseName: string;
  position: number;
  sets: WorkoutLogSet[];
};

export type WorkoutLogStatus = "completed" | "in_progress" | "skipped" | "partial" | string;

export type WorkoutLog = {
  id: string;
  tenantId: string;
  membershipId: string;
  programId: string;
  programDayId: string;
  scheduledDate: string;
  startedAt: string | null;
  completedAt: string | null;
  durationMinutes: number | null;
  status: WorkoutLogStatus;
  clientNotes: string | null;
  overallRpe: number | null;
  createdAt: string;
  exercises: WorkoutLogExercise[];
};

export type ProgramWorkoutLogsResponse = {
  program: ClientProgramSummary;
  logs: WorkoutLog[];
};

export type PrescribedDayExercise = {
  id: string;
  tenantId?: string;
  programDayId: string;
  exerciseId: string;
  exerciseName: string;
  category?: string;
  primaryMuscle?: string;
  secondaryMuscles?: string[];
  equipment?: string[];
  demoVideoUrl?: string | null;
  demoGifUrl?: string | null;
  thumbnailUrl?: string | null;
  instructionSteps?: string[];
  position: number;
  supersetGroup?: number | null;
  restSeconds?: number;
  tempo?: string | null;
  coachNotes?: string | null;
  sets: PlannedExerciseSet[];
};

export type PrescribedDayInfo = {
  id: string;
  tenantId?: string;
  programWeekId?: string;
  dayNumber: number;
  name: string | null;
  isRestDay: boolean;
  notes: string | null;
  exercises: PrescribedDayExercise[];
  weekNumber?: number;
};

export type ProgramDayLogResponse = {
  program: ClientProgramSummary;
  scheduledDate: string;
  prescription: PrescribedDayInfo;
  workoutLog: WorkoutLog | null;
};

