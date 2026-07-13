import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LayoutDashboard, LogOut, Plus, Save, Trash2, Building2, Calendar, CheckCircle2, User, XCircle } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { getApiErrorMessage } from "@/lib/api";
import { signOut } from "@/services/auth";
import { deleteCoachProfile, getCoachProfile, updateCoachProfile } from "@/services/coaches";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "@/theme";
import type { Coach, UpdateCoachPayload } from "@/types/auth";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const certificationSchema = z.object({
    name: z.string().trim().min(1, "Certification name is required"),
    issuer: z.string().trim().min(1, "Issuer is required"),
    year: z.string().trim().regex(/^\d{4}$/, "Use a four-digit year"),
    credentialUrl: z.union([z.string().trim().url("Enter a valid URL"), z.literal("")]),
});

const specialtyOptions = [
    { value: "strength", label: "Strength" },
    { value: "hypertrophy", label: "Hypertrophy" },
    { value: "weight_loss", label: "Weight loss" },
    { value: "powerlifting", label: "Powerlifting" },
    { value: "crossfit", label: "CrossFit" },
    { value: "calisthenics", label: "Calisthenics" },
    { value: "nutrition", label: "Nutrition" },
    { value: "rehab", label: "Rehab" },
    { value: "general_fitness", label: "General fitness" },
] as const;

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
    avatarUrl: z.union([z.string().trim().url("Enter a valid URL"), z.literal("")]),
    socialLinks: z.object({
        instagram: z.union([z.string().trim().url("Enter a valid URL"), z.literal("")]),
        facebook: z.union([z.string().trim().url("Enter a valid URL"), z.literal("")]),
        twitter: z.union([z.string().trim().url("Enter a valid URL"), z.literal("")]),
        linkedin: z.union([z.string().trim().url("Enter a valid URL"), z.literal("")]),
    }).optional(),
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
    avatarUrl: "",
    socialLinks: {
        instagram: "",
        facebook: "",
        twitter: "",
        linkedin: "",
    },
};

const inputClassName = "w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

