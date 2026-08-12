interface CompressOptions {
    maxDimension?: number;
    quality?: number;
    skipIfUnderBytes?: number;
}

function decodeViaImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("image decode failed"));
        };
        img.src = url;
    });
}

function decodeImage(file: File): Promise<HTMLImageElement | ImageBitmap> {
    return new Promise((resolve, reject) => {
        if (typeof createImageBitmap === "function") {
            createImageBitmap(file, { imageOrientation: "from-image" })
                .then(resolve)
                .catch(() => decodeViaImageElement(file).then(resolve, reject));
            return;
        }
        decodeViaImageElement(file).then(resolve, reject);
    });
}

/**
 * Downscale + re-encode an image client-side before upload so stored files
 * (and every subsequent fetch) stay small.
 *
 * - Non-image files and already-small files pass through untouched.
 * - Undecodable images (HEIC, SVG, corrupt) pass through untouched.
 * - EXIF orientation is honored via createImageBitmap when available.
 */
export async function compressImageFile(
    file: File,
    options: CompressOptions = {},
): Promise<File> {
    const { maxDimension = 1600, quality = 0.82, skipIfUnderBytes = 100 * 1024 } = options;

    if (!file.type.startsWith("image/")) return file;
    if (file.size < skipIfUnderBytes) return file;
    if (file.type === "image/svg+xml") return file;

    let source: HTMLImageElement | ImageBitmap;
    try {
        source = await decodeImage(file);
    } catch {
        return file;
    }

    const srcWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
    const srcHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
    if (!srcWidth || !srcHeight) return file;

    const scale = Math.min(1, maxDimension / Math.max(srcWidth, srcHeight));

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(srcWidth * scale));
    canvas.height = Math.max(1, Math.round(srcHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) return file;
    if (blob.size >= file.size) return file;

    const baseName = (file.name.replace(/\.[^/.]+$/, "") || "image").trim();
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

export async function compressImageFiles(files: File[]): Promise<File[]> {
    return Promise.all(files.map((file) => compressImageFile(file)));
}