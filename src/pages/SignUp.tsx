import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import { useTheme } from "@/theme"

const signUpSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    terms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
})

type SignUpFormData = z.infer<typeof signUpSchema>

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

function SignUp() {
    const { isDark } = useTheme()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
    })

    const onSubmit = async (data: SignUpFormData) => {
        try {
            console.log("Sign up data:", data)
        } catch (error) {
            console.error("Sign up error:", error)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-6 py-12 bg-background">
            <div className="w-full max-w-md">
                <Link to="/" className="flex items-center justify-center mb-10">
                    <img src={isDark ? "/Uply-light-logo.png" : "/Uply-dark-logo.png"} alt="Uply" className="w-auto h-14" />
                </Link>

                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-foreground">Create your account</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Already have one?{" "}
                        <Link to="/signin" className="font-semibold text-foreground underline-offset-4 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
                    <Field
                        label="Full name"
                        type="text"
                        placeholder="Alex Rivera"
                        error={errors.fullName?.message}
                        {...register("fullName")}
                    />
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
                        placeholder="Min. 8 characters"
                        error={errors.password?.message}
                        {...register("password")}
                    />

                    <label className="flex items-start gap-2.5 pt-1 text-xs text-muted-foreground">
                        <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 accent-brand"
                            {...register("terms")}
                        />
                        <span>
                            I agree to the{" "}
                            <a href="#" className="text-foreground underline-offset-4 hover:underline">
                                Terms
                            </a>{" "}
                            &{" "}
                            <a href="#" className="text-foreground underline-offset-4 hover:underline">
                                Privacy Policy
                            </a>
                            .
                        </span>
                    </label>
                    {errors.terms && <p className="text-xs text-destructive">{errors.terms.message}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:opacity-60"
                    >
                        {isSubmitting ? (
                            "Creating account…"
                        ) : (
                            <>
                                Create account{" "}
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default SignUp
