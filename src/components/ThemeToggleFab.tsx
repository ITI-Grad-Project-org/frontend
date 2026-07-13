import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "@/theme";

export function ThemeToggleFab() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="fixed bottom-4 right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted text-foreground shadow-lg transition-colors duration-200 hover:bg-muted-foreground hover:text-background sm:bottom-6 sm:right-6 cursor-pointer"
        >
            {isDark ? <SunMedium className="h-5 w-5" strokeWidth={2} /> : <Moon className="h-5 w-5" strokeWidth={2} />}
        </button>
    );
}
