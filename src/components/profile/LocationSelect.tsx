import { useState, useEffect, useRef, useMemo } from "react";
import ReactSelect from "react-select";
import { Country, City } from "country-state-city";

interface LocationSelectProps {
    value: string; // stored as "City, Country name" or just "Country name"
    onChange: (value: string) => void;
    hasError?: boolean;
}

interface Option {
    value: string;
    label: string;
}

// Built once at module load — countries never change
const countryOptions: Option[] = Country.getAllCountries().map((c) => ({
    value: c.isoCode,
    label: c.name,
}));

// How many city options we hand to react-select at any time.
// This is the key perf guard — react-select renders ALL options it receives.
const MAX_VISIBLE_CITIES = 80;

function parseLocation(location: string): { countryIso: string; cityName: string } {
    if (!location) return { countryIso: "", cityName: "" };
    const parts = location.split(",").map((p) => p.trim());
    if (parts.length >= 2) {
        const cityName = parts.slice(0, -1).join(", ");
        const countryName = parts[parts.length - 1];
        const country = Country.getAllCountries().find((c) => c.name === countryName);
        return { countryIso: country?.isoCode ?? "", cityName };
    }
    const country = Country.getAllCountries().find((c) => c.name === location);
    return { countryIso: country?.isoCode ?? "", cityName: "" };
}

export function LocationSelect({ value, onChange, hasError }: LocationSelectProps) {
    const parsed = parseLocation(value);

    const [selectedCountry, setSelectedCountry] = useState<Option | null>(
        parsed.countryIso
            ? { value: parsed.countryIso, label: Country.getCountryByCode(parsed.countryIso)?.name ?? "" }
            : null,
    );
    const [selectedCity, setSelectedCity] = useState<Option | null>(
        parsed.cityName ? { value: parsed.cityName, label: parsed.cityName } : null,
    );
    const [cityInput, setCityInput] = useState("");

    // All cities for the selected country, deduplicated, cached per ISO code
    const cityCache = useRef<Record<string, Option[]>>({});
    const [allCityOptions, setAllCityOptions] = useState<Option[]>([]);

    useEffect(() => {
        if (!selectedCountry) {
            setAllCityOptions([]);
            return;
        }
        const iso = selectedCountry.value;
        if (cityCache.current[iso]) {
            setAllCityOptions(cityCache.current[iso]);
            return;
        }
        const cities = City.getCitiesOfCountry(iso) ?? [];
        const seen = new Set<string>();
        const options: Option[] = [];
        for (const city of cities) {
            if (!seen.has(city.name)) {
                seen.add(city.name);
                options.push({ value: city.name, label: city.name });
            }
        }
        cityCache.current[iso] = options;
        setAllCityOptions(options);
    }, [selectedCountry]);

    // Pre-filter + cap HERE so react-select only ever receives ≤ MAX_VISIBLE_CITIES items
    const visibleCityOptions = useMemo(() => {
        if (!cityInput) return [];
        const q = cityInput.toLowerCase();
        const results: Option[] = [];
        for (const opt of allCityOptions) {
            if (opt.label.toLowerCase().includes(q)) {
                results.push(opt);
                if (results.length === MAX_VISIBLE_CITIES) break;
            }
        }
        return results;
    }, [allCityOptions, cityInput]);

    const handleCountryChange = (option: Option | null) => {
        setSelectedCountry(option);
        setSelectedCity(null);
        setCityInput("");
        onChange(option ? option.label : "");
    };

    const handleCityChange = (option: Option | null) => {
        setSelectedCity(option);
        if (!selectedCountry) return;
        onChange(option ? `${option.label}, ${selectedCountry.label}` : selectedCountry.label);
    };

    const borderColor = hasError ? "var(--color-destructive)" : "var(--color-border)";
    const focusBorderColor = hasError ? "var(--color-destructive)" : "var(--color-brand)";

    const selectStyles = {
        control: (base: object, state: { isFocused: boolean }) => ({
            ...base,
            backgroundColor: "var(--color-card)",
            borderRadius: "0.75rem",
            borderWidth: "2px",
            borderColor: state.isFocused ? focusBorderColor : borderColor,
            boxShadow: "none",
            minHeight: "46px",
            "&:hover": { borderColor: focusBorderColor },
            cursor: "pointer",
        }),
        valueContainer: (base: object) => ({ ...base, padding: "0 1rem" }),
        singleValue: (base: object) => ({ ...base, color: "var(--color-foreground)", fontSize: "0.875rem" }),
        placeholder: (base: object) => ({ ...base, color: "var(--color-muted-foreground)", fontSize: "0.875rem" }),
        menu: (base: object) => ({
            ...base,
            backgroundColor: "var(--color-card)",
            borderRadius: "0.75rem",
            border: "2px solid var(--color-border)",
            boxShadow: "var(--shadow-card)",
            overflow: "hidden",
            zIndex: 50,
        }),
        menuList: (base: object) => ({ ...base, padding: "4px", maxHeight: "220px" }),
        option: (base: object, state: { isFocused: boolean; isSelected: boolean }) => ({
            ...base,
            backgroundColor: state.isSelected
                ? "var(--color-brand)"
                : state.isFocused
                    ? "var(--color-muted)"
                    : "transparent",
            color: state.isSelected ? "var(--color-brand-foreground, #fff)" : "var(--color-foreground)",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            cursor: "pointer",
        }),
        indicatorSeparator: () => ({ display: "none" }),
        dropdownIndicator: (base: object) => ({ ...base, color: "var(--color-muted-foreground)", padding: "0 8px" }),
        clearIndicator: (base: object) => ({ ...base, color: "var(--color-muted-foreground)", padding: "0 8px" }),
        input: (base: object) => ({ ...base, color: "var(--color-foreground)", fontSize: "0.875rem" }),
    };

    const cityHasInput = cityInput.length > 0;

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div>
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Country</span>
                <ReactSelect
                    options={countryOptions}
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    placeholder="Select country"
                    isClearable
                    styles={selectStyles}
                    classNamePrefix="location-select"
                />
            </div>
            <div>
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">City</span>
                <ReactSelect
                    // Only pass the pre-filtered slice — never the full list
                    options={visibleCityOptions}
                    value={selectedCity}
                    onChange={handleCityChange}
                    onInputChange={(v) => setCityInput(v)}
                    inputValue={cityInput}
                    // Disable react-select's own filter — we already filtered above
                    filterOption={null}
                    placeholder={selectedCountry ? "Type to search city…" : "Select a country first"}
                    isClearable
                    isDisabled={!selectedCountry}
                    menuIsOpen={cityHasInput ? undefined : false}
                    styles={selectStyles}
                    classNamePrefix="location-select"
                    noOptionsMessage={() =>
                        cityInput.length === 0 ? "Start typing to search" : "No cities found"
                    }
                />
            </div>
        </div>
    );
}
