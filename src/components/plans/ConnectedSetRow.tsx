/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Control, FieldValues, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { SetRow } from "@/components/plans/SetRow";

export type ConnectedSetRowProps = {
    index: number;
    control: Control<FieldValues>;
    register: UseFormRegister<FieldValues>;
    setValue: UseFormSetValue<FieldValues>;
    setErrors: Record<string, any> | undefined;
    isPending: boolean;
    canRemove: boolean;
    onRemove: () => void;
};

export function ConnectedSetRow({
    index,
    control,
    register,
    setValue,
    setErrors,
    isPending,
    canRemove,
    onRemove,
}: ConnectedSetRowProps) {
    const mode = useWatch({ control, name: `sets.${index}.mode` });
    const intensityType = useWatch({ control, name: `sets.${index}.intensityType` });

    const handleModeChange = (newMode: "reps" | "duration") => {
        setValue(`sets.${index}.mode`, newMode, { shouldDirty: true });
        if (newMode === "duration") {
            setValue(`sets.${index}.repsMin`, "", { shouldDirty: true });
            setValue(`sets.${index}.repsMax`, "", { shouldDirty: true });
        } else {
            setValue(`sets.${index}.durationSeconds`, "", { shouldDirty: true });
        }
    };

    return (
        <SetRow
            index={index}
            setsFieldName="sets"
            control={control}
            register={register}
            setErrors={setErrors}
            isPending={isPending}
            canRemove={canRemove}
            onRemove={onRemove}
            mode={mode ?? "reps"}
            intensityType={intensityType ?? ""}
            onModeChange={handleModeChange}
        />
    );
}