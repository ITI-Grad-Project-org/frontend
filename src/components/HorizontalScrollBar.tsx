import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalScrollBarProps {
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    className?: string;
}

export default function HorizontalScrollBar({
    scrollContainerRef,
    className = "",
}: HorizontalScrollBarProps) {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const [scrollRatio, setScrollRatio] = useState(0);
    const [thumbWidthRatio, setThumbWidthRatio] = useState(0.2);
    const [isScrollable, setIsScrollable] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const updateScrollMetrics = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const { scrollWidth, clientWidth, scrollLeft } = container;
        const maxScroll = scrollWidth - clientWidth;
        if (maxScroll <= 2) { setIsScrollable(false); setScrollRatio(0); return; }
        setIsScrollable(true);
        setScrollRatio(Math.max(0, Math.min(1, scrollLeft / maxScroll)));
        setThumbWidthRatio(Math.max(0.15, Math.min(0.42, clientWidth / scrollWidth)));
    }, [scrollContainerRef]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        updateScrollMetrics();
        container.addEventListener("scroll", updateScrollMetrics, { passive: true });
        const ro = new ResizeObserver(updateScrollMetrics);
        ro.observe(container);
        const mo = new MutationObserver(updateScrollMetrics);
        mo.observe(container, { childList: true, subtree: true });
        return () => { container.removeEventListener("scroll", updateScrollMetrics); ro.disconnect(); mo.disconnect(); };
    }, [scrollContainerRef, updateScrollMetrics]);


    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const container = scrollContainerRef.current;
        const track = trackRef.current;
        if (!container || !track) return;
        e.preventDefault(); e.stopPropagation();
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (maxScroll <= 0) return;
        setIsDragging(true);
        const startX = e.clientX;
        const startScrollLeft = container.scrollLeft;
        const trackRect = track.getBoundingClientRect();
        const availableTrackPx = trackRect.width - trackRect.width * thumbWidthRatio;
        const move = (ev: PointerEvent) => {
            container.scrollLeft = startScrollLeft + ((ev.clientX - startX) / availableTrackPx) * maxScroll;
        };
        const up = () => {
            setIsDragging(false);
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
    };

    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = scrollContainerRef.current;
        const track = trackRef.current;
        if (!container || !track) return;
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (maxScroll <= 0) return;
        const rect = track.getBoundingClientRect();
        const thumbWidthPx = rect.width * thumbWidthRatio;
        const availableTrackPx = rect.width - thumbWidthPx;
        if (availableTrackPx <= 0) return;
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left - thumbWidthPx / 2) / availableTrackPx));
        container.scrollTo({ left: ratio * maxScroll, behavior: "smooth" });
    };

    if (!isScrollable) return null;

    const thumbLeft = scrollRatio * (1 - thumbWidthRatio) * 100;
    const thumbWidth = thumbWidthRatio * 100;

    return (
        <>
            <style>{`
                @keyframes liquid-wobble {
                    0%   { transform: scaleX(1)   scaleY(1); }
                    25%  { transform: scaleX(1.03) scaleY(0.91); }
                    50%  { transform: scaleX(0.97) scaleY(1.05); }
                    75%  { transform: scaleX(1.02) scaleY(0.95); }
                    100% { transform: scaleX(1)   scaleY(1); }
                }
                .liquid-pill-wobble {
                    animation: liquid-wobble 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards;
                }
            `}</style>

            <div className={`select-none ${className}`}>
                {/* Track */}
                <div
                    ref={trackRef}
                    onClick={handleTrackClick}
                    className="relative h-6 w-full cursor-pointer rounded-full bg-foreground/6"
                >
                    {/* Draggable Pill */}
                    <div
                        onPointerDown={handlePointerDown}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            left: `${thumbLeft}%`,
                            width: `${thumbWidth}%`,
                            backdropFilter: isDragging ? "blur(10px) saturate(1.4)" : "none",
                            WebkitBackdropFilter: isDragging ? "blur(10px) saturate(1.4)" : "none",
                            backgroundColor: isDragging
                                ? "color-mix(in oklch, var(--color-foreground) 25%, transparent)"
                                : undefined,
                            willChange: "left",
                        }}
                        className={`absolute top-0 bottom-0 flex items-center justify-center gap-1.5 rounded-full px-3 transition-colors duration-200
                            ${isDragging
                                ? "cursor-grabbing liquid-pill-wobble border border-white/20"
                                : "cursor-grab bg-foreground"
                            }`}
                    >
                        <ChevronLeft
                            className="shrink-0 size-3.5 transition-colors"
                            style={{ color: isDragging ? "color-mix(in oklch, var(--color-foreground) 75%, transparent)" : "var(--color-background)" }}
                        />
                        <span
                            className="text-[11px] font-bold uppercase tracking-widest truncate transition-colors"
                            style={{ color: isDragging ? "color-mix(in oklch, var(--color-foreground) 75%, transparent)" : "var(--color-background)" }}
                        >
                            Scroll
                        </span>
                        <ChevronRight
                            className="shrink-0 size-3.5 transition-colors"
                            style={{ color: isDragging ? "color-mix(in oklch, var(--color-foreground) 75%, transparent)" : "var(--color-background)" }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
