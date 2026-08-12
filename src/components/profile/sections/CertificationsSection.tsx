import { useState, useRef } from "react";
import { useFieldArray, Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Trash2, ExternalLink, Upload, Loader2 } from "lucide-react";
import { inputClassName, type ProfileFormData } from "../../../schemas/profileSchema";
import type { Coach } from "@/types/auth";
import { CertificationsManager } from "../certifications/CertificationsManager";

// ── Multi photo button ─────────────────────────────────────────────────────────

function MultiPhotoButton({ onFiles }: { onFiles: (files: File[]) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = "";
        if (files.length > 0) onFiles(files);
    };

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleChange}
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold transition border rounded-xl border-border hover:bg-muted"
            >
                <Upload className="w-4 h-4" /> Add photos
            </button>
        </>
    );
}

// ── Section ────────────────────────────────────────────────────────────────────

interface CertificationsSectionProps {
    control: Control<ProfileFormData>;
    register: UseFormRegister<ProfileFormData>;
    errors: FieldErrors<ProfileFormData>;
    /** Existing certifications from the server */
    existingCertifications: Coach["certifications"];
    onClearTransformationPhoto: (url: string) => Promise<void>;
    onRefreshProfile: () => Promise<void>;
}

export function CertificationsSection({
    control,
    register,
    errors,
    existingCertifications,
    onClearTransformationPhoto,
    onRefreshProfile,
}: CertificationsSectionProps) {
    const transformationPhotos = useFieldArray({ control, name: "transformationPhotos" });

    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7 space-y-6">

            {/* ── Certifications ── */}
            <CertificationsManager
                existingCertifications={existingCertifications}
                onRefreshProfile={onRefreshProfile}
                description="Certificates, proof links, coaching rates, and client-facing highlights."
            />

            {/* ── Other fields ── */}
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
                <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Featured review</span>
                    <textarea className={`${inputClassName} min-h-24 resize-y`} placeholder='"Lost 12kg in 5 months" — Sara A.' {...register("featuredReviews")} />
                    {errors.featuredReviews && <p className="mt-1 text-xs text-destructive">{errors.featuredReviews.message}</p>}
                </label>
            </div>

            {/* ── Transformation photos ── */}
            <div>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold">Transformation photos</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Upload before/after photos of your clients' transformations.
                        </p>
                    </div>
                    <MultiPhotoButton
                        onFiles={(files) => {
                            files.forEach((file) =>
                                transformationPhotos.append({ url: "", file, key: "" })
                            );
                        }}
                    />
                </div>

                <div className="mt-4 space-y-3">
                    {transformationPhotos.fields.length === 0 ? (
                        <p className="px-4 py-3 text-sm rounded-xl bg-muted text-muted-foreground">
                            No transformation photos added yet.
                        </p>
                    ) : (
                        transformationPhotos.fields.map((field, index) => {
                            const existingUrl = field.url;

                            // ── Existing server photo ──
                            if (existingUrl) {
                                return (
                                    <ExistingPhotoRow
                                        key={field.id}
                                        url={existingUrl}
                                        index={index}
                                        onRemove={async () => {
                                            await onClearTransformationPhoto(existingUrl);
                                        }}
                                    />
                                );
                            }

                            // ── New local photo (not yet uploaded) ──
                            return (
                                <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                                    <Controller
                                        name={`transformationPhotos.${index}.file`}
                                        control={control}
                                        render={({ field: fileField }) => (
                                            <NewPhotoUploader
                                                index={index}
                                                file={fileField.value ?? null}
                                                onChange={fileField.onChange}
                                            />
                                        )}
                                    />
                                    <button type="button"
                                        onClick={() => transformationPhotos.remove(index)}
                                        className="inline-flex items-center gap-1 self-end px-3 py-3 text-sm font-semibold text-destructive rounded-xl border border-destructive/20 hover:bg-destructive/10 h-fit">
                                        <Trash2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">Remove</span>
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
}

// ── Existing photo row ─────────────────────────────────────────────────────────

function ExistingPhotoRow({ url, index, onRemove }: { url: string; index: number; onRemove: () => Promise<void> }) {
    const [removing, setRemoving] = useState(false);

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
            <img src={url} alt={`Transformation ${index + 1}`}
                className="w-16 h-16 object-cover rounded-lg shrink-0 border border-border" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Photo {index + 1}</p>
                <a href={url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-brand hover:underline inline-flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> View full size
                </a>
            </div>
            <button type="button" disabled={removing}
                onClick={async () => { setRemoving(true); try { await onRemove(); } finally { setRemoving(false); } }}
                className="shrink-0 inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold text-destructive rounded-xl border border-destructive/20 hover:bg-destructive/10 disabled:opacity-50">
                {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{removing ? "Removing…" : "Remove"}</span>
            </button>
        </div>
    );
}

// ── New photo uploader ─────────────────────────────────────────────────────────

function NewPhotoUploader({ index, file, onChange }: { index: number; file: File | null; onChange: (f: File | null) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const clearFile = () => {
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        onChange(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null;
        e.target.value = "";
        if (preview) URL.revokeObjectURL(preview);
        setPreview(selected ? URL.createObjectURL(selected) : null);
        onChange(selected);
    };

    return (
        <div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
            {file && preview ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
                    <img src={preview} alt={`New photo ${index + 1}`} className="w-16 h-16 object-cover rounded-lg shrink-0 border border-border" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · Will upload on save</p>
                    </div>
                    <button type="button" onClick={clearFile} className="text-xs font-semibold text-destructive hover:opacity-80 shrink-0">Remove</button>
                </div>
            ) : (
                <button type="button" onClick={() => inputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-border rounded-xl hover:border-brand/50 hover:bg-brand/5 transition-colors text-sm text-muted-foreground">
                    <Upload className="w-4 h-4" /> Upload transformation photo {index + 1}
                </button>
            )}
        </div>
    );
}