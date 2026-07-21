import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { inputClassName, type ProfileFormData } from "../../schemas/profileSchema";

interface SocialLinksProps {
    register: UseFormRegister<ProfileFormData>;
    errors: FieldErrors<ProfileFormData>;
}

export function SocialLinksSection({ register, errors }: SocialLinksProps) {
    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7">
            <h2 className="text-lg font-bold">Social links</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-5">
                Connect your social accounts to showcase your online presence. (Currently read-only)
            </p>
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
    );
}