import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
    color?: "violet" | "orange" | "green" | "pink" | "yellow";
    children: ReactNode;
}

export function Chip({
    color = "violet",
    children,
    className,
    ...props
}: ChipProps) {
    const styles = {
        violet: "bg-chip-violet text-violet",
        orange: "bg-chip-peach text-brand",
        green: "bg-chip-mint text-success",
        pink: "bg-chip-pink text-danger",
        yellow: "bg-chip-yellow text-warn",
    }[color];

    return (
        <span
            className={cn(
                "p-3 text-xs rounded-full w-fit flex items-center text-center justify-center",
                styles,
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}