import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { inputClassName, type ProfileFormData } from "../../schemas/profileSchema";

interface CertificationsSectionProps {
    control: Control<ProfileFormData>;
    register: UseFormRegister<ProfileFormData>;
    errors: FieldErrors<ProfileFormData>;
}

export function CertificationsSection({ control, register, errors }: CertificationsSectionProps) {
    const certifications = useFieldArray({ control, name: "certifications" });
    const transformationPhotos = useFieldArray({ control, name: "transformationPhotos" });

    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold">Credentials & pricing</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Certificates, proof links, coaching rates, and client-facing highlights.</p>
                </div>
                <button
                    type="button"
                    onClick={() => certifications.append({ name: "", issuer: "", issueDate: "", expiryDate: "", fileUrl: "", credentialUrl: "" })}
                    className="cursor-pointer z-1 inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold transition border rounded-xl border-border hover:bg-muted"
                >
                    <Plus className="w-4 h-4" /> Add certification
                </button>
            </div>
            {certifications.fields.length === 0 ? (
                <p className="px-4 py-3 mt-6 text-sm rounded-xl bg-muted text-muted-foreground">No certifications added yet.</p>
            ) : (
                <div className="mt-6 space-y-4">
                    {certifications.fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-xl border-border">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-semibold">Certification {index + 1}</p>
                                <button
                                    type="button"
                                    onClick={() => certifications.remove(index)}
                                    className="cursor-pointer inline-flex items-center gap-1 text-sm font-semibold text-destructive hover:opacity-80"
                                >
                                    <Trash2 className="w-4 h-4" /> Remove
                                </button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block sm:col-span-2">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Name</span>
                                    <input className={inputClassName} placeholder="NASM CPT" {...register(`certifications.${index}.name`)} />
                                    {errors.certifications?.[index]?.name && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].name.message}</p>}
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Issuer</span>
                                    <input className={inputClassName} placeholder="NASM" {...register(`certifications.${index}.issuer`)} />
                                    {errors.certifications?.[index]?.issuer && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].issuer.message}</p>}
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Issue date</span>
                                    <input className={inputClassName} type="date" {...register(`certifications.${index}.issueDate`)} />
                                    {errors.certifications?.[index]?.issueDate && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].issueDate.message}</p>}
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Expiry date</span>
                                    <input className={inputClassName} type="date" {...register(`certifications.${index}.expiryDate`)} />
                                    {errors.certifications?.[index]?.expiryDate && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].expiryDate.message}</p>}
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">File URL</span>
                                    <input className={inputClassName} type="url" placeholder="https://cdn.example.com/certs/nasm.pdf" {...register(`certifications.${index}.fileUrl`)} />
                                    {errors.certifications?.[index]?.fileUrl && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].fileUrl.message}</p>}
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Credential URL</span>
                                    <input className={inputClassName} type="url" placeholder="https://nasm.org/verify/123" {...register(`certifications.${index}.credentialUrl`)} />
                                    {errors.certifications?.[index]?.credentialUrl && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].credentialUrl.message}</p>}
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid gap-4 mt-5 sm:grid-cols-2">
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

                <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Featured review</span>
                    <textarea className={`${inputClassName} min-h-24 resize-y`} placeholder='“Lost 12kg in 5 months” — Sara A.' {...register("featuredReviews")} />
                    {errors.featuredReviews && <p className="mt-1 text-xs text-destructive">{errors.featuredReviews.message}</p>}
                </label>
            </div>

            <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold">Transformation photos</h3>
                        <p className="mt-1 text-xs text-muted-foreground">Add one URL per image.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => transformationPhotos.append({ url: "" })}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold transition border rounded-xl border-border hover:bg-muted"
                    >
                        <Plus className="w-4 h-4" /> Add photo
                    </button>
                </div>
                <div className="mt-4 space-y-3">
                    {transformationPhotos.fields.length === 0 ? (
                        <p className="px-4 py-3 text-sm rounded-xl bg-muted text-muted-foreground">No transformation photos added yet.</p>
                    ) : (
                        transformationPhotos.fields.map((field, index) => (
                            <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                                <div>
                                    <input
                                        className={inputClassName}
                                        type="url"
                                        placeholder="https://cdn.example.com/transformations/1.jpg"
                                        {...register(`transformationPhotos.${index}.url`)}
                                    />
                                    {errors.transformationPhotos?.[index]?.url && (
                                        <p className="mt-1 text-xs text-destructive">{errors.transformationPhotos[index]?.url?.message}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => transformationPhotos.remove(index)}
                                    className="inline-flex items-center gap-1 self-start px-3 py-3 text-sm font-semibold text-destructive rounded-xl border border-destructive/20 hover:bg-destructive/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>


        </section>
    );
}
