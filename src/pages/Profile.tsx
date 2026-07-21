import { Link } from "react-router";
import { Save, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { useProfileData } from "../hooks/useProfileData";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { PersonalDetailsSection } from "../components/profile/PersonalDetailsSection";
import { CoachingExperienceSection } from "../components/profile/CoachingExperienceSection";
import { CertificationsSection } from "../components/profile/CertificationsSection";
import { SocialLinksSection } from "../components/profile/SocialLinksSection";
import { ProfileSidebar } from "../components/profile/ProfileSidebar";

function Profile() {
    const {
        user,
        form,
        specialties,
        isLoading,
        loadError,
        submissionError,
        isDeleting,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        addSpecialty,
        removeSpecialty,
        handleSubmit,
        handleSignOut,
        handleDeleteConfirm,
    } = useProfileData();

    const {
        register,
        control,
        formState: { errors, isSubmitting, isDirty },
    } = form;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-sm bg-background text-muted-foreground">
                Loading your profile…
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="flex items-center justify-center min-h-screen px-6 bg-background">
                <div className="w-full max-w-md p-6 text-center border rounded-2xl border-destructive/30 bg-card">
                    <p role="alert" className="text-sm text-destructive">{loadError}</p>
                    <Link to="/dashboard" className="mt-5 inline-flex rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-ink-foreground">
                        Back to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-6 py-8 bg-background text-foreground sm:py-12">
            <div className="w-full max-w-4xl mx-auto">
                <ProfileHeader onSignOut={handleSignOut} />

                <div className="grid gap-6 lg:grid-cols-3 animate-content">
                    <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6 order-2 lg:order-1">
                        <input type="hidden" {...register("specialties")} />

                        <PersonalDetailsSection register={register} errors={errors} />

                        <CoachingExperienceSection
                            register={register}
                            errors={errors}
                            specialties={specialties}
                            onAddSpecialty={addSpecialty}
                            onRemoveSpecialty={removeSpecialty}
                        />

                        <CertificationsSection control={control} register={register} errors={errors} />

                        <SocialLinksSection register={register} errors={errors} />

                        {submissionError && (
                            <p role="alert" className="p-3 text-sm rounded-xl bg-destructive/10 text-destructive">
                                {submissionError}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-4 pb-8">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold transition cursor-pointer rounded-xl text-destructive hover:bg-destructive/10 disabled:opacity-60"
                            >
                                <Trash2 className="w-4 h-4" />
                                {isDeleting ? "Deleting…" : "Delete profile"}
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !isDirty}
                                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold transition rounded-xl bg-ink text-ink-foreground hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save className="w-4 h-4" />
                                {isSubmitting ? "Saving…" : "Save profile"}
                            </button>
                        </div>
                    </form>

                    <ProfileSidebar user={user} />
                </div>
            </div>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                title="Delete your profile?"
                description="This will permanently delete your coach profile and cannot be undone."
                confirmLabel="Delete profile"
                isConfirming={isDeleting}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsDeleteDialogOpen(false)}
            />
        </div>
    );
}

export default Profile;