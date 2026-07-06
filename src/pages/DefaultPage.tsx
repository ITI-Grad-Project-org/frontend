import { Link } from "react-router"
import { AlertCircle, Home, ArrowRight } from "lucide-react"

function DefaultPage() {
    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-background">
            <div className="w-full max-w-md">
                <div className="p-8 space-y-6 text-center bg-card rounded-3xl shadow-card sm:p-12">
                    <div className="flex justify-center">
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10">
                            <AlertCircle className="w-10 h-10 text-destructive" strokeWidth={1.5} />
                        </div>
                    </div>

                    <div>
                        <p className="text-6xl font-bold text-destructive">404</p>
                        <p className="mt-2 text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                            Page Not Found
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-foreground">Looks like you've lost your way</h1>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            The page you're looking for doesn't exist. Let's get you back on track to achieve your fitness goals.
                        </p>
                    </div>

                    <Link
                        to={"/"}
                        className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 font-semibold bg-ink text-ink-foreground rounded-2xl hover:opacity-80"
                    >
                        <Home className="w-4 h-4" strokeWidth={2.5} />
                        <span>Back to Home</span>
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                    </Link>

                    <div className="pt-4 border-t border-border">
                        <p className="mb-3 text-xs text-muted-foreground">Need help?</p>
                        <div className="flex flex-wrap justify-center gap-2 text-sm">
                            <Link
                                to={"/dashboard"}
                                className="font-medium transition-colors text-brand hover:text-brand/80"
                            >
                                Dashboard
                            </Link>
                            <span className="text-border">•</span>
                            <a
                                href="mailto:support@example.com"
                                className="font-medium transition-colors text-brand hover:text-brand/80"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-muted-foreground">
                        Error Code: <span className="font-mono font-semibold">404</span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default DefaultPage