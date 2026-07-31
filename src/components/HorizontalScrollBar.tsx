import { useEffect, useRef, useState, useCallback } from "react";
import { MoveLeft, MoveRight } from "lucide-react";

interface HorizontalScrollBarProps {
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    className?: string;
}

export default function HorizontalScrollBar({
    scrollContainerRef,
    className = "",
}: HorizontalScrollBarProps) {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const [scrollRatio, setScrollRatio] = useState(0); // 0 to 1
    const [thumbWidthRatio, setThumbWidthRatio] = useState(0.2); // ratio of thumb width to track width
    const [isScrollable, setIsScrollable] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Sync metrics with container scroll
    const updateScrollMetrics = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollWidth, clientWidth, scrollLeft } = container;
        const maxScroll = scrollWidth - clientWidth;

        if (maxScroll <= 2) {
            setIsScrollable(false);
            setScrollRatio(0);
            return;
        }

        setIsScrollable(true);
        const currentRatio = Math.max(0, Math.min(1, scrollLeft / maxScroll));
        const widthRatio = Math.max(0.18, Math.min(0.45, clientWidth / scrollWidth));

        setScrollRatio(currentRatio);
        setThumbWidthRatio(widthRatio);
    }, [scrollContainerRef]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        updateScrollMetrics();

        container.addEventListener("scroll", updateScrollMetrics, { passive: true });
        const resizeObserver = new ResizeObserver(updateScrollMetrics);
        resizeObserver.observe(container);

        const mutationObserver = new MutationObserver(updateScrollMetrics);
        mutationObserver.observe(container, { childList: true, subtree: true });

        return () => {
            container.removeEventListener("scroll", updateScrollMetrics);
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [scrollContainerRef, updateScrollMetrics]);

    // Handle Dragging
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const container = scrollContainerRef.current;
        const track = trackRef.current;
        if (!container || !track) return;

        e.preventDefault();
        e.stopPropagation();

        const maxScroll = container.scrollWidth - container.clientWidth;
        if (maxScroll <= 0) return;

        setIsDragging(true);
        const startX = e.clientX;
        const startScrollLeft = container.scrollLeft;
        const trackRect = track.getBoundingClientRect();
        const thumbWidthPx = trackRect.width * thumbWidthRatio;
        const availableTrackPx = trackRect.width - thumbWidthPx;

        const handlePointerMove = (moveEvent: PointerEvent) => {
            if (availableTrackPx <= 0) return;
            const deltaX = moveEvent.clientX - startX;
            const scrollDelta = (deltaX / availableTrackPx) * maxScroll;
            container.scrollLeft = startScrollLeft + scrollDelta;
        };

        const handlePointerUp = () => {
            setIsDragging(false);
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
    };

    // Track click to jump scroll
    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = scrollContainerRef.current;
        const track = trackRef.current;
        if (!container || !track) return;

        const maxScroll = container.scrollWidth - container.clientWidth;
        if (maxScroll <= 0) return;

        const rect = track.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const thumbWidthPx = rect.width * thumbWidthRatio;
        const availableTrackPx = rect.width - thumbWidthPx;

        if (availableTrackPx <= 0) return;

        const targetThumbLeft = clickX - thumbWidthPx / 2;
        const ratio = Math.max(0, Math.min(1, targetThumbLeft / availableTrackPx));

        container.scrollTo({
            left: ratio * maxScroll,
            behavior: "smooth",
        });
    };

    if (!isScrollable) return null;

    const thumbPercentage = scrollRatio * (1 - thumbWidthRatio) * 100;
    const thumbWidthPercentage = thumbWidthRatio * 100;

    return (
        <div className={`space-y-2 select-none ${className}`}>
            {/* Header Navigation Hint */}
            {/* <div className="flex items-center justify-between px-1 text-xs">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                    <MoveHorizontal className="size-3 animate-pulse" />
                    <span>Drag handle to scroll days</span>
                </div>
            </div> */}

            {/* Premium Scroll Track & Knob */}
            <div
                ref={trackRef}
                onClick={handleTrackClick}
                className="relative h-8 w-full rounded-2xl border border-border/80 bg-card p-1 shadow-sm transition-all hover:border-brand/40 cursor-pointer overflow-hidden group"
                title="Click anywhere or drag the handle to scroll"
            >
                {/* Track background subtle gradient fill */}
                <div className="absolute inset-0 bg-linear-to-r from-brand/5 via-muted/30 to-brand/5 opacity-80" />

                {/* Draggable Knob */}
                <div
                    onPointerDown={handlePointerDown}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        left: `${thumbPercentage}%`,
                        width: `${thumbWidthPercentage}%`,
                    }}
                    className={`absolute top-1 bottom-1 flex items-center justify-center gap-1.5 rounded-xl border border-brand/40 bg-brand text-brand-foreground shadow-md transition-transform duration-75 cursor-grab active:cursor-grabbing hover:scale-[1.01] hover:brightness-110 ${isDragging ? "cursor-grabbing ring-2 ring-brand/50 ring-offset-1 scale-[1.01] shadow-lg" : ""
                        }`}
                >
                    <MoveLeft className="size-3.5 shrink-0 opacity-90" />
                    <span className="hidden sm:inline text-[10px] font-extrabold uppercase tracking-wider truncate">
                        Scroll
                    </span>
                    <MoveRight className="size-3.5 shrink-0 opacity-90" />
                </div>
            </div>
        </div>
    );
}
