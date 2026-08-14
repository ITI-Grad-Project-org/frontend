import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm, type FieldErrors } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api";
import { getFirstFormErrorMessage } from "@/lib/form-errors";
import { signIn } from "@/services/auth";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "@/theme";
import { signInSchema, type SignInFormData } from "@/schemas/auth";
import { Field } from "@/components/auth/Field";

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
            toast.success("Signed in successfully.");
            const redirectPath = (location.state as { from?: string } | null)?.from ?? "/dashboard";
            navigate(redirectPath, { replace: true });
        } catch (error) {
            const message = getApiErrorMessage(error, "Incorrect email or password. Please try again.");
            setSubmissionError(message);
            toast.error(message);
        }
    };

    const onInvalid = (formErrors: FieldErrors<SignInFormData>) => {
        const message = getFirstFormErrorMessage(formErrors) ?? "Please fix the highlighted fields.";
        toast.error(message);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
            <div className="w-full max-w-md">
                <Link to="/" className="mb-10 flex items-center justify-center">
                    <img src={isDark ? "/uply-logo-extra-bold-dark-transparent.webp" : "/uply-logo-extra-bold-transparent.webp"} alt="Uply" className="h-14 w-auto" />
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

                <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="mt-8 space-y-4">
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
