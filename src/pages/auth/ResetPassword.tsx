import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useForm, type FieldErrors } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api";
import { getFirstFormErrorMessage } from "@/lib/form-errors";
import { resetPassword } from "@/services/auth";
import { useTheme } from "@/theme";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/schemas/auth";
import { useDocumentTitle } from "@/hooks/shared/useDocumentTitle";

function ResetPassword() {
  const { isDark } = useTheme();
  useDocumentTitle("Uply | Reset password");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");
  const email = searchParams.get("email");

  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!resetToken) {
      toast.error("This reset link is invalid or missing a token.");
      return;
    }

    setSubmissionError("");

    try {
      await resetPassword({ resetToken, newPassword: data.newPassword });
      setIsSubmitted(true);
      toast.success("Your password has been reset.");
    } catch (error) {
      const message = getApiErrorMessage(error, "We could not reset your password. The reset token may have expired.");
      setSubmissionError(message);
      toast.error(message);
    }
  };

  const onInvalid = (formErrors: FieldErrors<ResetPasswordFormData>) => {
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-3xl font-extrabold text-foreground">Set a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {email ? `Choose a strong password for ${email}.` : "Choose a strong password you haven't used before."}
          </p>
        </div>

        {!resetToken ? (
          <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
            This reset link is invalid or missing a token. Please request a new code.
          </div>
        ) : isSubmitted ? (
          <div className="mt-8 space-y-4 rounded-xl border border-success/40 bg-success/10 p-4 text-center text-sm text-foreground">
            <p>Your password has been reset successfully.</p>
            <button
              type="button"
              onClick={() => navigate("/signin", { replace: true })}
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Continue to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">New password</span>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
                {...register("newPassword")}
              />
              {errors.newPassword && <p className="mt-1 text-xs text-destructive">{errors.newPassword.message}</p>}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Confirm new password</span>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </label>

            {submissionError && (
              <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                {submissionError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Resetting…" : "Reset password"}
            </button>
          </form>
        )}

        {/* <Link
          to="/forgot-password"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-foreground underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Request a new code
        </Link> */}
      </div>
    </div>
  );
}

export default ResetPassword;
