import { useState } from "react";
import { X, Ruler, Loader2, ImageOff } from "lucide-react";
import { MediaPreviewModal } from "@/components/ui/MediaPreviewModal";
import { useClientMeasurement } from "@/hooks/clients/useClientMeasurements";

interface MeasurementDetailsModalProps {
  clientId: string;
  measurementId: string | null;
  onClose: () => void;
}

export default function MeasurementDetailsModal({
  clientId,
  measurementId,
  onClose,
}: MeasurementDetailsModalProps) {
  const { measurement, loading } = useClientMeasurement(clientId, measurementId);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!measurementId) return null;

  const tiles = measurement
    ? [
        { label: "Weight", value: measurement.weightKg != null ? `${measurement.weightKg} kg` : "N/A" },
        { label: "Body fat", value: measurement.bodyFatPct != null ? `${measurement.bodyFatPct}%` : "N/A" },
        { label: "Chest", value: measurement.chestCm != null ? `${measurement.chestCm} cm` : "N/A" },
        { label: "Waist", value: measurement.waistCm != null ? `${measurement.waistCm} cm` : "N/A" },
        { label: "Hips", value: measurement.hipsCm != null ? `${measurement.hipsCm} cm` : "N/A" },
        { label: "Arm", value: measurement.armCm != null ? `${measurement.armCm} cm` : "N/A" },
        { label: "Thigh", value: measurement.thighCm != null ? `${measurement.thighCm} cm` : "N/A" },
      ]
    : [];

  const formattedDate = measurement
    ? new Date(`${measurement.measuredAt}T00:00:00`).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl p-6 sm:p-8 my-8 shadow-2xl rounded-4xl bg-card border border-border modal-card text-foreground max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 border border-brand/20">
              <Ruler className="h-6 w-6 text-brand" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display">{loading ? "Measurement" : "Measurement entry"}</h2>
              <p className="text-sm text-muted-foreground">{formattedDate || "Loading…"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors border rounded-xl cursor-pointer hover:bg-muted border-border text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {loading || !measurement ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading measurement…
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {tiles.map((tile) => (
                  <div
                    key={tile.label}
                    className="flex flex-col gap-1 rounded-2xl border border-border/50 bg-muted/40 p-3"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {tile.label}
                    </span>
                    <span className="text-sm font-extrabold text-foreground">{tile.value}</span>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Progress photos ({measurement.photos.length})
                </h4>
                {measurement.photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {measurement.photos.map((photo, idx) => (
                      <button
                        key={photo}
                        type="button"
                        onClick={() => setPreviewUrl(photo)}
                        className="group relative block aspect-square overflow-hidden rounded-2xl border border-border/60 bg-muted/40 cursor-zoom-in"
                        aria-label={`Open progress photo ${idx + 1}`}
                      >
                        <img
                          src={photo}
                          alt={`Progress photo ${idx + 1}`}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute inset-0 bg-ink/0 transition group-hover:bg-ink/10" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 py-8 text-sm text-muted-foreground">
                    <ImageOff className="h-5 w-5" />
                    No photos attached to this entry.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {previewUrl && (
        <MediaPreviewModal
          src={previewUrl}
          alt="Progress photo"
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </div>
  );
}