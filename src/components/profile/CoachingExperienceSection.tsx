import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Plus } from "lucide-react";
import { inputClassName, specialtyOptions, specialtyLabel, type ProfileFormData } from "../../schemas/profileSchema";

interface CoachingExperienceProps {
    register: UseFormRegister<ProfileFormData>;
    errors: FieldErrors<ProfileFormData>;
    specialties: string[];
    onAddSpecialty: (specialty: string) => void;
    onRemoveSpecialty: (specialty: string) => void;
}

export function CoachingExperienceSection({
    register,
    errors,
    specialties,
    onAddSpecialty,
    onRemoveSpecialty,
}: CoachingExperienceProps) {
    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7">
            <h2 className="text-lg font-bold">Coaching experience</h2>
            <div className="grid gap-4 mt-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Bio</span>
                    <textarea className={`${inputClassName} min-h-28 resize-y`} placeholder="Share the coaching style clients can expect from you." {...register("bio")} />
                    {errors.bio && <p className="mt-1 text-xs text-destructive">{errors.bio.message}</p>}
                </label>

                <div className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Specialties</span>
                    <div className="px-3 py-3 transition-colors border-2 rounded-2xl border-border bg-card focus-within:border-brand">
                        <div className="flex flex-wrap gap-2">
                            {specialties.map((specialty) => (
                                <button
                                    key={specialty}
                                    type="button"
                                    onClick={() => onRemoveSpecialty(specialty)}
                                    className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-destructive/10 hover:text-destructive"
                                    aria-label={`Remove specialty ${specialtyLabel(specialty)}`}
                                >
                                    <span>{specialtyLabel(specialty)}</span>
                                    <span aria-hidden className="text-base leading-none">×</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {specialtyOptions
                                .filter((item) => !specialties.includes(item.value))
                                .map((item) => (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() => onAddSpecialty(item.value)}
                                        className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-brand hover:text-foreground"
                                        aria-label={`Add specialty ${item.label}`}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                        </div>
                    </div>
                    <span className="block mt-1 text-xs text-muted-foreground">Pick from the supported coaching specialties. You can add any number of them.</span>
                </div>

                <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Years of experience</span>
                    <input className={inputClassName} type="number" min="0" max="99" placeholder="5" {...register("yearsExperience")} />
                    {errors.yearsExperience && <p className="mt-1 text-xs text-destructive">{errors.yearsExperience.message}</p>}
                </label>
            </div>
        </section>
    );
}