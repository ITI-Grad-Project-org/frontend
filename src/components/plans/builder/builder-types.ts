import type {
    ClientProgramDay,
    ClientProgramWeek,
    PlannedExercise,
    PlannedExerciseSet,
} from "@/types/plans";

export type BuilderPlannedExercise = PlannedExercise;

export type BuilderSetType = PlannedExerciseSet["setType"];
export type BuilderIntensityType = NonNullable<PlannedExerciseSet["intensityType"]>;

export type BuilderDay = Omit<ClientProgramDay, "exercises"> & {
    exercises: BuilderPlannedExercise[];
};

export type BuilderWeek = Omit<ClientProgramWeek, "days"> & {
    days: BuilderDay[];
};