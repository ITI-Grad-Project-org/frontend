import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { inputClassName, type ProfileFormData } from "../../../schemas/profileSchema";
import type { Coach } from "@/types/auth";
import { CertificationsManager } from "../certifications/CertificationsManager";

// ── Section ────────────────────────────────────────────────────────────────────

interface CredentialsPricingSectionProps {
    register: UseFormRegister<ProfileFormData>;
    errors: FieldErrors<ProfileFormData>;
    existingCertifications: Coach["certifications"];
    onRefreshProfile: () => Promise<void>;
}

export function CredentialsPricingSection({
    register,
    errors,
    existingCertifications,
    onRefreshProfile,
}: CredentialsPricingSectionProps) {
    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7 space-y-6">
            {/* ── Certifications ── */}
            <CertificationsManager
                existingCertifications={existingCertifications}
                onRefreshProfile={onRefreshProfile}
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
        </section>
    );
}