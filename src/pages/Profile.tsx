import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Save, Trash2, User, Briefcase, Award, ImageIcon } from "lucide-react";
import { ConfirmDialog } from "@/components/modals/common/ConfirmDialog";
import { useProfileData } from "../hooks/profile/useProfileData";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileMasthead } from "@/components/profile/ProfileMasthead";
import { PersonalDetailsSection } from "@/components/profile/sections/PersonalDetailsSection";
import { CoachingExperienceSection } from "@/components/profile/sections/CoachingExperienceSection";
import { CredentialsPricingSection } from "@/components/profile/sections/CredentialsPricingSection";
import { ClientProofSection } from "@/components/profile/sections/ClientProofSection";
import { ProfileSidebar } from "@/components/profile/sidebar/ProfileSidebar";
import { clearProfileSetupFlowFlag, isProfileSetupFlowActive } from "@/lib/profile-setup";
import { ProfileSetupWizard } from "@/components/profile/wizard/ProfileSetupWizard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocumentTitle } from "@/hooks/shared/useDocumentTitle";

function Profile() {
    const [isSetupFlow, setIsSetupFlow] = useState(() => isProfileSetupFlowActive());
    useDocumentTitle("Uply | Profile");
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
        clearTransformationPhoto,
        handleSubmit,
        handleSignOut,
        handleDeleteConfirm,
    } = useProfileData({
        onSuccessfulSave: () => {
            if (isSetupFlow) {
                clearProfileSetupFlowFlag();
                setIsSetupFlow(false);
            }
        },
    });

    const {
        register,
        control,
        setValue,
        formState: { errors, isSubmitting, isDirty },
    } = form;

    useEffect(() => {
        return () => {
            if (isSetupFlow) {
                clearProfileSetupFlowFlag();
            }
        };
    }, [isSetupFlow]);

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
            <div className={`w-full mx-auto ${isSetupFlow ? "max-w-3xl" : "max-w-5xl"}`}>
                <ProfileHeader
                    onSignOut={handleSignOut}
                    eyebrow={isSetupFlow ? "Profile setup" : undefined}
                    title={isSetupFlow ? "Finish your coach profile" : undefined}
                    description={
                        isSetupFlow
                            ? "Complete the remaining details so clients can discover and trust your coaching profile."
                            : undefined
                    }
                />

                {isSetupFlow ? (
                    <div className="animate-content">
                        <ProfileSetupWizard
                            form={form}
                            specialties={specialties}
                            onAddSpecialty={addSpecialty}
                            onRemoveSpecialty={removeSpecialty}
                            onSubmit={handleSubmit}
                            user={user}
                        />

                        {submissionError && (
                            <p role="alert" className="p-3 text-sm rounded-xl bg-destructive/10 text-destructive">
                                {submissionError}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="animate-content space-y-6">
                        <ProfileMasthead user={user} />

                        <div className="grid gap-6 lg:grid-cols-3">
                            <ProfileSidebar user={user} />
                            <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-6 lg:col-span-2">
                                <input type="hidden" {...register("specialties")} />

                                <Tabs defaultValue="personal" className="w-full block">
                                    <TabsList className="flex h-12 w-full items-center justify-start gap-1 rounded-full bg-muted p-1 text-muted-foreground mb-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                                        <TabsTrigger value="personal" className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs sm:text-sm sm:flex-1 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-ink! data-[state=active]:text-ink-foreground! data-[state=active]:border-transparent! data-[state=active]:shadow-md">
                                            <User className="w-4 h-4 mr-2 hidden sm:block" />
                                            Personal
                                        </TabsTrigger>
                                        <TabsTrigger value="experience" className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs sm:text-sm sm:flex-1 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-ink! data-[state=active]:text-ink-foreground! data-[state=active]:border-transparent! data-[state=active]:shadow-md">
                                            <Briefcase className="w-4 h-4 mr-2 hidden sm:block" />
                                            Experience
                                        </TabsTrigger>
                                        <TabsTrigger value="credentials" className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs sm:text-sm sm:flex-1 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-ink! data-[state=active]:text-ink-foreground! data-[state=active]:border-transparent! data-[state=active]:shadow-md">
                                            <Award className="w-4 h-4 mr-2 hidden sm:block" />
                                            Credentials
                                        </TabsTrigger>
                                        <TabsTrigger value="proof" className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs sm:text-sm sm:flex-1 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-ink! data-[state=active]:text-ink-foreground! data-[state=active]:border-transparent! data-[state=active]:shadow-md">
                                            <ImageIcon className="w-4 h-4 mr-2 hidden sm:block" />
                                            Client proof
                                        </TabsTrigger>
                                    </TabsList>

                                <TabsContent value="personal" className="mt-0 outline-none">
                                    <PersonalDetailsSection
                                        register={register}
                                        control={control}
                                        errors={errors}
                                    />
                                </TabsContent>

                                <TabsContent value="experience" className="mt-0 outline-none">
                                    <CoachingExperienceSection
                                        register={register}
                                        errors={errors}
                                        specialties={specialties}
                                        onAddSpecialty={addSpecialty}
                                        onRemoveSpecialty={removeSpecialty}
                                    />
                                </TabsContent>

                                <TabsContent value="credentials" className="mt-0 outline-none">
                                    <CredentialsPricingSection
                                        register={register}
                                        control={control}
                                        setValue={setValue}
                                        errors={errors}
                                        existingCertifications={user?.certifications}
                                    />
                                </TabsContent>

                                <TabsContent value="proof" className="mt-0 outline-none">
                                    <ClientProofSection
                                        control={control}
                                        register={register}
                                        errors={errors}
                                        onClearTransformationPhoto={clearTransformationPhoto}
                                    />
                                </TabsContent>
                            </Tabs>

                            {submissionError && (
                                <p role="alert" className="p-3 text-sm rounded-xl bg-destructive/10 text-destructive">
                                    {submissionError}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 pb-8">
                                <div className="flex flex-col items-start gap-1.5">
                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                        className="btn-danger w-fit cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {isDeleting ? "Deleting…" : "Delete profile"}
                                    </button>
                                    <span className="hidden text-xs text-muted-foreground sm:block">
                                        Permanently removes your profile and all coaching data.
                                    </span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !isDirty}
                                    title={!isDirty ? "Make a change to enable saving" : undefined}
                                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold transition rounded-xl bg-ink text-ink-foreground hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSubmitting ? "Saving…" : "Save profile"}
                                </button>
                            </div>
                        </form>
                        </div>
                    </div>
                )}
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