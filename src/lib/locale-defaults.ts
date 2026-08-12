export const CURRENCY_BY_REGION: Record<string, string> = {
    EG: "EGP",
    US: "USD",
    CA: "CAD",
    GB: "GBP",
    AU: "AUD",
    NZ: "NZD",
    AE: "AED",
    SA: "SAR",
    QA: "QAR",
    KW: "KWD",
    BH: "BHD",
    OM: "OMR",
    EU: "EUR",
    AT: "EUR",
    BE: "EUR",
    DE: "EUR",
    ES: "EUR",
    FI: "EUR",
    FR: "EUR",
    GR: "EUR",
    IE: "EUR",
    IT: "EUR",
    NL: "EUR",
    PT: "EUR",
    PL: "PLN",
    TR: "TRY",
    CH: "CHF",
    SE: "SEK",
    NO: "NOK",
    DK: "DKK",
    CZ: "CZK",
    HU: "HUF",
    RO: "RON",
    UA: "UAH",
    RU: "RUB",
    IN: "INR",
    PK: "PKR",
    BD: "BDT",
    LK: "LKR",
    PH: "PHP",
    TH: "THB",
    VN: "VND",
    ID: "IDR",
    MY: "MYR",
    SG: "SGD",
    JP: "JPY",
    KR: "KRW",
    CN: "CNY",
    HK: "HKD",
    TW: "TWD",
    MX: "MXN",
    BR: "BRL",
    AR: "ARS",
    CL: "CLP",
    CO: "COP",
    PE: "PEN",
    MA: "MAD",
    DZ: "DZD",
    TN: "TND",
    NG: "NGN",
    KE: "KES",
    ZA: "ZAR",
};

export interface LocaleDefaults {
    timezone: string;
    currency: string;
}

export function detectLocaleDefaults(options: {
    timeZone?: string;
    language?: string;
}): LocaleDefaults {
    const timezone = options.timeZone ?? "UTC";

    let currency = "USD";
    try {
        const region = new Intl.Locale(options.language ?? "en").region;
        if (region) currency = CURRENCY_BY_REGION[region] ?? "USD";
    } catch {
        // unsupported language tag — keep USD fallback
    }

    return { timezone, currency };
}