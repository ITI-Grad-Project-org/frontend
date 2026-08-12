import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { useForm, type FieldErrors } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api";
import { getFirstFormErrorMessage } from "@/lib/form-errors";
import { requestPasswordReset, verifyResetOtp } from "@/services/auth";
import { useTheme } from "@/theme";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/schemas/auth";

const OTP_LENGTH = 6;

function OtpCodeInput({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (nextValue: string[]) => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const didAutoFocus = useRef(false);
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? "");

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  useEffect(() => {
    if (disabled || didAutoFocus.current) {
      return;
    }

    didAutoFocus.current = true;
    inputRefs.current[0]?.focus();
    inputRefs.current[0]?.select();
  }, [disabled]);

  const updateDigit = (index: number, nextDigit: string) => {
    const nextDigits = [...digits];
    nextDigits[index] = nextDigit;
    onChange(nextDigits);

    if (nextDigit && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Backspace") {
      return;
    }

    if (digits[index]) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      onChange(nextDigits);
      return;
    }

    if (index > 0) {
      focusInput(index - 1);
      const nextDigits = [...digits];
      nextDigits[index - 1] = "";
      onChange(nextDigits);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLElement>) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (!pastedDigits) {
      return;
    }

    const nextDigits = pastedDigits.slice(0, OTP_LENGTH).split("");
    while (nextDigits.length < OTP_LENGTH) {
      nextDigits.push("");
    }

    onChange(nextDigits);

    const nextIndex = Math.min(pastedDigits.length, OTP_LENGTH - 1);
    focusInput(nextIndex);
  };

  return (
    <div className="flex items-center justify-between gap-2" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`OTP digit ${index + 1}`}
          value={digit}
          onChange={(event) => {
            const nextDigit = event.target.value.replace(/\D/g, "").slice(-1);
            updateDigit(index, nextDigit);
          }}
          onKeyDown={(event) => handleKeyDown(index, event)}
          disabled={disabled}
          maxLength={1}
          className="h-14 w-12 rounded-xl border-2 border-border bg-card text-center text-lg font-semibold tracking-[0.35em] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand disabled:cursor-not-allowed disabled:opacity-60"
        />
      ))}
    </div>
  );
}

function ForgotPassword() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [submissionError, setSubmissionError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const emailField = register("email");

  useEffect(() => {
    if (step === "email") {
      emailInputRef.current?.focus();
    }
  }, [step]);

  const goToEmailStep = () => {
    setStep("email");
    setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ""));
    setSubmissionError("");
  };

  const onSubmitEmail = async ({ email: submittedEmail }: ForgotPasswordFormData) => {
    const normalizedEmail = submittedEmail.trim();
    setSubmissionError("");
    setIsSendingOtp(true);

    try {
      await requestPasswordReset(normalizedEmail);
      setEmail(normalizedEmail);
      setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ""));
      setStep("otp");
      reset({ email: normalizedEmail });
      toast.success("We sent a 6-digit code to your email.");
    } catch (error) {
      const message = getApiErrorMessage(error, "We could not send the reset code. Please try again.");
      setSubmissionError(message);
      toast.error(message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onVerifyOtp = async () => {
    const trimmedOtp = otpDigits.join("").trim();

    if (trimmedOtp.length !== OTP_LENGTH) {
      const message = "Enter the 6-digit code from your email.";
      setSubmissionError(message);
      toast.error(message);
      return;
    }

    setSubmissionError("");
    setIsVerifyingOtp(true);

    try {
      const { resetToken } = await verifyResetOtp({ email, otp: trimmedOtp });
      navigate(
        `/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(email)}`,
        { replace: true },
      );
    } catch (error) {
      const message = getApiErrorMessage(error, "We could not verify that code. Please try again.");
      setSubmissionError(message);
      toast.error(message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const resendCode = async () => {
    if (!email) {
      return;
    }

    setSubmissionError("");
    setIsSendingOtp(true);

    try {
      await requestPasswordReset(email);
      setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ""));
      toast.success("We sent a fresh 6-digit code.");
    } catch (error) {
      const message = getApiErrorMessage(error, "We could not resend the reset code. Please try again.");
      setSubmissionError(message);
      toast.error(message);
    } finally {
      setIsSendingOtp(false);
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
          <img
            src={isDark ? "/Uply-light-logo.webp" : "/Uply-dark-logo.webp"}
            alt="Uply"
            className="h-14 w-auto"
          />
        </Link>


        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
            {step === "email" ? <Mail className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <h1 className="mt-5 text-3xl font-extrabold text-foreground">
            {step === "email" ? "Reset your password" : "Enter the 6-digit code"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === "email"
              ? "Enter your email and we’ll send you a password reset code."
              : `We sent a code to ${email}. Type it from left to right to continue.`}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSubmit(onSubmitEmail, onInvalid)} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Email</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="alex@yourgym.com"
                className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
                {...emailField}
                ref={(element) => {
                  emailField.ref(element);
                  emailInputRef.current = element;
                }}
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </label>

            {submissionError && (
              <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                {submissionError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSendingOtp}
              className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSendingOtp ? "Sending…" : "Send reset code"}
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-border bg-card/70 p-4">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Email</span>
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-foreground">{email}</p>
                <button
                  type="button"
                  onClick={goToEmailStep}
                  className="shrink-0 text-xs font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  Change
                </button>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-muted-foreground">6-digit code</span>
              <OtpCodeInput value={otpDigits} onChange={setOtpDigits} disabled={isVerifyingOtp || isSendingOtp} />
            </label>

            {submissionError && (
              <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                {submissionError}
              </p>
            )}

            <button
              type="button"
              disabled={isVerifyingOtp || isSendingOtp || otpDigits.join("").trim().length !== OTP_LENGTH}
              onClick={() => {
                void onVerifyOtp();
              }}
              className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifyingOtp ? "Verifying…" : "Verify code"}
            </button>

            <div className="flex items-center justify-between gap-3 text-sm">
              <button
                type="button"
                onClick={resendCode}
                disabled={isSendingOtp || isVerifyingOtp}
                className="font-semibold text-foreground underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                Resend code
              </button>

              <button
                type="button"
                onClick={goToEmailStep}
                className="font-semibold text-foreground underline-offset-4 hover:underline"
              >
                Use another email
              </button>
            </div>
          </div>
        )}

        <Link
          to="/signin"
          className="mt-6 flex items-center justify-start gap-2 text-sm font-semibold text-foreground underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
