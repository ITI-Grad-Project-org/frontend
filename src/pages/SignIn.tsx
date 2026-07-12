import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { z } from "zod";
import { getApiErrorMessage } from "@/lib/api";
import { signIn } from "@/services/auth";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "@/theme";

const signInSchema = z.object({
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

function Field({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
            <input
                {...props}
                className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
            />
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </label>
    );
}

function SignIn() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const setSession = useAuthStore((state) => state.setSession);
    const [submissionError, setSubmissionError] = useState("");
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: SignInFormData) => {
        setSubmissionError("");

        try {
            const session = await signIn(data);
            setSession(session);
            const redirectPath = (location.state as { from?: string } | null)?.from ?? "/dashboard";
            navigate(redirectPath, { replace: true });
        } catch (error) {
            setSubmissionError(getApiErrorMessage(error, "Incorrect email or password. Please try again."));
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
            <div className="w-full max-w-md">
                <Link to="/" className="mb-10 flex items-center justify-center">
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
                    <Field label="Email" type="email" autoComplete="email" placeholder="alex@yourgym.com" error={errors.email?.message} {...register("email")} />
                    <Field label="Password" type="password" autoComplete="current-password" placeholder="Enter your password" error={errors.password?.message} {...register("password")} />

                    <div className="text-right">
                        <Link to="/forgot-password" className="text-xs font-semibold text-foreground underline-offset-4 hover:underline">Forgot password?</Link>
                    </div>

                    {submissionError && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{submissionError}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                        {isSubmitting ? "Signing in…" : <>Sign in <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SignIn;
