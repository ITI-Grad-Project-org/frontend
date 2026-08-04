import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, FileText, ImageIcon, ExternalLink, Loader2, Upload } from "lucide-react";
import { toast } from "react-toastify";
import { inputClassName, type ProfileFormData } from "../../schemas/profileSchema";
import { addCertification, removeCertification } from "@/services/coaches";
import type { Coach } from "@/types/auth";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { MediaPreviewModal } from "@/components/ui/MediaPreviewModal";

// ── Cert file preview ──────────────────────────────────────────────────────────

function CertPreview({ file, fileUrl, certName }: { file?: File | null; fileUrl?: string; certName?: string }) {
    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        if (!file || !file.type.startsWith("image/")) { setLocalPreview(null); return; }
        const url = URL.createObjectURL(file);
        setLocalPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    // New local image file — show inline preview, click to enlarge
    if (file && file.type.startsWith("image/") && localPreview) {
        return (
            <div className="mt-2">
                <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Preview</p>
                <button type="button" onClick={() => setPreviewOpen(true)} className="block w-full group">
                    <img src={localPreview} alt="Certificate preview"
                        className="max-h-48 w-full object-contain rounded-xl border border-border bg-muted/30 transition-opacity group-hover:opacity-80 cursor-zoom-in" />
                </button>
                {previewOpen && (
                    <MediaPreviewModal src={localPreview} alt={file.name} onClose={() => setPreviewOpen(false)} />
                )}
            </div>
        );
    }

    // Existing server file
    if (fileUrl) {
        const isPdf = fileUrl.toLowerCase().endsWith(".pdf");
        return (
            <div className="mt-2">
                <button type="button" onClick={() => setPreviewOpen(true)}
                    className={isPdf
                        ? "inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-muted/30 hover:bg-muted transition-colors text-sm font-medium text-foreground w-full"
                        : "block w-full group"
                    }
                >
                    {isPdf ? (
                        <>
                            <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">View certificate PDF</span>
                        </>
                    ) : (
                        <>
                            <img src={fileUrl} alt={certName ?? "Certificate"}
                                className="max-h-48 w-full object-contain rounded-xl border border-border bg-muted/30 transition-opacity group-hover:opacity-80 cursor-zoom-in" />
                            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> Click to preview
                            </p>
                        </>
                    )}
                </button>
                {previewOpen && (
                    <MediaPreviewModal
                        src={fileUrl}
                        alt={certName ?? (isPdf ? "Certificate PDF" : "Certificate")}
                        onClose={() => setPreviewOpen(false)}
                    />
                )}
            </div>
        );
    }

    return null;
}

// ── Add certification form ─────────────────────────────────────────────────────

interface AddCertFormState {
    name: string; issuer: string; issueDate: string;
    expiryDate: string; credentialUrl: string; file: File | null;
}
const emptyCertForm: AddCertFormState = {
    name: "", issuer: "", issueDate: "", expiryDate: "", credentialUrl: "", file: null,
};

function AddCertCard({ onAdded }: { onAdded: () => Promise<void> }) {
    const [form, setForm] = useState<AddCertFormState>(emptyCertForm);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const set = (field: keyof AddCertFormState) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        e.target.value = "";
        setForm((prev) => ({ ...prev, file }));
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
            setForm(emptyCertForm);
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
                        <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-border bg-muted/30">
                            <span className="text-sm truncate">{form.file.name}</span>
                            <button type="button" onClick={() => setForm((p) => ({ ...p, file: null }))}
                                className="text-xs font-semibold text-destructive hover:opacity-80 shrink-0">Remove</button>
                        </div>
                    ) : (
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl hover:border-brand/50 hover:bg-brand/5 transition-colors text-sm text-muted-foreground">
                            <Upload className="w-4 h-4" /> Upload PDF, JPG, or PNG
                        </button>
                    )}
                    {form.file && <CertPreview file={form.file} certName={form.name || "Certificate"} />}
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

// ── Existing cert card ─────────────────────────────────────────────────────────

type Cert = NonNullable<Coach["certifications"]>[number];

function ExistingCertCard({ cert, onRemoved }: { cert: Cert; onRemoved: () => Promise<void> }) {
    const [removing, setRemoving] = useState(false);

    const handleRemove = async () => {
        if (!cert.id) return;
        setRemoving(true);
        try {
            await removeCertification(cert.id);
            await onRemoved();
            toast.success("Certification removed.");
        } catch {
            toast.error("Could not remove certification. Please try again.");
        } finally {
            setRemoving(false);
        }
    };

    return (
        <div className="p-4 border rounded-xl border-border">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{cert.name}</p>
                    {(cert.issuer || cert.issueDate || cert.expiryDate) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {[cert.issuer, cert.issueDate, cert.expiryDate].filter(Boolean).join(" · ")}
                        </p>
                    )}
                    {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-brand hover:underline">
                            <ExternalLink className="w-3 h-3" /> View credential
                        </a>
                    )}
                </div>
                <button type="button" onClick={() => void handleRemove()} disabled={removing}
                    className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-destructive hover:opacity-80 disabled:opacity-50">
                    {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {removing ? "Removing…" : "Remove"}
                </button>
            </div>
            {cert.fileUrl && <CertPreview fileUrl={cert.fileUrl} certName={cert.name} />}
        </div>
    );
}

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
    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7 space-y-6">
            {/* ── Certifications ── */}
            <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold">Credentials & pricing</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Certifications, portfolio link, and your coaching rates.
                        </p>
                    </div>
                    {!showAddForm && (
                        <button type="button" onClick={() => setShowAddForm(true)}
                            className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold transition border rounded-xl border-border hover:bg-muted">
                            <Plus className="w-4 h-4" /> Add certification
                        </button>
                    )}
                </div>

                {existingCertifications && existingCertifications.length > 0 && (
                    <div className="mt-4 space-y-3">
                        {existingCertifications.map((cert) => (
                            <ExistingCertCard
                                key={cert.id ?? cert.name}
                                cert={cert}
                                onRemoved={onRefreshProfile}
                            />
                        ))}
                    </div>
                )}

                {showAddForm && (
                    <div className="mt-4">
                        <AddCertCard onAdded={async () => { setShowAddForm(false); await onRefreshProfile(); }} />
                        <button type="button" onClick={() => setShowAddForm(false)}
                            className="mt-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
                            Cancel
                        </button>
                    </div>
                )}

                {!existingCertifications?.length && !showAddForm && (
                    <p className="mt-4 px-4 py-3 text-sm rounded-xl bg-muted text-muted-foreground">
                        No certifications added yet.
                    </p>
                )}
            </div>

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
