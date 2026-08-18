import { useMemo } from "react";
import type { ClientConnection } from "@/types/client";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CardMain from "@/components/cards/CardMain";
import { cn } from "@/lib/utils";

const GENDER_ORDER = ["male", "female", "other"] as const;

const genderFill: Record<string, string> = {
  male: "var(--chart-3)",
  female: "var(--chart-4)",
  other: "var(--chart-1)",
};

const genderLabels: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

// Age buckets mirrored from ClientCard's dateOfBirth parsing
const AGE_BUCKETS = [
  { key: "under-18", label: "Under 18", short: "U18", min: 0, max: 17 },
  { key: "18-24", label: "18–24", short: "18–24", min: 18, max: 24 },
  { key: "25-34", label: "25–34", short: "25–34", min: 25, max: 34 },
  { key: "35-44", label: "35–44", short: "35–44", min: 35, max: 44 },
  { key: "45-54", label: "45–54", short: "45–54", min: 45, max: 54 },
  { key: "55-plus", label: "55+", short: "55+", min: 55, max: 999 },
] as const;

function ageFromDob(dob: string): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

function normalizeGender(gender: string | undefined): string {
  const value = (gender || "").toLowerCase();
  if (value.startsWith("male")) return "male";
  if (value.startsWith("female")) return "female";
  return "other";
}

interface ClientsChartsProps {
  connections: ClientConnection[];
}

export function ClientsCharts({ connections }: ClientsChartsProps) {
  const total = connections.length;

  const genderData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const connection of connections) {
      const gender = normalizeGender(connection.client?.gender);
      counts.set(gender, (counts.get(gender) ?? 0) + 1);
    }
    return GENDER_ORDER.map((gender) => ({
      gender,
      label: genderLabels[gender],
      fill: genderFill[gender],
      count: counts.get(gender) ?? 0,
      pct: total > 0 ? (counts.get(gender) ?? 0) / total : 0,
    })).filter((entry) => entry.count > 0);
  }, [connections, total]);

  const ageData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const connection of connections) {
      const age = ageFromDob(connection.client?.dateOfBirth ?? "");
      if (age === null) continue;
      const bucket = AGE_BUCKETS.find((b) => age >= b.min && age <= b.max);
      if (bucket) counts.set(bucket.key, (counts.get(bucket.key) ?? 0) + 1);
    }
    const entries = AGE_BUCKETS.map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      short: bucket.short,
      count: counts.get(bucket.key) ?? 0,
    }));
    const maxCount = Math.max(0, ...entries.map((entry) => entry.count));
    return entries.map((entry) => ({
      ...entry,
      pct: total > 0 ? entry.count / total : 0,
      isMax: entry.count > 0 && entry.count === maxCount,
    }));
  }, [connections, total]);

  const hasGender = genderData.length > 0;
  const hasAge = ageData.some((entry) => entry.count > 0);
  const ageCounted = ageData.reduce((sum, entry) => sum + entry.count, 0);
  const peak = Math.max(1, ...ageData.map((entry) => entry.count));

  const topGender = genderData.reduce<typeof genderData[number] | null>(
    (top, entry) => (top === null || entry.count > top.count ? entry : top),
    null,
  );
  const topBucket = ageData.reduce<typeof ageData[number] | null>(
    (top, entry) => (top === null || entry.count > top.count ? entry : top),
    null,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Gender split */}
      <CardMain className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Client base by gender</CardTitle>
          <CardDescription>Active clients split by gender</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {!hasGender || !topGender ? (
            <div className="flex h-[190px] items-center justify-center text-sm text-muted-foreground">
              No clients yet
            </div>
          ) : (
            <div className="flex h-full flex-col justify-center gap-5">
              <div
                className="flex h-4 w-full overflow-hidden rounded-full bg-muted/70"
                role="img"
                aria-label="Share of active clients per gender"
              >
                {genderData.map((entry) => (
                  <div
                    key={entry.gender}
                    title={`${entry.label} — ${entry.count} client${entry.count === 1 ? "" : "s"}`}
                    style={{ width: `${entry.pct * 100}%`, backgroundColor: entry.fill }}
                  />
                ))}
              </div>

              <ul className="space-y-3">
                {genderData.map((entry) => (
                  <li key={entry.gender} className="flex items-center gap-3">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: entry.fill }}
                    />
                    <span className="w-16 shrink-0 text-sm font-semibold text-foreground">
                      {entry.label}
                    </span>
                    <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${entry.pct * 100}%`, backgroundColor: entry.fill }}
                      />
                    </span>
                    <span className="shrink-0 text-sm tabular-nums">
                      <span className="font-bold text-foreground">{entry.count}</span>
                      <span className="text-muted-foreground"> · {Math.round(entry.pct * 100)}%</span>
                    </span>
                  </li>
                ))}
              </ul>

              <span className="inline-flex items-center gap-2 self-start rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: topGender.fill }} />
                Largest group · {topGender.label} · {Math.round(topGender.pct * 100)}%
              </span>
            </div>
          )}
        </CardContent>
      </CardMain>

      {/* Age buckets */}
      <CardMain className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Client base by age</CardTitle>
          <CardDescription>Active clients grouped by age range</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {!hasAge || !topBucket ? (
            <div className="flex h-[190px] items-center justify-center text-sm text-muted-foreground">
              No age data yet
            </div>
          ) : (
            <div className="flex h-full flex-col justify-between gap-4">
              <div
                className="grid grid-cols-6 gap-1.5 sm:gap-2"
                role="img"
                aria-label="Active clients by age bucket"
              >
                {ageData.map((entry) => (
                  <div
                    key={entry.key}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl px-0.5 pb-2 pt-1.5 transition-colors",
                      entry.isMax && "bg-brand/10 ring-1 ring-brand/40",
                    )}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {entry.short}
                    </span>
                    <div
                      className="flex h-14 items-end"
                      title={`${entry.label}: ${entry.count} client${entry.count === 1 ? "" : "s"}`}
                    >
                      <div
                        className={cn(
                          "w-full rounded-t-md transition-all duration-500",
                          entry.count > 0 ? "bg-brand" : "bg-muted",
                        )}
                        style={{
                          height: `${Math.max(entry.count > 0 ? 12 : 4, Math.round((entry.count / peak) * 100))}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold tabular-nums text-muted-foreground">
                      {entry.count}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="tabular-nums">
                  {ageCounted} client{ageCounted === 1 ? "" : "s"} with age on file
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-bold text-muted-foreground">
                  Most common · {topBucket.label}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </CardMain>
    </div>
  );
}