import { useState } from "react";
import { X, Ruler, Loader2, ImageOff, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { MediaLightbox } from "@/components/ui/MediaLightbox";
import { useClientMeasurement } from "@/hooks/clients/useClientMeasurements";
import type { ClientMeasurement } from "@/types/client";

interface MeasurementDetailsModalProps {
  clientId: string;
  measurementId: string | null;
  previous: ClientMeasurement | null;
  onClose: () => void;
}

function fmtN(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

type DeltaKind = "up" | "down" | "same";

interface DeltaInfo {
  value: number;
  kind: DeltaKind;
}

function computeDelta(current: number | null, previous: number | null): DeltaInfo | null {
  if (current == null || previous == null) return null;
  const diff = Number((current - previous).toFixed(1));
  return {
    value: Math.abs(diff),
    kind: diff > 0 ? "up" : diff < 0 ? "down" : "same",
  };
}

function deltaColor(): string {
  return "text-info";
}

interface MetricTile {
  label: string;
  valueText: string;
  delta: DeltaInfo | null;
}

function buildTiles(m: ClientMeasurement, prev: ClientMeasurement | null): MetricTile[] {
  const rows = [
    { label: "Weight", current: m.weightKg, prev: prev?.weightKg ?? null, suffix: " kg" },
    { label: "Body fat", current: m.bodyFatPct, prev: prev?.bodyFatPct ?? null, suffix: "%" },
    { label: "Chest", current: m.chestCm, prev: prev?.chestCm ?? null, suffix: " cm" },
    { label: "Waist", current: m.waistCm, prev: prev?.waistCm ?? null, suffix: " cm" },
    { label: "Hips", current: m.hipsCm, prev: prev?.hipsCm ?? null, suffix: " cm" },
    { label: "Arm", current: m.armCm, prev: prev?.armCm ?? null, suffix: " cm" },
    { label: "Thigh", current: m.thighCm, prev: prev?.thighCm ?? null, suffix: " cm" },
  ];
  return rows.map((row) => ({
    label: row.label,
    valueText: row.current != null ? `${row.current}${row.suffix}` : "N/A",
    delta: computeDelta(row.current, row.prev),
  }));
}

export default function MeasurementDetailsModal({
  clientId,
  measurementId,
  previous,
  onClose,
}: MeasurementDetailsModalProps) {
  const { measurement, loading } = useClientMeasurement(clientId, measurementId);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!measurementId) return null;

  const tiles = measurement ? buildTiles(measurement, previous) : [];

  const formattedDate = measurement
    ? new Date(`${measurement.measuredAt}T00:00:00`).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const formattedPrevDate = previous
    ? new Date(`${previous.measuredAt}T00:00:00`).toLocaleDateString(undefined, {
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
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Measurements
                  </h4>
                  {previous && (
                    <span className="text-[11px] text-muted-foreground/80">
                      Compared to previous entry on {formattedPrevDate}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {tiles.map((tile) => (
                    <div
                      key={tile.label}
                      className="flex flex-col gap-1 rounded-2xl border border-border/50 bg-muted/40 p-3"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {tile.label}
                      </span>
                      <span className="text-sm font-extrabold text-foreground tabular-nums">{tile.valueText}</span>
                      {previous &&
                        (tile.delta ? (
                          <span
                            className={`inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums ${deltaColor()}`}
                            title="Change vs previous entry"
                          >
                            {tile.delta.kind === "up" ? (
                              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                            ) : tile.delta.kind === "down" ? (
                              <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
                            ) : (
                              <Minus className="h-3 w-3" aria-hidden="true" />
                            )}
                            {tile.delta.kind === "same"
                              ? "0"
                              : `${tile.delta.kind === "up" ? "+" : "-"}${fmtN(tile.delta.value)}`}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-muted-foreground/60">—</span>
                        ))}
                    </div>
                  ))}
                </div>
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
        <MediaLightbox
          src={previewUrl}
          alt="Progress photo"
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </div>
  );
}