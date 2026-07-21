import dumbbell1 from "@/assets/dumbbell-1.webp";
import dumbbell2 from "@/assets/dumbbell-2.webp";
import kettlebell from "@/assets/kettlebell.webp";

type LandingFloatingArtProps = {
    x: number;
    y: number;
};

export function LandingFloatingArt({ x, y }: LandingFloatingArtProps) {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 animate-in zoom-in-300 blur-in-sm duration-800">
            <img
                src={dumbbell1}
                alt=""
                width={520}
                height={520}
                className="float-a absolute left-[-4%] top-[8%] w-70 opacity-95 md:w-110 drop-shadow-[0_40px_60px_rgba(0,0,0,0.55)]"

                style={{
                    ["--rot" as string]: "-14deg",
                    ["--px" as string]: `${x * 22}px`,
                    ["--py" as string]: `${y * 18}px`,
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
                    ["--px" as string]: `${x * -28}px`,
                    ["--py" as string]: `${y * -22}px`,
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
                    ["--px" as string]: `${x * 14}px`,
                    ["--py" as string]: `${y * 14}px`,
                }}
            />
        </div>
    );
}
