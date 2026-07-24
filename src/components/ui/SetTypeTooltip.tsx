import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

const setTypes = [
    {
        key: "warmup",
        label: "Warmup Set",
        description: "Light weight to prime muscles and joints; doesn't count toward hard work.",
    },
    {
        key: "working",
        label: "Working Set",
        description: "Primary progressive overload sets at target weight/reps.",
    },
    {
        key: "drop_set",
        label: "Drop Set",
        description: "Set to near-failure, then immediately drop weight (20-30%) without rest.",
    },
    {
        key: "amrap",
        label: "AMRAP",
        description: "As Many Reps As Possible within safe technical execution.",
    },
    {
        key: "to_failure",
        label: "To Failure",
        description: "Pushing until full technical repetition failure.",
    },
];

/**
 * Hover-activated tooltip anchored right below the info icon.
 */
export function SetTypeTooltip() {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLSpanElement>(null);

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 8, // 8px below icon
                left: rect.left + rect.width / 2,
            });
        }
    };

    const handleOpen = () => {
        updatePosition();
        setIsOpen(true);
    };

    useEffect(() => {
        if (!isOpen) return;

        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);

        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [isOpen]);

    return (
        <span
            ref={triggerRef}
            className="inline-flex items-center"
            onMouseEnter={handleOpen}
            onMouseLeave={() => setIsOpen(false)}
            onFocus={handleOpen}
            onBlur={() => setIsOpen(false)}
        >
            <Info
                size={13}
                className="cursor-help text-muted-foreground transition-colors hover:text-foreground focus:text-foreground"
                tabIndex={0}
                aria-label="Set type guide"
            />

            {isOpen &&
                createPortal(
                    <span
                        role="tooltip"
                        style={{
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                        }}
                        className="fixed z-9999 w-80 -translate-x-1/2 rounded-2xl border border-border bg-popover p-3 shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150"
                    >
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Set Type Guide
                        </p>
                        <dl className="space-y-2 text-xs">
                            {setTypes.map(({ key, label, description }) => (
                                <div key={key}>
                                    <dt className="font-semibold text-foreground">
                                        <span className="font-mono text-[11px] text-muted-foreground">{key}</span>
                                        {" – "}
                                        {label}
                                    </dt>
                                    <dd className="text-muted-foreground text-[11px] leading-tight">
                                        {description}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </span>,
                    document.body
                )}
        </span>
    );
}