import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardBrandProps = HTMLAttributes<HTMLDivElement>;

function CardBrand({
    className,
    children,
    ...props
}: CardBrandProps) {
    return (
        <div
            className={cn(
                "card-brand p-6 flex flex-col justify-between gap-2.5",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export default CardBrand;