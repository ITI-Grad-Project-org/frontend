import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";

export function IntensityTypeTooltip() {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const updatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                // Position above the button with an 8px offset
                top: rect.top - 8,
                left: rect.left + rect.width / 2,
            });
        }
    };

    const handleMouseEnter = () => {
        updatePosition();
        setIsOpen(true);
    };

    useEffect(() => {
        if (!isOpen) return;

        // Reposition on scroll or window resize
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);

        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block">
            <button
                ref={buttonRef}
                type="button"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsOpen(false)}
                onFocus={handleMouseEnter}
                onBlur={() => setIsOpen(false)}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
                aria-label="Understanding intensity options"
            >
                <HelpCircle className="h-3.5 w-3.5" />
            </button>

            {isOpen &&
                createPortal(
                    <div
                        style={{
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                        }}
                        className="fixed z-9999 w-80 -translate-x-1/2 -translate-y-full rounded-2xl border border-border bg-popover p-4 text-xs leading-relaxed text-popover-foreground shadow-xl animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
                    >
                        <h4 className="mb-2 text-sm font-bold text-foreground">
                            Understanding the Intensity Options
                        </h4>
                        <dl className="space-y-3">
                            <div>
                                <dt className="font-semibold text-foreground">
                                    RPE (Rate of Perceived Exertion):
                                </dt>
                                <dd className="mt-0.5 text-muted-foreground">
                                    Effort scale where 10 = total failure.
                                </dd>
                                <dd className="mt-0.5 text-[11px] text-muted-foreground/80">
                                    <span className="font-medium text-foreground">Allowed Range:</span> 1 to 10{" "}
                                    <span className="mx-1">|</span>
                                    <span className="font-medium text-foreground">Suggested:</span> 7 – 9
                                </dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-foreground">
                                    RIR (Reps in Reserve):
                                </dt>
                                <dd className="mt-0.5 text-muted-foreground">
                                    Estimated reps left in the tank before failure.
                                </dd>
                                <dd className="mt-0.5 text-[11px] text-muted-foreground/80">
                                    <span className="font-medium text-foreground">Allowed Range:</span> 0 to 10{" "}
                                    <span className="mx-1">|</span>
                                    <span className="font-medium text-foreground">Suggested:</span> 1 – 3
                                </dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-foreground">
                                    %1RM (Percentage of 1-Rep Max):
                                </dt>
                                <dd className="mt-0.5 text-muted-foreground">
                                    Load based on your single-rep max weight.
                                </dd>
                                <dd className="mt-0.5 text-[11px] text-muted-foreground/80">
                                    <span className="font-medium text-foreground">Allowed Range:</span> 1 to 100{" "}
                                    <span className="mx-1">|</span>
                                    <span className="font-medium text-foreground">Suggested:</span> 70 – 85
                                </dd>
                            </div>
                        </dl>
                    </div>,
                    document.body
                )}
        </div>
    );
}