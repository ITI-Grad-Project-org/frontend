import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm, type FieldErrors } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api";
import { getFirstFormErrorMessage } from "@/lib/form-errors";
import { registerCoach } from "@/services/auth";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "@/theme";
import { signUpSchema, type SignUpFormData } from "@/schemas/auth";
import { markProfileSetupFlowActive } from "@/lib/profile-setup";
import { detectLocaleDefaults } from "@/lib/locale-defaults";
import { CURRENCY_BY_REGION } from "@/lib/locale-defaults";
import { Field } from "@/components/auth/Field";
import { useDocumentTitle } from "@/hooks/shared/useDocumentTitle";

const CURRENCY_OPTIONS = [...new Set(Object.values(CURRENCY_BY_REGION))].sort();

const TIMEZONE_OPTIONS =
    typeof Intl.supportedValuesOf === "function"
        ? [...Intl.supportedValuesOf("timeZone")].sort()
        : ["UTC"];

const selectCls =
    "w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

function SignUp() {
    const { isDark } = useTheme();
    useDocumentTitle("Uply | Sign up");
    const navigate = useNavigate();
    const setSession = useAuthStore((state) => state.setSession);
    const [submissionError, setSubmissionError] = useState("");

    const detected = detectLocaleDefaults({
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            timezone: TIMEZONE_OPTIONS.includes(detected.timezone)
                ? detected.timezone
                : "UTC",
            currency: CURRENCY_OPTIONS.includes(detected.currency)
                ? detected.currency
                : "USD",
        },
    });

    const onSubmit = async (data: SignUpFormData) => {
        setSubmissionError("");

        try {
            const session = await registerCoach({
                ...data,
            });

            setSession(session);
            markProfileSetupFlowActive();
            toast.success("Account created successfully.");
            toast.success("Please Fill The Missing info");
            navigate("/profile", { replace: true });
        } catch (error) {
            const message = getApiErrorMessage(error, "We could not create your account. Please try again.");
            setSubmissionError(message);
            toast.error(message);
        }
    };

    const onInvalid = (formErrors: FieldErrors<SignUpFormData>) => {
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
                    <h1 className="text-3xl font-extrabold text-foreground">Create your account</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Already have one?{" "}
                        <Link to="/signin" className="font-semibold text-foreground underline-offset-4 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="mt-8 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="First name" type="text" autoComplete="given-name" placeholder="Alex" error={errors.firstName?.message} {...register("firstName")} />
                        <Field label="Last name" type="text" autoComplete="family-name" placeholder="Rivera" error={errors.lastName?.message} {...register("lastName")} />
                    </div>
                    <Field label="Email" type="email" autoComplete="email" placeholder="alex@yourgym.com" error={errors.email?.message} {...register("email")} />
                    <Field label="Business name" type="text" autoComplete="organization" placeholder="Your coaching business" error={errors.businessName?.message} {...register("businessName")} />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Currency</span>
                            <select className={selectCls} {...register("currency")}>
                                {CURRENCY_OPTIONS.map((code) => (
                                    <option key={code} value={code}>{code}</option>
                                ))}
                            </select>
                            {errors.currency && <p className="mt-1 text-xs text-destructive">{errors.currency.message}</p>}
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Timezone</span>
                            <select className={selectCls} {...register("timezone")}>
                                {TIMEZONE_OPTIONS.map((tz) => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                            {errors.timezone && <p className="mt-1 text-xs text-destructive">{errors.timezone.message}</p>}
                        </label>
                    </div>
                    <Field label="Password" type="password" autoComplete="new-password" placeholder="Min. 8 characters" error={errors.password?.message} {...register("password")} />
                    <Field label="Confirm password" type="password" autoComplete="new-password" placeholder="Repeat your password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />

                    {submissionError && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{submissionError}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="cursor-pointer group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Creating account…" : <>Create account <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
