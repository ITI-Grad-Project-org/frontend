import { Plus } from "lucide-react";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import type { Coach } from "@/types/auth";
import type { ProfileFormData } from "@/schemas/profileSchema";
import { StagedCertCard } from "./StagedCertCard";
import { ExistingCertCard } from "./ExistingCertCard";

type StagedCertFields = ProfileFormData["stagedCertifications"][number] & { id: string };

interface CertificationsManagerProps {
    existingCertifications: Coach["certifications"];
    stagedCertifications: StagedCertFields[];
    removedCertificationIds: string[];
    register: UseFormRegister<ProfileFormData>;
    control: Control<ProfileFormData>;
    errors: FieldErrors<ProfileFormData>;
    onAddCertification: () => void;
    onRemoveStaged: (index: number) => void;
    onStageRemoval: (certificationId: string) => void;
    onRestoreRemoval: (certificationId: string) => void;
    description?: string;
}

export function CertificationsManager({
    existingCertifications,
    stagedCertifications,
    removedCertificationIds,
    register,
    control,
    errors,
    onAddCertification,
    onRemoveStaged,
    onStageRemoval,
    onRestoreRemoval,
    description,
}: CertificationsManagerProps) {
    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Credentials</p>
                    <h2 className="mt-1 text-lg font-bold">Credentials & pricing</h2>
                    {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
                </div>
                <button type="button" onClick={onAddCertification}
                    className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold transition border rounded-xl border-border hover:bg-muted">
                    <Plus className="w-4 h-4" /> Add certification
                </button>
            </div>

            {existingCertifications && existingCertifications.length > 0 && (
                <div className="mt-4 space-y-3">
                    {existingCertifications.map((cert) => {
                        const pendingRemoval = Boolean(cert.id && removedCertificationIds.includes(cert.id));
                        return (
                            <ExistingCertCard
                                key={cert.id ?? cert.name}
                                cert={cert}
                                pendingRemoval={pendingRemoval}
                                onRemove={cert.id ? () => onStageRemoval(cert.id!) : undefined}
                                onRestore={cert.id ? () => onRestoreRemoval(cert.id!) : undefined}
                            />
                        );
                    })}
                </div>
            )}

            {stagedCertifications.length > 0 && (
                <div className="mt-4 space-y-3">
                    {stagedCertifications.map((staged, index) => (
                        <StagedCertCard
                            key={staged.id}
                            index={index}
                            register={register}
                            control={control}
                            errors={errors}
                            onRemove={() => onRemoveStaged(index)}
                        />
                    ))}
                </div>
            )}

            {!existingCertifications?.length && stagedCertifications.length === 0 && (
                <p className="mt-4 px-4 py-3 text-sm rounded-xl bg-muted text-muted-foreground">
                    No certifications added yet.
                </p>
            )}
        </div>
    );
}