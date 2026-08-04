import { useEffect } from "react";
import { X, FileText } from "lucide-react";

interface MediaPreviewModalProps {
    src: string;
    alt?: string;
    onClose: () => void;
}

/**
 * Fullscreen lightbox for images and PDFs.
 * PDFs render in an <iframe>; images scale to fit.
 * Closes on backdrop click, X button, or Escape key.
 */
export function MediaPreviewModal({ src, alt = "Preview", onClose }: MediaPreviewModalProps) {
    const isPdf = src.toLowerCase().includes(".pdf");

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    // Prevent body scroll while open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden
            />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-card">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        {isPdf && <FileText className="w-4 h-4 text-muted-foreground shrink-0" />}
                        <span className="text-sm font-medium text-foreground truncate">{alt}</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 ml-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Close preview"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto min-h-0 bg-muted/30 flex items-center justify-center p-4">
                    {isPdf ? (
                        <iframe
                            src={src}
                            title={alt}
                            className="w-full h-[70vh] rounded-lg border border-border bg-white"
                        />
                    ) : (
                        <img
                            src={src}
                            alt={alt}
                            className="max-w-full max-h-[70vh] object-contain rounded-lg"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
