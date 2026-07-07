import { useTheme } from "@/theme";

export function LandingFooter() {
    const { isDark } = useTheme();
    return (
        <footer id="contact" className="border-t border-white/5">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-xs text-muted-foreground md:flex-row md:px-10">
                <div className="flex items-center gap-3">
                    <img
                        src={isDark ? "/Uply-light-logo.png" : "/Uply-dark-logo.png"}
                        alt="UPLY"
                        className="h-3 w-auto"
                    />
                    <span>© {new Date().getFullYear()} Uply. Crafted for coaches.</span>
                </div>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-foreground">Privacy</a>
                    <a href="#" className="hover:text-foreground">Terms</a>
                    <a href="#" className="hover:text-foreground">Contact</a>
                </div>
            </div>
        </footer>
    );
}
