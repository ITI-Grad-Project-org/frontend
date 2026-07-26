import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

const rows = [
    { key: "0", desc: "No pause at all. You transition immediately to the next phase." },
    { key: "1 – 2", desc: "Standard, controlled, natural lifting speed." },
    { key: "3 – 5", desc: "Slowed down intentionally to build muscle or fix lifting form." },
    { key: "6 – 10", desc: "Hyper-slow, used for intense rehab, tendon health, or extreme muscle burn." },
    { key: "X", desc: "Explode up as fast as possible with maximum power." },
];

/**
 * A small info icon that reveals a tempo guide tooltip on hover/focus.
 * Uses a portal to render above all modal/card overflow constraints.
 */
export function TempoTooltip() {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLSpanElement>(null);

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 8, // Places tooltip 8px below the icon
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
                aria-label="Understanding tempo notation"
            />

            {isOpen &&
                createPortal(
                    <span
                        role="tooltip"
                        style={{
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                        }}
                        className="fixed z-9999 w-72 -translate-x-1/2 rounded-2xl border border-border bg-popover p-3 shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150"
                    >
                        <h4 className="mb-2 text-sm font-bold text-foreground">
                            Understanding the Tempo Notation
                        </h4>
                        <table className="w-full border-collapse text-xs">
                            <tbody>
                                {rows.map(({ key, desc }) => (
                                    <tr key={key} className="align-top">
                                        <td className="py-1 pr-3 font-semibold text-foreground whitespace-nowrap">
                                            {key}
                                        </td>
                                        <td className="py-1 text-muted-foreground">{desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </span>,
                    document.body
                )}
        </span>
    );
}