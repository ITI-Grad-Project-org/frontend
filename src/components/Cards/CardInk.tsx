import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardInkProps = HTMLAttributes<HTMLDivElement>;

function CardInk({
    className,
    children,
    ...props
}: CardInkProps) {
    return (
        <div
            className={cn(
                "card-ink p-6 flex flex-col justify-between gap-2.5",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export default CardInk;