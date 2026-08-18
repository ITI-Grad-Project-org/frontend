import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import type { RenderSlideProps, Slide } from "yet-another-react-lightbox";

interface MediaLightboxProps {
    src?: string;
    alt?: string;
    onClose: () => void;
    photos?: string[];
    initialIndex?: number;
}

function isPdf(url: string): boolean {
    return url.toLowerCase().endsWith(".pdf");
}

/**
 * Unified media lightbox built on yet-another-react-lightbox.
 * Renders images (and PDFs via an <iframe>) full-screen on a solid dark
 * backdrop. Use `photos` + `initialIndex` for multi-image galleries.
 */
export function MediaLightbox({ src, alt, onClose, photos, initialIndex = 0 }: MediaLightboxProps) {
    const isGallery = (photos?.length ?? 0) > 1;
    const slides: Slide[] = isGallery
        ? photos!.map((url, i) => ({
            type: "image",
            src: url,
            alt: `Photo ${i + 1}`,
        }))
        : [{ type: "image", src: src ?? "", alt, description: alt }];

    const plugins = [Captions, ...(isGallery ? [Counter, Thumbnails] : [])];

    const renderSlide = ({ slide }: RenderSlideProps) => {
        if (isPdf(slide.src)) {
            return (
                <iframe
                    src={slide.src}
                    title={slide.alt ?? "Document"}
                    className="max-w-full max-h-full border-0"
                    style={{ width: "100%", height: "100%" }}
                />
            );
        }
        return undefined;
    };

    return (
        <Lightbox
            open
            close={onClose}
            index={Math.min(Math.max(initialIndex, 0), slides.length - 1)}
            slides={slides}
            plugins={plugins}
            render={{ slide: renderSlide }}
            captions={{ showToggle: false }}
            carousel={{ finite: true, preload: 1 }}
        />
    );
}
