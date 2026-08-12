import { useState, useEffect, useRef } from "react";
import { Plus, Loader2, Upload } from "lucide-react";
import { toast } from "react-toastify";
import { inputClassName } from "@/schemas/profileSchema";
import { addCertification } from "@/services/coaches";
import { compressImageFile } from "@/lib/image-compress";
import { CertPreview } from "./CertPreview";

interface AddCertFormState {
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    credentialUrl: string;
    file: File | null;
}

const emptyCertForm: AddCertFormState = {
    name: "", issuer: "", issueDate: "", expiryDate: "", credentialUrl: "", file: null,
};

export function AddCertCard({ onAdded }: { onAdded: () => Promise<void> }) {
    const [form, setForm] = useState<AddCertFormState>(emptyCertForm);
    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploadHint, setUploadHint] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!form.file) return;
        let cancelled = false;
        void compressImageFile(form.file).then((compressed) => {
            if (cancelled) return;
            setUploadHint(compressed === form.file ? null : `~${(compressed.size / 1024).toFixed(0)} KB after compression`);
        });
        return () => { cancelled = true; };
    }, [form.file]);

    const set = (field: keyof AddCertFormState) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const clearFile = () => {
        if (localPreview) URL.revokeObjectURL(localPreview);
        setLocalPreview(null);
        setForm((prev) => ({ ...prev, file: null }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        e.target.value = "";
        clearFile();
        if (file) {
            setLocalPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
        }
        setForm((prev) => ({ ...prev, file }));
    };

    const resetForm = () => {
        clearFile();
        setForm(emptyCertForm);
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) { toast.error("Certification name is required."); return; }
        if (!form.file) { toast.error("A certificate file is required."); return; }
        setSaving(true);
        try {
            await addCertification({
                name: form.name.trim(),
                issuer: form.issuer.trim() || undefined,
                issueDate: form.issueDate || undefined,
                expiryDate: form.expiryDate || undefined,
                credentialUrl: form.credentialUrl.trim() || undefined,
                file: form.file,
            });
            resetForm();
            await onAdded();
            toast.success("Certification added.");
        } catch {
            toast.error("Could not add certification. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 border-2 border-dashed border-border rounded-xl space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">New certification</p>
            <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">Name *</span>
                    <input className={inputClassName} placeholder="NASM CPT" value={form.name} onChange={set("name")} />
                </label>
                <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">Issuer</span>
                    <input className={inputClassName} placeholder="NASM" value={form.issuer} onChange={set("issuer")} />
                </label>
                <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">Issue date</span>
                    <input className={inputClassName} type="date" value={form.issueDate} onChange={set("issueDate")} />
                </label>
                <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">Expiry date</span>
                    <input className={inputClassName} type="date" value={form.expiryDate} onChange={set("expiryDate")} />
                </label>
                <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">Credential URL</span>
                    <input className={inputClassName} type="url" placeholder="https://nasm.org/verify/123" value={form.credentialUrl} onChange={set("credentialUrl")} />
                </label>
                <div className="sm:col-span-2">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">Certificate file *</span>
                    <input ref={fileInputRef} type="file" accept="application/pdf,image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
                    {form.file ? (
                        <>
                            <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-warn/40 bg-warn/10">
                                <span className="text-sm truncate">{form.file.name}</span>
                                <button type="button" onClick={clearFile}
                                    className="text-xs font-semibold text-destructive hover:opacity-80 shrink-0">Remove</button>
                            </div>
                            <p className="mt-1.5 text-xs font-semibold text-warn">
                                Not saved yet — click "Add certification" to upload
                            </p>
                            {uploadHint && <p className="mt-1 text-xs text-muted-foreground">{uploadHint}</p>}
                        </>
                    ) : (
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl hover:border-brand/50 hover:bg-brand/5 transition-colors text-sm text-muted-foreground">
                            <Upload className="w-4 h-4" /> Upload PDF, JPG, or PNG
                        </button>
                    )}
                    <CertPreview file={form.file} localPreview={localPreview} certName={form.name || "Certificate"} />
                </div>
            </div>
            <div className="flex justify-end pt-1">
                <button type="button" onClick={() => void handleSubmit()} disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-ink text-ink-foreground hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Plus className="w-4 h-4" /> Add certification</>}
                </button>
            </div>
        </div>
    );
}