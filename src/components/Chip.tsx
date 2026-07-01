import type { ReactNode } from "react";

interface ChipProps {
    color?: "violet" | "orange" | "green" | "pink" | "yellow";
    children: ReactNode;
}

export function Chip({ color = "violet", children }: ChipProps) {
    const styles = {
        // violet: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
        // orange: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
        // green: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
        // pink: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
        // yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
        violet: "bg-purple-100 text-purple-700",
        orange: "bg-orange-100 text-orange-700",
        green: "bg-green-100 text-green-700",
        pink: "bg-pink-100 text-pink-700",
        yellow: "bg-yellow-100 text-yellow-700",
    }[color];

    return (
        <span className={`p-3 text-xs rounded-full w-fit flex items-center justify-center ${styles}`}>
            {children}
        </span>
    );
}