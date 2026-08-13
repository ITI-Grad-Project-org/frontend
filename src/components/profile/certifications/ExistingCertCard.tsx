import { Trash2, ExternalLink, Undo2, Clock3 } from "lucide-react";
import type { Coach } from "@/types/auth";
import { CertPreview } from "./CertPreview";

export type Cert = NonNullable<Coach["certifications"]>[number];

interface ExistingCertCardProps {
    cert: Cert;
    pendingRemoval?: boolean;
    onRemove?: () => void;
    onRestore?: () => void;
}

export function ExistingCertCard({ cert, pendingRemoval = false, onRemove, onRestore }: ExistingCertCardProps) {
    return (
        <div className={`p-4 border rounded-xl border-border ${pendingRemoval ? "opacity-75" : ""}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${pendingRemoval ? "line-through text-muted-foreground" : ""}`}>
                        {cert.name}
                    </p>
                    {(cert.issuer || cert.issueDate || cert.expiryDate) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {[cert.issuer, cert.issueDate, cert.expiryDate].filter(Boolean).join(" · ")}
                        </p>
                    )}
                    {cert.credentialUrl && !pendingRemoval && (
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-brand hover:underline">
                            <ExternalLink className="w-3 h-3" /> View credential
                        </a>
                    )}
                    {pendingRemoval && (
                        <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-warn">
                            <Clock3 className="w-3 h-3" /> Removal pending — save to confirm
                        </p>
                    )}
                </div>
                {pendingRemoval ? (
                    <button type="button" onClick={onRestore}
                        className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
                        <Undo2 className="w-4 h-4" />
                        Restore
                    </button>
                ) : (
                    <button type="button" onClick={onRemove}
                        className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-destructive hover:opacity-80">
                        <Trash2 className="w-4 h-4" />
                        Remove
                    </button>
                )}
            </div>
            {cert.fileUrl && !pendingRemoval && <CertPreview fileUrl={cert.fileUrl} certName={cert.name} />}
        </div>
    );
}