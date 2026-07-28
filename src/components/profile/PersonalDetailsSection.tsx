import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import {
    genderOptions,
    inputClassName,
    type ProfileFormData,
} from "../../schemas/profileSchema";
import { LocationSelect } from "./LocationSelect";

interface PersonalDetailsProps {
    register: UseFormRegister<ProfileFormData>;
    control: Control<ProfileFormData>;
    errors: FieldErrors<ProfileFormData>;
}

export function PersonalDetailsSection({ register, control, errors }: PersonalDetailsProps) {
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
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Phone</span>
                    <input className={inputClassName} type="tel" autoComplete="tel" placeholder="+201234567890" {...register("phone")} />
                    {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Age</span>
                    <input className={inputClassName} type="number" min="16" max="100" placeholder="32" {...register("age")} />
                    {errors.age && <p className="mt-1 text-xs text-destructive">{errors.age.message}</p>}
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Gender</span>
                    <select className={inputClassName} {...register("gender")}>
                        <option value="">Select gender</option>
                        {genderOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.gender && <p className="mt-1 text-xs text-destructive">{errors.gender.message}</p>}
                </label>

                <div className="block sm:col-span-2">
                    <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                            <LocationSelect
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                hasError={!!errors.location}
                            />
                        )}
                    />
                    {errors.location && <p className="mt-1 text-xs text-destructive">{errors.location.message}</p>}
                </div>

                <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Avatar URL</span>
                    <input className={inputClassName} type="url" placeholder="https://example.com/avatar.jpg" {...register("avatarUrl")} />
                    {errors.avatarUrl && <p className="mt-1 text-xs text-destructive">{errors.avatarUrl.message}</p>}
                </label>
            </div>
        </section>
    );
}
