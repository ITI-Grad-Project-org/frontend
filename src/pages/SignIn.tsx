import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import { useTheme } from "@/theme"

const signInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
})

type SignInFormData = z.infer<typeof signInSchema>

function Field({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
            <input
                {...props}
                className="w-full px-4 py-3 text-sm transition-colors border-2 outline-none rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-brand"
            />
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </label>
    )
}

function SignIn() {
    const { isDark } = useTheme()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
    })

    const onSubmit = async (data: SignInFormData) => {
        try {
            console.log("Sign in data:", data)
        } catch (error) {
            console.error("Sign in error:", error)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-6 py-12 bg-background">
            <div className="w-full max-w-md">
                <Link to="/" className="flex items-center justify-center mb-10">
                    <img src={isDark ? "/Uply-light-logo.png" : "/Uply-dark-logo.png"} alt="Uply" className="h-14 w-auto" />
                </Link>

                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-foreground">Welcome back</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link to="/signup" className="font-semibold text-foreground underline-offset-4 hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
                    <Field
                        label="Email"
                        type="email"
                        placeholder="alex@yourgym.com"
                        error={errors.email?.message}
                        {...register("email")}
                    />
                    <Field
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        error={errors.password?.message}
                        {...register("password")}
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:opacity-60"
                    >
                        {isSubmitting ? (
                            "Signing in…"
                        ) : (
                            <>
                                Sign in <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default SignIn
