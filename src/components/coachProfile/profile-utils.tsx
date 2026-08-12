import { Link2 } from "lucide-react";

export function specialtyLabel(value: string) {
  const labels: Record<string, string> = {
    strength: "Strength",
    hypertrophy: "Hypertrophy",
    endurance: "Endurance",
    weight_loss: "Weight loss",
    mobility: "Mobility",
    powerlifting: "Powerlifting",
    crossfit: "CrossFit",
    calisthenics: "Calisthenics",
    postpartum: "Postpartum",
    yoga: "Yoga",
    nutrition: "Nutrition",
    rehab: "Rehab",
    general_fitness: "General fitness",
  };
  return labels[value] ?? value;
}

export function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function genderLabel(value: string | null | undefined) {
  if (!value) return null;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function socialIcon() {
  return <Link2 className="w-4 h-4" />;
}