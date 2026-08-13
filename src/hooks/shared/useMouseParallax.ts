import { useCallback, useEffect, useRef } from "react";

export type MouseParallaxMapping = {
    xVar: string;
    yVar: string;
    xMul: number;
    yMul: number;
    unit?: string;
};

export function useMouseParallax(mappings: MouseParallaxMapping[]) {
    const ref = useRef<HTMLElement | null>(null);
    const mappingsRef = useRef(mappings);

    const setRef = useCallback((node: HTMLElement | null) => {
        ref.current = node;
    }, []);

    useEffect(() => {
        mappingsRef.current = mappings;
    });

    useEffect(() => {
        let raf = 0;
        const onMove = (event: MouseEvent) => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const el = ref.current;
                if (!el) return;

                const nx = (event.clientX / window.innerWidth - 0.5) * 2;
                const ny = (event.clientY / window.innerHeight - 0.5) * 2;

                for (const mapping of mappingsRef.current) {
                    if (mapping.xVar) el.style.setProperty(mapping.xVar, `${nx * mapping.xMul}${mapping.unit ?? ""}`);
                    if (mapping.yVar) el.style.setProperty(mapping.yVar, `${ny * mapping.yMul}${mapping.unit ?? ""}`);
                }
            });
        };

        window.addEventListener("mousemove", onMove);
        return () => {
            window.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(raf);
        };
    }, []);

    return setRef;
}