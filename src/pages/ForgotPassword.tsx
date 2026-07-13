import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import { useForm, type FieldErrors } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api";
import { getFirstFormErrorMessage } from "@/lib/form-errors";
import { requestPasswordReset } from "@/services/auth";
import { useTheme } from "@/theme";

const forgotPasswordSchema = z.object({
    email: z.string().trim().email("Enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

function ForgotPassword() {
    const { isDark } = useTheme();
    const [submissionError, setSubmissionError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async ({ email }: ForgotPasswordFormData) => {
        setSubmissionError("");

        try {
            await requestPasswordReset(email);
            setIsSubmitted(true);
            toast.success("Reset instructions sent.");
        } catch (error) {
            const message = getApiErrorMessage(error, "We could not send the reset email. Please try again.");
            setSubmissionError(message);
            toast.error(message);
        }
    };

    const onInvalid = (formErrors: FieldErrors<ForgotPasswordFormData>) => {
        const message = getFirstFormErrorMessage(formErrors) ?? "Please fix the highlighted fields.";
        toast.error(message);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
            <div className="w-full max-w-md">
                <Link to="/" className="mb-10 flex items-center justify-center">
                    <img src={isDark ? "/Uply-light-logo.png" : "/Uply-dark-logo.png"} alt="Uply" className="h-14 w-auto" />
                </Link>

                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                        <Mail className="h-6 w-6" />
                    </div>
                    <h1 className="mt-5 text-3xl font-extrabold text-foreground">Reset your password</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Enter your email and we’ll send you reset instructions.</p>
                </div>

                {isSubmitted ? (
                    <div className="mt-8 rounded-xl border border-success/40 bg-success/10 p-4 text-center text-sm text-foreground">
                        Check your inbox for password reset instructions.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="mt-8 space-y-4">
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Email</span>
                            <input
                                type="email"
                                autoComplete="email"
                                placeholder="alex@yourgym.com"
                                className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
                                {...register("email")}
                            />
                            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                        </label>

                        {submissionError && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{submissionError}</p>}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="cursor-pointer flex w-full items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "Sending…" : "Send reset instructions"}
                        </button>
                    </form>
                )}

                <Link to="/signin" className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-foreground underline-offset-4 hover:underline">
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                </Link>
            </div>
        </div>
    );
}

export default ForgotPassword;
