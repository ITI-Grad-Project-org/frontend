import { useRef, useState } from "react";
import { Upload, X, FileIcon, ImageIcon } from "lucide-react";
import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from "@/components/ui/attachment";

interface FileUploadFieldProps {
  label: string;
  accept?: string;
  /** New file selected by the user */
  file?: File | null;
  /** URL of an already-uploaded file (from the server) */
  existingUrl?: string;
  onChange: (file: File | null) => void;
  /** Called when the user clicks X on an existing server file */
  onDelete?: () => void;
  error?: string;
  type?: "image" | "document";
  description?: string;
}

export function FileUploadField({
  label,
  accept = "*/*",
  file,
  existingUrl,
  onChange,
  onDelete,
  error,
  type = "document",
  description,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    onChange(selected);

    if (type === "image" && selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleRemove = () => {
    // Clear new file selection
    onChange(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";

    // If there's an existing server file and a delete handler, invoke it
    if (existingUrl && onDelete) {
      onDelete();
    }
  };

  const displayUrl = previewUrl ?? existingUrl;
  const hasFile = Boolean(file ?? existingUrl);

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
        {label}
      </label>

      {hasFile ? (
        <Attachment state="done" size="default">
          {/* No AttachmentTrigger here — it sits z-10 over the whole card
              and blocks the X button. We open the picker via the card click
              handler below instead. */}

          {/* Clicking the media / content area opens the file picker */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="contents"
            aria-label="Replace file"
          >
            {type === "image" && displayUrl ? (
              <AttachmentMedia variant="image">
                <img src={displayUrl} alt={label} />
              </AttachmentMedia>
            ) : (
              <AttachmentMedia>
                {type === "image" ? (
                  <ImageIcon className="w-5 h-5" />
                ) : (
                  <FileIcon className="w-5 h-5" />
                )}
              </AttachmentMedia>
            )}

            <AttachmentContent>
              <AttachmentTitle>{file?.name ?? "Current file"}</AttachmentTitle>
              <AttachmentDescription>
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "Uploaded · click to replace"}
              </AttachmentDescription>
            </AttachmentContent>
          </button>

          {/* X button — outside the picker-trigger so it gets its own clicks */}
          <AttachmentActions>
            <AttachmentAction
              type="button"
              onClick={handleRemove}
              variant="ghost"
              size="icon-xs"
              aria-label="Remove file"
            >
              <X className="w-3.5 h-3.5" />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-border rounded-xl hover:border-brand/50 hover:bg-brand/5 transition-colors cursor-pointer"
        >
          <Upload className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {description ?? `Upload ${type === "image" ? "image" : "file"}`}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        aria-label={label}
      />

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
