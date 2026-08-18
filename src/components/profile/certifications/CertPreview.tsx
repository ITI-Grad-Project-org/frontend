import { useState } from "react";
import { FileText, ImageIcon } from "lucide-react";
import { MediaLightbox } from "@/components/ui/MediaLightbox";

export function CertPreview({
    file,
    fileUrl,
    localPreview,
    certName,
}: {
    file?: File | null;
    fileUrl?: string;
    localPreview?: string | null;
    certName?: string;
}) {
    const [previewOpen, setPreviewOpen] = useState(false);

    // New local image file — show inline preview, click to enlarge
    if (localPreview) {
        return (
            <div className="mt-2">
                <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Preview</p>
                <button type="button" onClick={() => setPreviewOpen(true)} className="block w-full group">
                    <img src={localPreview} alt="Certificate preview"
                        className="max-h-48 w-full object-contain rounded-xl border border-border bg-muted/30 transition-opacity group-hover:opacity-80 cursor-zoom-in" />
                </button>
                {previewOpen && (
                    <MediaLightbox src={localPreview} alt={file?.name ?? "Certificate"} onClose={() => setPreviewOpen(false)} />
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
                    <MediaLightbox
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