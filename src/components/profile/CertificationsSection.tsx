import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { inputClassName, type ProfileFormData } from "../../schemas/profileSchema";

interface CertificationsSectionProps {
    control: Control<ProfileFormData>;
    register: UseFormRegister<ProfileFormData>;
    errors: FieldErrors<ProfileFormData>;
}

export function CertificationsSection({ control, register, errors }: CertificationsSectionProps) {
    const { fields, append, remove } = useFieldArray({ control, name: "certifications" });

    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold">Certifications</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Add credentials your clients should know about.</p>
                </div>
                <button
                    type="button"
                    onClick={() => append({ name: "", issuer: "", year: "", credentialUrl: "" })}
                    className="cursor-pointer z-1 inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold transition border rounded-xl border-border hover:bg-muted"
                >
                    <Plus className="w-4 h-4" /> Add certification
                </button>
            </div>

            {fields.length === 0 ? (
                <p className="px-4 py-3 mt-5 text-sm rounded-xl bg-muted text-muted-foreground">No certifications added yet.</p>
            ) : (
                <div className="mt-5 space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-xl border-border">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-semibold">Certification {index + 1}</p>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="cursor-pointer inline-flex items-center gap-1 text-sm font-semibold text-destructive hover:opacity-80"
                                >
                                    <Trash2 className="w-4 h-4" /> Remove
                                </button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Name</span>
                                    <input className={inputClassName} placeholder="Certified Strength Coach" {...register(`certifications.${index}.name`)} />
                                    {errors.certifications?.[index]?.name && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].name.message}</p>}
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Issuer</span>
                                    <input className={inputClassName} placeholder="Issuing organization" {...register(`certifications.${index}.issuer`)} />
                                    {errors.certifications?.[index]?.issuer && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].issuer.message}</p>}
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Year</span>
                                    <input className={inputClassName} type="number" min="1900" max="2099" placeholder="2024" {...register(`certifications.${index}.year`)} />
                                    {errors.certifications?.[index]?.year && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].year.message}</p>}
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Credential URL</span>
                                    <input className={inputClassName} type="url" placeholder="https://example.com/certificate" {...register(`certifications.${index}.credentialUrl`)} />
                                    {errors.certifications?.[index]?.credentialUrl && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].credentialUrl.message}</p>}
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}