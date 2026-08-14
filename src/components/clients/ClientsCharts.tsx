import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import type { ClientConnection } from "@/types/client";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import CardMain from "@/components/cards/CardMain";

const GENDER_ORDER = ["male", "female", "other"] as const;

const genderFill: Record<string, string> = {
  male: "var(--chart-3)",
  female: "var(--chart-4)",
  other: "var(--chart-1)",
};

const genderConfig = {
  male: { label: "Male", color: "var(--chart-3)" },
  female: { label: "Female", color: "var(--chart-4)" },
  other: { label: "Other", color: "var(--chart-1)" },
} satisfies ChartConfig;

const ageConfig = {
  clients: { label: "Clients", color: "var(--chart-2)" },
} satisfies ChartConfig;

// Age buckets mirrored from ClientCard's dateOfBirth parsing
const AGE_BUCKETS = [
  { key: "under-18", label: "Under 18", min: 0, max: 17 },
  { key: "18-24", label: "18–24", min: 18, max: 24 },
  { key: "25-34", label: "25–34", min: 25, max: 34 },
  { key: "35-44", label: "35–44", min: 35, max: 44 },
  { key: "45-54", label: "45–54", min: 45, max: 54 },
  { key: "55-plus", label: "55+", min: 55, max: 999 },
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
  const genderData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const connection of connections) {
      const gender = normalizeGender(connection.client?.gender);
      counts.set(gender, (counts.get(gender) ?? 0) + 1);
    }
    return GENDER_ORDER.map((gender) => ({
      gender,
      count: counts.get(gender) ?? 0,
      fill: genderFill[gender],
    })).filter((entry) => entry.count > 0);
  }, [connections]);

  const ageData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const connection of connections) {
      const age = ageFromDob(connection.client?.dateOfBirth ?? "");
      if (age === null) continue;
      const bucket = AGE_BUCKETS.find((b) => age >= b.min && age <= b.max);
      if (bucket) counts.set(bucket.key, (counts.get(bucket.key) ?? 0) + 1);
    }
    return AGE_BUCKETS.map((bucket) => ({
      bucket: bucket.label,
      count: counts.get(bucket.key) ?? 0,
    }));
  }, [connections]);

  const total = connections.length;
  const hasGender = genderData.length > 0;
  const hasAge = ageData.some((entry) => entry.count > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Gender split */}
      <CardMain className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Client base by gender</CardTitle>
          <CardDescription>Active clients split by gender</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {!hasGender ? (
            <div className="flex h-[190px] items-center justify-center text-sm text-muted-foreground">
              No clients yet
            </div>
          ) : (
            <>
              <div className="relative mx-auto h-[160px] max-w-[200px]">
                <ChartContainer config={genderConfig} className="h-full w-full">
                  <PieChart accessibilityLayer>
                    <ChartTooltip content={<ChartTooltipContent nameKey="gender" />} />
                    <Pie
                      data={genderData}
                      dataKey="count"
                      nameKey="gender"
                      innerRadius={48}
                      outerRadius={70}
                      paddingAngle={4}
                      strokeWidth={4}
                      stroke="var(--color-card)"
                    >
                      {genderData.map((entry) => (
                        <Cell key={entry.gender} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">{total}</span>
                  <span className="text-xs text-muted-foreground">Clients</span>
                </div>
              </div>
              <ChartLegend content={<ChartLegendContent nameKey="gender" />} />
            </>
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
          {!hasAge ? (
            <div className="flex h-[190px] items-center justify-center text-sm text-muted-foreground">
              No age data yet
            </div>
          ) : (
            <ChartContainer config={ageConfig} className="h-[190px] w-full min-w-0">
              <BarChart
                accessibilityLayer
                data={ageData}
                layout="vertical"
                margin={{ top: 5, right: 16, left: 0, bottom: 5 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                />
                <YAxis
                  type="category"
                  dataKey="bucket"
                  width={90}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="count" fill="var(--color-clients)" radius={6} barSize={18} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </CardMain>
    </div>
  );
}