function specialtyLabel(value: string) {
    return specialtyOptions.find((specialty) => specialty.value === value)?.label ?? value;
}

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
        avatarUrl: coach.avatarUrl ?? "",
        socialLinks: {
            instagram: coach.socialLinks?.instagram ?? "",
            facebook: coach.socialLinks?.facebook ?? "",
            twitter: coach.socialLinks?.twitter ?? "",
            linkedin: coach.socialLinks?.linkedin ?? "",
        },
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

    const [specialties, setSpecialties] = useState<string[]>([]);


    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: user ? toFormValues(user) : emptyProfile,
    });

    const { fields, append, remove } = useFieldArray({ control, name: "certifications" });

    const updateSpecialties = (nextSpecialties: string[], shouldDirty: boolean) => {
        setSpecialties(nextSpecialties);
        setValue("specialties", nextSpecialties.join(", "), {
            shouldDirty,
            shouldValidate: true,
        });
    };

    useEffect(() => {
        let isActive = true;

        void getCoachProfile()
            .then((coach) => {
                if (isActive) {
                    setUser(coach);
                    reset(toFormValues(coach));
                    updateSpecialties(coach.specialties ?? [], false);
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
    }, [reset, setUser, setValue]);

    const addSpecialty = (nextSpecialty: string) => {
        if (specialties.includes(nextSpecialty)) {
            return;
        }

        updateSpecialties([...specialties, nextSpecialty], true);
    };

    const removeSpecialty = (specialtyToRemove: string) => {
        updateSpecialties(
            specialties.filter((specialty) => specialty !== specialtyToRemove),
            true,
        );
    };
    const onSubmit = async (data: ProfileFormData) => {
        if (!user) {
            toast.error("User session not found. Please log in again.");
            return;
        }

        setSubmissionError("");

        const payload: UpdateCoachPayload = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: user.email,
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
            await updateCoachProfile(user.id, payload);

            const refreshedCoach = await getCoachProfile();
            setUser(refreshedCoach);
            reset(toFormValues(refreshedCoach));
            updateSpecialties(refreshedCoach.specialties ?? [], false);

            toast.success("Profile updated successfully!");

        } catch (error) {
            const errorMessage = getApiErrorMessage(error, "We could not save your profile. Please try again.");

            setSubmissionError(errorMessage);

            toast.error(errorMessage);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            toast.success("You've been signed out.");
            clearSession();
            navigate("/", { replace: true });
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        }
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
        return <div className="flex items-center justify-center min-h-screen text-sm bg-background text-muted-foreground">Loading your profile…</div>;
    }

    if (loadError) {
        return (
            <div className="flex items-center justify-center min-h-screen px-6 bg-background">
                <div className="w-full max-w-md p-6 text-center border rounded-2xl border-destructive/30 bg-card">
                    <p role="alert" className="text-sm text-destructive">{loadError}</p>
                    <Link to="/dashboard" className="mt-5 inline-flex rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-ink-foreground">Back to dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-6 py-8 bg-background text-foreground sm:py-12">
            <div className="w-full max-w-4xl mx-auto">
                <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <Link to="/" className="inline-flex items-center">
                        <img src={isDark ? "/Uply-light-logo.png" : "/Uply-dark-logo.png"} alt="Uply" className="w-auto h-8" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link
                            to="/dashboard"
                            className="btn-magnetic group inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-(--shadow-accent) sm:px-5"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Link>
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="btn-magnetic inline-flex items-center gap-1.5 border border-border cursor-pointer rounded-full px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted sm:px-5"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </div>
                </header>

                <div className="mb-8">
                    <p className="text-sm font-semibold text-brand">Coach profile</p>
                    <h1 className="mt-2 text-3xl font-extrabold">Your profile</h1>
                    <p className="max-w-2xl mt-2 text-sm text-muted-foreground">Review and update the coaching details your clients see.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
                        <input type="hidden" {...register("specialties")} />

                        <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7">
                            <h2 className="text-lg font-bold">Personal details</h2>
                            <div className="grid gap-4 mt-5 sm:grid-cols-2">
                                <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">First name</span><input className={inputClassName} autoComplete="given-name" placeholder="Jordan" {...register("firstName")} />{errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}</label>
                                <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Last name</span><input className={inputClassName} autoComplete="family-name" placeholder="Lee" {...register("lastName")} />{errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}</label>
                                <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Email</span><input className={`${inputClassName} bg-muted/60`} type="email" autoComplete="email" readOnly placeholder="coach@studio.com" {...register("email")} /><span className="block mt-1 text-xs text-muted-foreground">Email is locked after registration.</span>{errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}</label>
                                <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Phone</span><input className={inputClassName} type="tel" autoComplete="tel" placeholder="+201234567890" {...register("phone")} />{errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}</label>
                                <label className="block sm:col-span-2">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Avatar URL</span>
                                    <input className={`${inputClassName} bg-muted/60`} type="url" readOnly placeholder="https://example.com/avatar.jpg" {...register("avatarUrl")} />
                                    {/* <span className="block mt-1 text-xs text-muted-foreground">Avatar editing is currently locked.</span> */}
                                    {errors.avatarUrl && <p className="mt-1 text-xs text-destructive">{errors.avatarUrl.message}</p>}
                                </label>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7">
                            <h2 className="text-lg font-bold">Coaching experience</h2>
                            <div className="grid gap-4 mt-5 sm:grid-cols-2">
                                <label className="block sm:col-span-2"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Bio</span><textarea className={`${inputClassName} min-h-28 resize-y`} placeholder="Share the coaching style clients can expect from you." {...register("bio")} />{errors.bio && <p className="mt-1 text-xs text-destructive">{errors.bio.message}</p>}</label>
                                <div className="block sm:col-span-2">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Specialties</span>
                                    <div className="px-3 py-3 transition-colors border-2 rounded-2xl border-border bg-card focus-within:border-brand">
                                        <div className="flex flex-wrap gap-2">
                                            {specialties.map((specialty) => (
                                                <button
                                                    key={specialty}
                                                    type="button"
                                                    onClick={() => removeSpecialty(specialty)}
                                                    className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-destructive/10 hover:text-destructive"
                                                    aria-label={`Remove specialty ${specialtyLabel(specialty)}`}
                                                >
                                                    <span>{specialtyLabel(specialty)}</span>
                                                    <span aria-hidden className="text-base leading-none">×</span>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {specialtyOptions
                                                .filter((specialty) => !specialties.includes(specialty.value))
                                                .map((specialty) => (
                                                    <button
                                                        key={specialty.value}
                                                        type="button"
                                                        onClick={() => addSpecialty(specialty.value)}
                                                        className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-brand hover:text-foreground"
                                                        aria-label={`Add specialty ${specialty.label}`}
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        <span>{specialty.label}</span>
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                    <span className="block mt-1 text-xs text-muted-foreground">Pick from the supported coaching specialties. You can add any number of them.</span>
                                </div>
                                <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Years of experience</span><input className={inputClassName} type="number" min="0" max="99" placeholder="5" {...register("yearsExperience")} />{errors.yearsExperience && <p className="mt-1 text-xs text-destructive">{errors.yearsExperience.message}</p>}</label>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div><h2 className="text-lg font-bold">Certifications</h2><p className="mt-1 text-sm text-muted-foreground">Add credentials your clients should know about.</p></div>
                                <button type="button" onClick={() => append({ name: "", issuer: "", year: "", credentialUrl: "" })} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold transition border rounded-xl border-border hover:bg-muted"><Plus className="w-4 h-4" />Add certification</button>
                            </div>

                            {fields.length === 0 ? <p className="px-4 py-3 mt-5 text-sm rounded-xl bg-muted text-muted-foreground">No certifications added yet.</p> : <div className="mt-5 space-y-4">{fields.map((field, index) => <div key={field.id} className="p-4 border rounded-xl border-border"><div className="flex items-center justify-between mb-4"><p className="text-sm font-semibold">Certification {index + 1}</p><button type="button" onClick={() => remove(index)} className="inline-flex items-center gap-1 text-sm font-semibold text-destructive hover:opacity-80"><Trash2 className="w-4 h-4" />Remove</button></div><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Name</span><input className={inputClassName} placeholder="Certified Strength Coach" {...register(`certifications.${index}.name`)} />{errors.certifications?.[index]?.name && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].name.message}</p>}</label><label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Issuer</span><input className={inputClassName} placeholder="Issuing organization" {...register(`certifications.${index}.issuer`)} />{errors.certifications?.[index]?.issuer && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].issuer.message}</p>}</label><label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Year</span><input className={inputClassName} type="number" min="1900" max="2099" placeholder="2024" {...register(`certifications.${index}.year`)} />{errors.certifications?.[index]?.year && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].year.message}</p>}</label><label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Credential URL</span><input className={inputClassName} type="url" placeholder="https://example.com/certificate" {...register(`certifications.${index}.credentialUrl`)} />{errors.certifications?.[index]?.credentialUrl && <p className="mt-1 text-xs text-destructive">{errors.certifications[index].credentialUrl.message}</p>}</label></div></div>)}</div>}
                        </section>

                        <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7">
                            <h2 className="text-lg font-bold">Social links</h2>
                            <p className="text-sm text-muted-foreground mt-1 mb-5">Connect your social accounts to showcase your online presence. (Currently read-only)</p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Instagram</span>
                                    <input className={`${inputClassName} bg-muted/60`} readOnly placeholder="https://instagram.com/username" {...register("socialLinks.instagram")} />
                                    {errors.socialLinks?.instagram && <p className="mt-1 text-xs text-destructive">{errors.socialLinks.instagram.message}</p>}
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Facebook</span>
                                    <input className={`${inputClassName} bg-muted/60`} readOnly placeholder="https://facebook.com/username" {...register("socialLinks.facebook")} />
                                    {errors.socialLinks?.facebook && <p className="mt-1 text-xs text-destructive">{errors.socialLinks.facebook.message}</p>}
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Twitter / X</span>
                                    <input className={`${inputClassName} bg-muted/60`} readOnly placeholder="https://twitter.com/username" {...register("socialLinks.twitter")} />
                                    {errors.socialLinks?.twitter && <p className="mt-1 text-xs text-destructive">{errors.socialLinks.twitter.message}</p>}
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">LinkedIn</span>
                                    <input className={`${inputClassName} bg-muted/60`} readOnly placeholder="https://linkedin.com/in/username" {...register("socialLinks.linkedin")} />
                                    {errors.socialLinks?.linkedin && <p className="mt-1 text-xs text-destructive">{errors.socialLinks.linkedin.message}</p>}
                                </label>
                            </div>
                        </section>


                        {submissionError && <p role="alert" className="p-3 text-sm rounded-xl bg-destructive/10 text-destructive">{submissionError}</p>}

                        <div className="flex flex-wrap items-center justify-between gap-4 pb-8">
                            <button type="button" disabled={isDeleting} onClick={handleDelete} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold transition cursor-pointer rounded-xl text-destructive hover:bg-destructive/10 disabled:opacity-60"><Trash2 className="w-4 h-4" />{isDeleting ? "Deleting…" : "Delete profile"}</button>
                            <button type="submit" disabled={isSubmitting || !isDirty} className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold transition rounded-xl bg-ink text-ink-foreground hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"><Save className="w-4 h-4" />{isSubmitting ? "Saving…" : "Save profile"}</button>
                        </div>
                    </form>

                    {/* Sidebar info (outside the form) */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) text-center flex flex-col items-center">
                            <Avatar className="w-24 h-24 mb-4">
                                {user?.avatarUrl ? (
                                    <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} className="object-cover" />
                                ) : null}
                                <AvatarFallback className="bg-muted text-muted-foreground">
                                    <User className="w-12 h-12" />
                                </AvatarFallback>
                            </Avatar>

                            <h3 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>

                            <div className="w-full border-t border-border my-4 pt-4 space-y-3 text-left">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Email Status</span>
                                    {user?.isEmailVerified ? (
                                        <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                                            <CheckCircle2 className="w-4 h-4" /> Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 font-semibold text-danger">
                                            <XCircle className="w-4 h-4" /> Unverified
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Phone Status</span>
                                    {user?.isPhoneVerified ? (
                                        <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                                            <CheckCircle2 className="w-4 h-4" /> Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 font-semibold text-danger">
                                            <XCircle className="w-4 h-4" /> Unverified
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="w-full border-t border-border pt-4 flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" /> Joined Since
                                </span>
                                <span className="font-medium text-foreground">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card)">
                            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                <Building2 className="w-5 h-5 text-brand" />
                                Current Companies
                            </h3>

                            {user?.tenants && user.tenants.length > 0 ? (
                                <div className="space-y-4">
                                    {user.tenants.map((tenant) => (
                                        <div key={tenant.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/40">
                                            <Avatar className="w-10 h-10">
                                                {tenant.logoUrl ? (
                                                    <AvatarImage src={tenant.logoUrl} alt={tenant.name} className="object-cover" />
                                                ) : null}
                                                <AvatarFallback className="bg-muted text-muted-foreground">
                                                    <Building2 className="w-5 h-5" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold truncate">{tenant.name}</h4>
                                                <p className="text-xs text-muted-foreground truncate">slug: {tenant.slug}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="inline-block text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-medium">{tenant.currency}</span>
                                                    <span className="inline-block text-[10px] bg-muted-foreground/10 text-muted-foreground px-1.5 py-0.5 rounded font-medium">{tenant.timezone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No current companies associated.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Profile;
