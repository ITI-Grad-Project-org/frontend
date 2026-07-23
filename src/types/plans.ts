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
    status: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    schedulePhase?: string | null;
};

export type ClientProgramExerciseNode = Record<string, unknown>;

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
