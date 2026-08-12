import { inputClassName } from "../../../schemas/profileSchema";

interface LocationSelectProps {
    value: string; // stored as "City, Country name" or just "Country name"
    onChange: (value: string) => void;
    hasError?: boolean;
}

function parseLocation(location: string): { country: string; city: string } {
    if (!location) return { country: "", city: "" };
    const commaIndex = location.lastIndexOf(",");
    if (commaIndex === -1) return { country: location.trim(), city: "" };
    return {
        country: location.slice(commaIndex + 1).trim(),
        city: location.slice(0, commaIndex).trim(),
    };
}

function toLocationValue(city: string, country: string): string {
    const cityPart = city.trim();
    const countryPart = country.trim();
    if (cityPart && countryPart) return `${cityPart}, ${countryPart}`;
    return countryPart || cityPart;
}

export function LocationSelect({ value, onChange, hasError }: LocationSelectProps) {
    const { country, city } = parseLocation(value);

    const errorClass = hasError ? " border-destructive focus:border-destructive" : "";

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div>
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Country</span>
                <input
                    className={`${inputClassName}${errorClass}`}
                    autoComplete="country-name"
                    placeholder="Egypt"
                    value={country}
                    onChange={(e) => onChange(toLocationValue(city, e.target.value))}
                />
            </div>
            <div>
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">City</span>
                <input
                    className={`${inputClassName}${errorClass}`}
                    autoComplete="address-level2"
                    placeholder="Cairo"
                    value={city}
                    onChange={(e) => onChange(toLocationValue(e.target.value, country))}
                />
            </div>
        </div>
    );
}