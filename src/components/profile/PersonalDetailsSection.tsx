import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { inputClassName, type ProfileFormData } from "../../schemas/profileSchema";

interface PersonalDetailsProps {
    register: UseFormRegister<ProfileFormData>;
    errors: FieldErrors<ProfileFormData>;
}

export function PersonalDetailsSection({ register, errors }: PersonalDetailsProps) {
    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-7">
            <h2 className="text-lg font-bold">Personal details</h2>
            <div className="grid gap-4 mt-5 sm:grid-cols-2">
                <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">First name</span>
                    <input className={inputClassName} autoComplete="given-name" placeholder="Jordan" {...register("firstName")} />
                    {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Last name</span>
                    <input className={inputClassName} autoComplete="family-name" placeholder="Lee" {...register("lastName")} />
                    {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Email</span>
                    <input className={`${inputClassName} bg-muted/60`} type="email" autoComplete="email" readOnly placeholder="coach@studio.com" {...register("email")} />
                    <span className="block mt-1 text-xs text-muted-foreground">Email is locked after registration.</span>
                    {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Phone</span>
                    <input className={inputClassName} type="tel" autoComplete="tel" placeholder="+201234567890" {...register("phone")} />
                    {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
                </label>
                <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Avatar URL</span>
                    <input className={`${inputClassName} bg-muted/60`} type="url" readOnly placeholder="https://example.com/avatar.jpg" {...register("avatarUrl")} />
                    {errors.avatarUrl && <p className="mt-1 text-xs text-destructive">{errors.avatarUrl.message}</p>}
                </label>
            </div>
        </section>
    );
}