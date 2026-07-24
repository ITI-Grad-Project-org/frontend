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
 * Drop it next to any Tempo label.
 */
export function TempoTooltip() {
    return (
        <span className="relative inline-flex items-center z-50">
            <Info
                size={13}
                className="cursor-help text-muted-foreground transition-colors hover:text-foreground focus:text-foreground"
                tabIndex={0}
                aria-label="Tempo value guide"
            />
            {/* Tooltip panel */}
            <span
                role="tooltip"
                className={[
                    "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2",
                    "rounded-2xl border border-border bg-popover p-3 shadow-xl",
                    "opacity-0 scale-95 transition-all duration-150",
                    "[.relative:hover>&]:opacity-100 [.relative:hover>&]:scale-100",
                    "[.relative:focus-within>&]:opacity-100 [.relative:focus-within>&]:scale-100",
                ].join(" ")}
            >
                {/* <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Tempo value guide
                </p> */}
                <table className="w-full border-collapse text-xs">
                    <tbody>
                        {rows.map(({ key, desc }) => (
                            <tr key={key} className="align-top">
                                <td className="py-1 pr-3 font-semibold text-foreground whitespace-nowrap">{key}</td>
                                <td className="py-1 text-muted-foreground">{desc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </span>
        </span>
    );
}
