import { useState } from "react";
import { Trash2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { removeCertification } from "@/services/coaches";
import type { Coach } from "@/types/auth";
import { CertPreview } from "./CertPreview";

export type Cert = NonNullable<Coach["certifications"]>[number];

export function ExistingCertCard({ cert, onRemoved }: { cert: Cert; onRemoved: () => Promise<void> }) {
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