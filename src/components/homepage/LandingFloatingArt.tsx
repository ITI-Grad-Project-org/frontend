import dumbbell1 from "@/assets/dumbbell-1.webp";
import dumbbell2 from "@/assets/dumbbell-2.webp";
import kettlebell from "@/assets/kettlebell.webp";
import { useMouseParallax } from "@/hooks/shared/useMouseParallax";
import type { MouseParallaxMapping } from "@/hooks/shared/useMouseParallax";

const parallaxMappings: MouseParallaxMapping[] = [
    { xVar: "--px1", yVar: "--py1", xMul: 22, yMul: 18, unit: "px" },
    { xVar: "--px2", yVar: "--py2", xMul: -28, yMul: -22, unit: "px" },
    { xVar: "--px3", yVar: "--py3", xMul: 14, yMul: 14, unit: "px" },
];

export function LandingFloatingArt() {
    const parallaxRef = useMouseParallax(parallaxMappings);

    return (
        <div ref={parallaxRef} aria-hidden className="pointer-events-none absolute inset-0 z-0 animate-in zoom-in-300 blur-in-sm duration-800 hidden md:block">
            <img
                src={dumbbell1}
                alt=""
                width={520}
                height={520}
                className="float-a absolute left-[-4%] top-[8%] w-70 opacity-95 md:w-110 drop-shadow-[0_40px_60px_rgba(0,0,0,0.55)]"
                style={{
                    ["--rot" as string]: "-14deg",
                    ["--px" as string]: "var(--px1, 0px)",
                    ["--py" as string]: "var(--py1, 0px)",
                }}
            />
            <img
                src={dumbbell2}
                alt=""
                width={520}
                height={520}
                className="float-b absolute right-[-6%] top-[4%] hidden w-95 opacity-90 md:block drop-shadow-[0_40px_60px_rgba(0,0,0,0.55)]"
                style={{
                    ["--rot" as string]: "10deg",
                    ["--px" as string]: "var(--px2, 0px)",
                    ["--py" as string]: "var(--py2, 0px)",
                }}
            />
            <img
                src={kettlebell}
                alt=""
                width={300}
                height={300}
                className="float-a absolute bottom-[4%] right-[8%] hidden w-45 opacity-80 md:block drop-shadow-[0_30px_50px_rgba(0,0,0,0.5)]"
                style={{
                    ["--rot" as string]: "-6deg",
                    ["--px" as string]: "var(--px3, 0px)",
                    ["--py" as string]: "var(--py3, 0px)",
                }}
            />
        </div>
    );
}