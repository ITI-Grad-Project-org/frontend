import { useFieldArray, Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { useState, useEffect } from "react";
import { Plus, Trash2, FileText, ExternalLink, ImageIcon } from "lucide-react";
import { inputClassName, type ProfileFormData } from "../../schemas/profileSchema";
import { FileUploadField } from "./FileUploadField";

// ── Cert file preview ──────────────────────────────────────────────────────────

interface CertPreviewProps {
    /** Newly selected File (not yet uploaded) */
    file?: File | null;
    /** Already-uploaded URL from the server */
    fileUrl?: string;
}

function CertPreview({ file, fileUrl }: CertPreviewProps) {
    const [localPreview, setLocalPreview] = useState<string | null>(null);

    // Generate a local object-URL when a new image file is selected
    useEffect(() => {
        if (!file) { setLocalPreview(null); return; }
        if (!file.type.startsWith("image/")) { setLocalPreview(null); return; }

        const url = URL.createObjectURL(file);
        setLocalPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const isPdf = (src: string) =>
        src.toLowerCase().endsWith(".pdf") || src.includes("application/pdf");

    // ── New file selected locally ──
    if (file) {
        if (file.type.startsWith("image/") && localPreview) {
            return (
                <div className="sm:col-span-2 mt-1">
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Preview</p>
                    <img
                        src={localPreview}
                        alt="Certificate preview"
                        className="max-h-48 w-full object-contain rounded-xl border border-border bg-muted/30"
                    />
                </div>
            );
        }
        // PDF or other — just show file info (already shown by FileUploadField attachment)
        return null;
    }

    // ── Existing server URL ──
    if (fileUrl) {
        if (isPdf(fileUrl)) {
            return (
                <div className="sm:col-span-2 mt-1">
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Certificate file</p>
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-muted/30 hover:bg-muted transition-colors text-sm font-medium text-foreground"
                    >
                        <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                        <span className="truncate max-w-xs">View certificate PDF</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 text-muted-foreground ml-auto" />
                    </a>
                </div>
            );
        }

        // Image URL
        return (
            <div className="sm:col-span-2 mt-1">
                <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Certificate preview</p>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block group">
                    <img
                        src={fileUrl}
                        alt="Certificate"
                        className="max-h-48 w-full object-contain rounded-xl border border-border bg-muted/30 transition-opacity group-hover:opacity-80"
                    />
                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Click to open full size
                    </p>
                </a>
            </div>
        );
    }

    return null;
}

// ── Section ────────────────────────────────────────────────────────────────────

interface CertificationsSectionProps {
    control: Control<ProfileFormData>;
    register: UseFormRegister<ProfileFormData>;
    errors: FieldErrors<ProfileFormData>;
    onClearTransformationPhoto?: (url: string) => Promise<void>;
    onClearCertificateFile?: (certIndex: number, fileUrl: string) => Promise<void>;
    /** S3-only delete — used when removing the whole cert card */
    onDeleteCertFileFromStorage?: (fileUrl: string) => Promise<void>;
}

export function CertificationsSection({ control, register, errors, onClearTransformationPhoto, onClearCertificateFile, onDeleteCertFileFromStorage }: CertificationsSectionProps) {
    const certifications = useFieldArray({ control, name: "certifications" });
    const transformationPhotos = useFieldArray({ control, name: "transformationPhotos" });

    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7">
            {/* ── Certifications ── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold">Credentials & pricing</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Certificates, proof links, coaching rates, and client-facing highlights.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() =>
                        certifications.append({
                            name: "",
                            issuer: "",
                            issueDate: "",
                            expiryDate: "",
                            fileUrl: "",
                            credentialUrl: "",
                            file: null,
                            fileKey: "",
                        })
                    }
                    className="cursor-pointer z-1 inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold transition border rounded-xl border-border hover:bg-muted"
                >
                    <Plus className="w-4 h-4" /> Add certification
                </button>
            </div>

            {certifications.fields.length === 0 ? (
                <p className="px-4 py-3 mt-6 text-sm rounded-xl bg-muted text-muted-foreground">
                    No certifications added yet.
                </p>
            ) : (
                <div className="mt-6 space-y-4">
                    {certifications.fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-xl border-border">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-semibold">Certification {index + 1}</p>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const fileUrl = certifications.fields[index]?.fileUrl;
                                        // If this cert has an uploaded file, delete it from S3 first
                                        if (fileUrl) {
                                            await onDeleteCertFileFromStorage?.(fileUrl);
                                        }
                                        certifications.remove(index);
                                    }}
                                    className="cursor-pointer inline-flex items-center gap-1 text-sm font-semibold text-destructive hover:opacity-80"
                                >
                                    <Trash2 className="w-4 h-4" /> Remove
                                </button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block sm:col-span-2">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Name</span>
                                    <input
                                        className={inputClassName}
                                        placeholder="NASM CPT"
                                        {...register(`certifications.${index}.name`)}
                                    />
                                    {errors.certifications?.[index]?.name && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.certifications[index].name.message}
                                        </p>
                                    )}
                                </label>

                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Issuer</span>
                                    <input
                                        className={inputClassName}
                                        placeholder="NASM"
                                        {...register(`certifications.${index}.issuer`)}
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Issue date</span>
                                    <input
                                        className={inputClassName}
                                        type="date"
                                        {...register(`certifications.${index}.issueDate`)}
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Expiry date</span>
                                    <input
                                        className={inputClassName}
                                        type="date"
                                        {...register(`certifications.${index}.expiryDate`)}
                                    />
                                </label>

                                <label className="block sm:col-span-2">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Credential URL</span>
                                    <input
                                        className={inputClassName}
                                        type="url"
                                        placeholder="https://nasm.org/verify/123"
                                        {...register(`certifications.${index}.credentialUrl`)}
                                    />
                                </label>

                                {/* Certificate file upload */}
                                <div className="sm:col-span-2">
                                    <Controller
                                        name={`certifications.${index}.file`}
                                        control={control}
                                        render={({ field: fileField }) => (
                                            <Controller
                                                name={`certifications.${index}.fileUrl`}
                                                control={control}
                                                render={({ field: urlField }) => (
                                                    <>
                                                        <FileUploadField
                                                            label="Certificate File"
                                                            accept="application/pdf,image/jpeg,image/png"
                                                            type="document"
                                                            file={fileField.value}
                                                            existingUrl={urlField.value}
                                                            onChange={fileField.onChange}
                                                            onDelete={async () => {
                                                                const currentUrl = urlField.value;
                                                                if (currentUrl && onClearCertificateFile) {
                                                                    await onClearCertificateFile(index, currentUrl);
                                                                } else {
                                                                    fileField.onChange(null);
                                                                }
                                                            }}
                                                            description="Upload PDF, JPG, or PNG"
                                                        />
                                                        <CertPreview
                                                            file={fileField.value}
                                                            fileUrl={urlField.value}
                                                        />
                                                    </>
                                                )}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Other fields ── */}
            <div className="grid gap-4 mt-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Portfolio URL</span>
                    <input
                        className={inputClassName}
                        type="url"
                        placeholder="https://janesmith.coach"
                        {...register("portfolioUrl")}
                    />
                    {errors.portfolioUrl && (
                        <p className="mt-1 text-xs text-destructive">{errors.portfolioUrl.message}</p>
                    )}
                </label>

                <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Price from</span>
                    <input className={inputClassName} type="number" min="0" placeholder="120" {...register("priceFrom")} />
                    {errors.priceFrom && (
                        <p className="mt-1 text-xs text-destructive">{errors.priceFrom.message}</p>
                    )}
                </label>

                <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Price to</span>
                    <input className={inputClassName} type="number" min="0" placeholder="320" {...register("priceTo")} />
                    {errors.priceTo && (
                        <p className="mt-1 text-xs text-destructive">{errors.priceTo.message}</p>
                    )}
                </label>

                <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Featured review</span>
                    <textarea
                        className={`${inputClassName} min-h-24 resize-y`}
                        placeholder='"Lost 12kg in 5 months" — Sara A.'
                        {...register("featuredReviews")}
                    />
                    {errors.featuredReviews && (
                        <p className="mt-1 text-xs text-destructive">{errors.featuredReviews.message}</p>
                    )}
                </label>
            </div>

            {/* ── Transformation photos ── */}
            <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold">Transformation photos</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Upload before/after photos of your clients' transformations.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => transformationPhotos.append({ url: "", file: null, key: "" })}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold transition border rounded-xl border-border hover:bg-muted"
                    >
                        <Plus className="w-4 h-4" /> Add photo
                    </button>
                </div>

                <div className="mt-4 space-y-3">
                    {transformationPhotos.fields.length === 0 ? (
                        <p className="px-4 py-3 text-sm rounded-xl bg-muted text-muted-foreground">
                            No transformation photos added yet.
                        </p>
                    ) : (
                        transformationPhotos.fields.map((field, index) => (
                            <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                                <Controller
                                    name={`transformationPhotos.${index}.file`}
                                    control={control}
                                    render={({ field: fileField }) => (
                                        <Controller
                                            name={`transformationPhotos.${index}.url`}
                                            control={control}
                                            render={({ field: urlField }) => (
                                                <FileUploadField
                                                    label={`Transformation Photo ${index + 1}`}
                                                    accept="image/*"
                                                    type="image"
                                                    file={fileField.value}
                                                    existingUrl={urlField.value}
                                                    onChange={fileField.onChange}
                                                    onDelete={async () => {
                                                        const currentUrl = urlField.value;
                                                        if (currentUrl) {
                                                            // Delegates to the hook: deletes from S3
                                                            // + patches the backend + refreshes the form
                                                            await onClearTransformationPhoto?.(currentUrl);
                                                        } else {
                                                            // No server URL yet — just clear the local preview
                                                            fileField.onChange(null);
                                                        }
                                                    }}
                                                    error={errors.transformationPhotos?.[index]?.url?.message}
                                                />
                                            )}
                                        />
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const url = transformationPhotos.fields[index]?.url;
                                        if (url) {
                                            // Already on server — delete from S3 + backend
                                            await onClearTransformationPhoto?.(url);
                                        } else {
                                            // Not yet saved — just remove from local form state
                                            transformationPhotos.remove(index);
                                        }
                                    }}
                                    className="inline-flex items-center gap-1 self-end px-3 py-3 text-sm font-semibold text-destructive rounded-xl border border-destructive/20 hover:bg-destructive/10 h-fit"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Remove</span>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
