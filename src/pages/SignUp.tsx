import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { getApiErrorMessage } from "@/lib/api";
import { registerCoach } from "@/services/auth";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "@/theme";

const signUpSchema = z
    .object({
        firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
        lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
        email: z.string().trim().email("Enter a valid email address"),
        phone: z.string().trim().regex(/^\+\d{8,15}$/, "Use an international phone number, e.g. +201000062000"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
        businessName: z.string().trim().min(2, "Business name must be at least 2 characters"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type SignUpFormData = z.infer<typeof signUpSchema>;

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

function SignUp() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const setSession = useAuthStore((state) => state.setSession);
    const [submissionError, setSubmissionError] = useState("");
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (data: SignUpFormData) => {
        setSubmissionError("");

        try {
            const session = await registerCoach({
                ...data,
                timezone: "Africa/Cairo",
                currency: "EGP",
            });

            setSession(session);
            navigate("/profile", { replace: true });
        } catch (error) {
            setSubmissionError(getApiErrorMessage(error, "We could not create your account. Please try again."));
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
            <div className="w-full max-w-md">
                <Link to="/" className="mb-10 flex items-center justify-center">
                    <img src={isDark ? "/Uply-light-logo.png" : "/Uply-dark-logo.png"} alt="Uply" className="h-14 w-auto" />
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
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="First name" type="text" autoComplete="given-name" placeholder="Alex" error={errors.firstName?.message} {...register("firstName")} />
                        <Field label="Last name" type="text" autoComplete="family-name" placeholder="Rivera" error={errors.lastName?.message} {...register("lastName")} />
                    </div>
                    <Field label="Email" type="email" autoComplete="email" placeholder="alex@yourgym.com" error={errors.email?.message} {...register("email")} />
                    <Field label="Phone" type="tel" autoComplete="tel" placeholder="+201000062000" error={errors.phone?.message} {...register("phone")} />
                    <Field label="Business name" type="text" autoComplete="organization" placeholder="Your coaching business" error={errors.businessName?.message} {...register("businessName")} />
                    <Field label="Password" type="password" autoComplete="new-password" placeholder="Min. 8 characters" error={errors.password?.message} {...register("password")} />
                    <Field label="Confirm password" type="password" autoComplete="new-password" placeholder="Repeat your password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />

                    {submissionError && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{submissionError}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Creating account…" : <>Create account <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
