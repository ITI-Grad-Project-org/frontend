import { useState, useEffect, useRef } from "react";
import { useFieldArray, Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Trash2, Loader2, Upload } from "lucide-react";
import { inputClassName, type ProfileFormData } from "../../schemas/profileSchema";
import { MediaPreviewModal } from "@/components/ui/MediaPreviewModal";

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
            <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />
            <button type="button" onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold transition border rounded-xl border-border hover:bg-muted">
                <Upload className="w-4 h-4" /> Add photos
            </button>
        </>
    );
}

// ── Existing photo row ─────────────────────────────────────────────────────────

function ExistingPhotoRow({ url, index, onRemove }: { url: string; index: number; onRemove: () => Promise<void> }) {
    const [removing, setRemoving] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
            <button type="button" onClick={() => setPreviewOpen(true)} className="shrink-0 group">
                <img src={url} alt={`Transformation ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border border-border transition-opacity group-hover:opacity-80 cursor-zoom-in" />
            </button>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Photo {index + 1}</p>
                <button type="button" onClick={() => setPreviewOpen(true)}
                    className="text-xs text-brand hover:underline">
                    Click to preview
                </button>
            </div>
            <button type="button" disabled={removing}
                onClick={async () => { setRemoving(true); try { await onRemove(); } finally { setRemoving(false); } }}
                className="shrink-0 inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold text-destructive rounded-xl border border-destructive/20 hover:bg-destructive/10 disabled:opacity-50">
                {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{removing ? "Removing…" : "Remove"}</span>
            </button>
            {previewOpen && (
                <MediaPreviewModal src={url} alt={`Transformation photo ${index + 1}`} onClose={() => setPreviewOpen(false)} />
            )}
        </div>
    );
}

// ── New photo uploader ─────────────────────────────────────────────────────────

function NewPhotoUploader({ index, file, onChange }: { index: number; file: File | null; onChange: (f: File | null) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        if (!file) { setPreview(null); return; }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null;
        e.target.value = "";
        onChange(selected);
    };

    return (
        <div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
            {file && preview ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
                    <button type="button" onClick={() => setPreviewOpen(true)} className="shrink-0 group">
                        <img src={preview} alt={`New photo ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-border transition-opacity group-hover:opacity-80 cursor-zoom-in" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · Will upload on save</p>
                    </div>
                    <button type="button" onClick={() => onChange(null)} className="text-xs font-semibold text-destructive hover:opacity-80 shrink-0">Remove</button>
                    {previewOpen && (
                        <MediaPreviewModal src={preview} alt={file.name} onClose={() => setPreviewOpen(false)} />
                    )}
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

// ── Section ────────────────────────────────────────────────────────────────────

interface ClientProofSectionProps {
    control: Control<ProfileFormData>;
    register: UseFormRegister<ProfileFormData>;
    errors: FieldErrors<ProfileFormData>;
    onClearTransformationPhoto: (url: string) => Promise<void>;
}

export function ClientProofSection({
    control,
    register,
    errors,
    onClearTransformationPhoto,
}: ClientProofSectionProps) {
    const transformationPhotos = useFieldArray({ control, name: "transformationPhotos" });

    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7 space-y-6">
            <div>
                <h2 className="text-lg font-bold">Client proof</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Transformation photos and featured reviews visible on your public profile.
                </p>
            </div>

            {/* ── Transformation photos ── */}
            <div>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold">Transformation photos</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Before/after photos of your clients' transformations.
                        </p>
                    </div>
                    <MultiPhotoButton
                        onFiles={(files) =>
                            files.forEach((file) =>
                                transformationPhotos.append({ url: "", file, key: "" })
                            )
                        }
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

            {/* ── Featured review ── */}
            <div>
                <h3 className="text-sm font-semibold mb-3">Featured review</h3>
                <label className="block">
                    <textarea
                        className={`${inputClassName} min-h-24 resize-y`}
                        placeholder='"Lost 12kg in 5 months — Sara A.'
                        {...register("featuredReviews")}
                    />
                    {errors.featuredReviews && (
                        <p className="mt-1 text-xs text-destructive">{errors.featuredReviews.message}</p>
                    )}
                    <p className="mt-1.5 text-xs text-muted-foreground">
                        A short quote from a client that appears on your public profile.
                    </p>
                </label>
            </div>
        </section>
    );
}
