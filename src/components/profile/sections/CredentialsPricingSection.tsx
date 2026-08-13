import { useFieldArray, useWatch } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { inputClassName, type ProfileFormData } from "../../../schemas/profileSchema";
import type { Coach } from "@/types/auth";
import { CertificationsManager } from "../certifications/CertificationsManager";
import { SectionCard } from "../SectionCard";

// ── Section ────────────────────────────────────────────────────────────────────

interface CredentialsPricingSectionProps {
    register: UseFormRegister<ProfileFormData>;
    control: Control<ProfileFormData>;
    setValue: UseFormSetValue<ProfileFormData>;
    errors: FieldErrors<ProfileFormData>;
    existingCertifications: Coach["certifications"];
}

export function CredentialsPricingSection({
    register,
    control,
    setValue,
    errors,
    existingCertifications,
}: CredentialsPricingSectionProps) {
    const stagedCertifications = useFieldArray({ control, name: "stagedCertifications" });
    const removedCertificationIds =
        useWatch({ control, name: "removedCertificationIds" }) ?? [];

    const addCertification = () => {
        stagedCertifications.append({
            name: "", issuer: "", issueDate: "", expiryDate: "", credentialUrl: "", file: null,
        });
    };

    const stageRemoval = (id: string) => {
        setValue("removedCertificationIds", [...removedCertificationIds, id], { shouldDirty: true });
    };

    const restoreRemoval = (id: string) => {
        setValue("removedCertificationIds", removedCertificationIds.filter((value) => value !== id), { shouldDirty: true });
    };

    return (
        <SectionCard className="space-y-6">
            {/* ── Certifications ── */}
            <CertificationsManager
                existingCertifications={existingCertifications}
                stagedCertifications={stagedCertifications.fields}
                removedCertificationIds={removedCertificationIds}
                register={register}
                control={control}
                errors={errors}
                onAddCertification={addCertification}
                onRemoveStaged={(index) => stagedCertifications.remove(index)}
                onStageRemoval={stageRemoval}
                onRestoreRemoval={restoreRemoval}
                description="Certifications, portfolio link, and your coaching rates."
            />

            {/* ── Pricing & portfolio ── */}
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Portfolio URL</span>
                    <input className={inputClassName} type="url" placeholder="https://janesmith.coach" {...register("portfolioUrl")} />
                    {errors.portfolioUrl && <p className="mt-1 text-xs text-destructive">{errors.portfolioUrl.message}</p>}
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Price from</span>
                    <input className={inputClassName} type="number" min="0" placeholder="120" {...register("priceFrom")} />
                    {errors.priceFrom && <p className="mt-1 text-xs text-destructive">{errors.priceFrom.message}</p>}
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Price to</span>
                    <input className={inputClassName} type="number" min="0" placeholder="320" {...register("priceTo")} />
                    {errors.priceTo && <p className="mt-1 text-xs text-destructive">{errors.priceTo.message}</p>}
                </label>
            </div>
        </SectionCard>
    );
}