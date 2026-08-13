import { useState, useRef } from "react";
import { Upload, Trash2 } from "lucide-react";
import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { inputClassName, type ProfileFormData } from "@/schemas/profileSchema";
import { CertPreview } from "./CertPreview";

// ── Editable staged certification card (saved together with "Save profile") ──

export function StagedCertCard({
    index,
    register,
    control,
    errors,
    onRemove,
}: {
    index: number;
    register: UseFormRegister<ProfileFormData>;
    control: Control<ProfileFormData>;
    errors: FieldErrors<ProfileFormData>;
    onRemove: () => void;
}) {
    return (
        <div className="p-4 border border-dashed border-brand/40 rounded-xl bg-brand/5 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-muted-foreground">New certification {index + 1}</p>
                <button type="button" onClick={onRemove}
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" /> Remove
                </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">Name *</span>
                    <input className={inputClassName} placeholder="NASM CPT" {...register(`stagedCertifications.${index}.name`)} />
                    {errors.stagedCertifications?.[index]?.name?.message && (
                        <p className="mt-1 text-xs text-destructive">{errors.stagedCertifications?.[index]?.name?.message}</p>
                    )}
                </label>
                <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">Issuer</span>
                    <input className={inputClassName} placeholder="NASM" {...register(`stagedCertifications.${index}.issuer`)} />
                </label>
                <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">Issue date</span>
                    <input className={inputClassName} type="date" {...register(`stagedCertifications.${index}.issueDate`)} />
                </label>
                <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">Expiry date</span>
                    <input className={inputClassName} type="date" {...register(`stagedCertifications.${index}.expiryDate`)} />
                </label>
                <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">Credential URL</span>
                    <input className={inputClassName} type="url" placeholder="https://nasm.org/verify/123" {...register(`stagedCertifications.${index}.credentialUrl`)} />
                </label>
            </div>

            <Controller
                name={`stagedCertifications.${index}.file`}
                control={control}
                render={({ field }) => (
                    <CertFileField
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.stagedCertifications?.[index]?.file?.message}
                    />
                )}
            />
        </div>
    );
}

// ── File picker with inline preview ───────────────────────────────────────────

function CertFileField({
    value,
    onChange,
    error,
}: {
    value: File | null;
    onChange: (file: File | null) => void;
    error?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(() =>
        value && value.type.startsWith("image/") ? URL.createObjectURL(value) : null,
    );

    const clearFile = () => {
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        onChange(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        e.target.value = "";
        if (preview) URL.revokeObjectURL(preview);
        setPreview(file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
        onChange(file);
    };

    return (
        <div>
            <span className="mb-1 block text-xs font-semibold text-muted-foreground">Certificate file *</span>
            <input ref={inputRef} type="file" accept="application/pdf,image/jpeg,image/png" className="hidden" onChange={handleChange} />
            {value ? (
                <>
                    <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-warn/40 bg-warn/10">
                        <span className="text-sm truncate">{value.name}</span>
                        <button type="button" onClick={clearFile}
                            className="text-xs font-semibold text-destructive hover:opacity-80 shrink-0">Clear</button>
                    </div>
                    <CertPreview file={value} localPreview={preview} certName={value.name} />
                    <p className="mt-1.5 text-xs font-semibold text-brand">Will upload when you save your profile.</p>
                </>
            ) : (
                <button type="button" onClick={() => inputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl hover:border-brand/50 hover:bg-brand/5 transition-colors text-sm text-muted-foreground">
                    <Upload className="w-4 h-4" /> Upload PDF, JPG, or PNG
                </button>
            )}
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
    );
}