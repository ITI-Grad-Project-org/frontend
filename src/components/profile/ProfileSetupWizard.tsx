import { useState } from "react";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import type { FieldErrors, UseFormReturn } from "react-hook-form";
import { CertificationsSection } from "./CertificationsSection";
import { CoachingExperienceSection } from "./CoachingExperienceSection";
import { PersonalDetailsSection } from "./PersonalDetailsSection";
import { ProfileStepper } from "./ProfileStepper";
import type { ProfileFormData } from "../../schemas/profileSchema";

interface ProfileSetupWizardProps {
    form: UseFormReturn<ProfileFormData>;
    specialties: string[];
    onAddSpecialty: (specialty: string) => void;
    onRemoveSpecialty: (specialty: string) => void;
    onSubmit: () => void | Promise<void>;
}

const setupSteps = [
    {
        title: "Personal details",
        description: "Your identity and contact information.",
        fields: ["firstName", "lastName", "phone", "age", "gender", "location", "avatarUrl"],
    },
    {
        title: "Coaching profile",
        description: "Your experience, specialties, and availability.",
        fields: [
            "bio",
            "careerExperience",
            "specialties",
            "yearsExperience",
            "offlineAvailability",
            "availabilityWeekdayStart",
            "availabilityWeekdayEnd",
            "availabilityStartHour",
            "availabilityEndHour",
        ],
    },
    {
        title: "Credentials",
        description: "Pricing, certifications, and proof links.",
        fields: ["certifications", "portfolioUrl", "priceFrom", "priceTo", "featuredReviews", "transformationPhotos"],
    },
] as const;

export function ProfileSetupWizard({
    form,
    specialties,
    onAddSpecialty,
    onRemoveSpecialty,
    onSubmit,
}: ProfileSetupWizardProps) {
    const [activeStep, setActiveStep] = useState(0);

    const {
        register,
        control,
        trigger,
        formState: { errors, isSubmitting },
    } = form;

    const isFirstStep = activeStep === 0;
    const isLastStep = activeStep === setupSteps.length - 1;

    const goNext = async () => {
        const isStepValid = await trigger(setupSteps[activeStep].fields as never, { shouldFocus: true });

        if (isStepValid) {
            setActiveStep((current) => Math.min(current + 1, setupSteps.length - 1));
        }
    };

    const goBack = () => {
        setActiveStep((current) => Math.max(current - 1, 0));
    };

    const handleFinalSubmit = () => {
        void onSubmit();
    };

    return (
        <div className="space-y-6">
            <ProfileStepper steps={setupSteps} activeStep={activeStep} />

            <form
                className="space-y-6"
                onSubmit={(event) => {
                    event.preventDefault();
                }}
            >
                <input type="hidden" {...register("specialties")} />

                {activeStep === 0 && <PersonalDetailsSection register={register} control={control} errors={errors as FieldErrors<ProfileFormData>} />}

                {activeStep === 1 && (
                    <CoachingExperienceSection
                        register={register}
                        errors={errors as FieldErrors<ProfileFormData>}
                        specialties={specialties}
                        onAddSpecialty={onAddSpecialty}
                        onRemoveSpecialty={onRemoveSpecialty}
                    />
                )}

                {activeStep === 2 && <CertificationsSection control={control} register={register} errors={errors as FieldErrors<ProfileFormData>} />}

                <div className="flex flex-wrap items-center justify-between gap-4 pb-8">
                    <button
                        type="button"
                        onClick={goBack}
                        disabled={isFirstStep || isSubmitting}
                        className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>

                    <div className="flex flex-wrap items-center gap-3">
                        {!isLastStep ? (
                            <button
                                type="button"
                                onClick={goNext}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Next
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleFinalSubmit}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save className="h-4 w-4" />
                                {isSubmitting ? "Saving…" : "Complete setup"}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
