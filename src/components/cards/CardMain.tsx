import { type HTMLProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardMainProps = {
    children: ReactNode;
    className?: string;
} & HTMLProps<HTMLDivElement>;

function CardMain({ children, className, ...rest }: CardMainProps) {
    return (
        <div
            {...rest}
            className={cn(
                "card-surface p-6 flex flex-col justify-between gap-2.5",
                className
            )}
        >
            {children}
        </div>
    );
}

export default CardMain;