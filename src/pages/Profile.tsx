import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LogOut, Plus, Save, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { getApiErrorMessage } from "@/lib/api";
import { signOut } from "@/services/auth";
import { deleteCoachProfile, getCoachProfile, updateCoachProfile } from "@/services/coaches";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "@/theme";
import type { Coach, UpdateCoachPayload } from "@/types/auth";

const certificationSchema = z.object({
    name: z.string().trim().min(1, "Certification name is required"),
    issuer: z.string().trim().min(1, "Issuer is required"),
    year: z.string().trim().regex(/^\d{4}$/, "Use a four-digit year"),
    credentialUrl: z.union([z.string().trim().url("Enter a valid URL"), z.literal("")]),
});

const profileSchema = z.object({
    firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
    email: z.string().trim().email("Enter a valid email address"),
    phone: z.string().trim().regex(/^\+\d{8,15}$/, "Use an international phone number"),
    bio: z.string().trim().max(1000, "Bio must be 1,000 characters or fewer"),
    specialties: z.string().trim(),
    yearsExperience: z.string().trim().refine(
        (value) => !value || (/^\d+$/.test(value) && Number(value) <= 99),
        "Use a whole number between 0 and 99",
    ),
    certifications: z.array(certificationSchema),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const emptyProfile: ProfileFormData = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    specialties: "",
    yearsExperience: "",
    certifications: [],
};

const inputClassName = "w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

function toFormValues(coach: Coach): ProfileFormData {
    return {
        firstName: coach.firstName ?? "",
        lastName: coach.lastName ?? "",
        email: coach.email ?? "",
        phone: coach.phone ?? "",
        bio: coach.bio ?? "",
        specialties: coach.specialties?.join(", ") ?? "",
        yearsExperience: coach.yearsExperience?.toString() ?? "",
        certifications: coach.certifications?.map((certification) => ({
            name: certification.name,
            issuer: certification.issuer,
            year: certification.year.toString(),
            credentialUrl: certification.credentialUrl ?? "",
        })) ?? [],
    };
}

function Profile() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const clearSession = useAuthStore((state) => state.clearSession);
    const [loadError, setLoadError] = useState("");
    const [submissionError, setSubmissionError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: user ? toFormValues(user) : emptyProfile,
    });
    const { fields, append, remove } = useFieldArray({ control, name: "certifications" });

    useEffect(() => {
        let isActive = true;

        void getCoachProfile()
            .then((coach) => {
                if (isActive) {
                    setUser(coach);
                    reset(toFormValues(coach));
                }
            })
            .catch((error) => {
                if (isActive) {
                    setLoadError(getApiErrorMessage(error, "We could not load your profile. Please refresh and try again."));
                }
            })
            .finally(() => {
                if (isActive) {
                    setIsLoading(false);
                }
            });

        return () => {
            isActive = false;
        };
    }, [reset, setUser]);

    const onSubmit = async (data: ProfileFormData) => {
        if (!user) {
            return;
        }

        setSubmissionError("");
        const specialties = data.specialties
            .split(/[,\n]/)
            .map((specialty) => specialty.trim())
            .filter(Boolean);
        const payload: UpdateCoachPayload = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            bio: data.bio || undefined,
            specialties,
            certifications: data.certifications.map((certification) => ({
                name: certification.name,
                issuer: certification.issuer,
                year: Number(certification.year),
                credentialUrl: certification.credentialUrl || null,
            })),
        };

        if (data.yearsExperience) {
            payload.yearsExperience = Number(data.yearsExperience);
        }

        try {
            const updatedCoach = await updateCoachProfile(user.id, payload);
            setUser(updatedCoach);
            reset(toFormValues(updatedCoach));
        } catch (error) {
            setSubmissionError(getApiErrorMessage(error, "We could not save your profile. Please try again."));
        }
    };

    const handleSignOut = async () => {
        await signOut().catch(() => undefined);
        clearSession();
        navigate("/", { replace: true });
    };

    const handleDelete = async () => {
        if (!user || !window.confirm("Delete your coach profile permanently? This cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        setSubmissionError("");

        try {
            await deleteCoachProfile(user.id);
            clearSession();
            navigate("/", { replace: true });
        } catch (error) {
            setSubmissionError(getApiErrorMessage(error, "We could not delete your profile. Please try again."));
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading your profile…</div>;
    }

    if (loadError) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-6">
                <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 text-center">
                    <p role="alert" className="text-sm text-destructive">{loadError}</p>
                    <Link to="/dashboard" className="mt-5 inline-flex rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-ink-foreground">Back to dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background px-6 py-8 text-foreground sm:py-12">
            <div className="mx-auto w-full max-w-4xl">
                <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <img src={isDark ? "/Uply-light-logo.png" : "/Uply-dark-logo.png"} alt="Uply" className="h-8 w-auto" />
                        <button type="button" onClick={handleSignOut} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground">
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </button>
                    </div>
                </header>

                <div className="mb-8">
                    <p className="text-sm font-semibold text-brand">Coach profile</p>
                    <h1 className="mt-2 text-3xl font-extrabold">Finish setting up your profile</h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Keep your coaching details accurate so your clients know who they are working with.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7">
                        <h2 className="text-lg font-bold">Personal details</h2>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">First name</span><input className={inputClassName} autoComplete="given-name" {...register("firstName")} />{errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}</label>
                            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Last name</span><input className={inputClassName} autoComplete="family-name" {...register("lastName")} />{errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}</label>
                            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Email</span><input className={inputClassName} type="email" autoComplete="email" {...register("email")} />{errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}</label>
                            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Phone</span><input className={inputClassName} type="tel" autoComplete="tel" {...register("phone")} />{errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}</label>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7">
                        <h2 className="text-lg font-bold">Coaching experience</h2>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <label className="block sm:col-span-2"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Bio</span><textarea className={`${inputClassName} min-h-28 resize-y`} placeholder="Tell clients about your coaching approach." {...register("bio")} />{errors.bio && <p className="mt-1 text-xs text-destructive">{errors.bio.message}</p>}</label>
                            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Specialties</span><input className={inputClassName} placeholder="Strength, mobility, nutrition" {...register("specialties")} /><span className="mt-1 block text-xs text-muted-foreground">Separate specialties with commas.</span></label>
                            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Years of experience</span><input className={inputClassName} type="number" min="0" max="99" placeholder="8" {...register("yearsExperience")} />{errors.yearsExperience && <p className="mt-1 text-xs text-destructive">{errors.yearsExperience.message}</p>}</label>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div><h2 className="text-lg font-bold">Certifications</h2><p className="mt-1 text-sm text-muted-foreground">Add credentials your clients should know about.</p></div>
                            <button type="button" onClick={() => append({ name: "", issuer: "", year: "", credentialUrl: "" })} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold transition hover:bg-muted"><Plus className="h-4 w-4" />Add certification</button>
                        </div>

                        {fields.length === 0 ? <p className="mt-5 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">No certifications added yet.</p> : <div className="mt-5 space-y-4">{fields.map((field, index) => <div key={field.id} className="rounded-xl border border-border p-4"><div className="mb-4 flex items-center justify-between"><p className="text-sm font-semibold">Certification {index + 1}</p><button type="button" onClick={() => remove(index)} className="inline-flex items-center gap-1 text-sm font-semibold text-destructive hover:opacity-80"><Trash2 className="h-4 w-4" />Remove</button></div><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Name</span><input className={inputClassName} placeholder="NASM CPT" {...register(`certifications.${index}.name`)} />{errors.certifications?.[index]?.name && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].name.message}</p>}</label><label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Issuer</span><input className={inputClassName} placeholder="NASM" {...register(`certifications.${index}.issuer`)} />{errors.certifications?.[index]?.issuer && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].issuer.message}</p>}</label><label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Year</span><input className={inputClassName} type="number" min="1900" max="2099" placeholder="2022" {...register(`certifications.${index}.year`)} />{errors.certifications?.[index]?.year && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].year.message}</p>}</label><label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Credential URL</span><input className={inputClassName} type="url" placeholder="https://…" {...register(`certifications.${index}.credentialUrl`)} />{errors.certifications?.[index]?.credentialUrl && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].credentialUrl.message}</p>}</label></div></div>)}</div>}
                    </section>

                    {submissionError && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{submissionError}</p>}

                    <div className="flex flex-wrap items-center justify-between gap-4 pb-8">
                        <button type="button" disabled={isDeleting} onClick={handleDelete} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-60"><Trash2 className="h-4 w-4" />{isDeleting ? "Deleting…" : "Delete profile"}</button>
                        <button type="submit" disabled={isSubmitting || !isDirty} className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" />{isSubmitting ? "Saving…" : "Save profile"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Profile;
