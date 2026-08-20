import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  Dumbbell,
  Globe,
  Mail,
  MessageCircleMore,
  Phone,
  Scale,
  UserRound,
  Utensils,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MediaLightbox } from "@/components/ui/MediaLightbox";
import CardMain from "@/components/cards/CardMain";
import { CreatePlanModal } from "@/components/modals/plans/CreatePlanModal";
import { CreateNutritionPlanModal } from "@/components/modals/nutritionPlans/CreateNutritionPlanModal";
import { MeasurementsPanel } from "@/components/clients/MeasurementsPanel";
import { ClientStrengthOutcomes } from "@/components/clients/ClientStrengthOutcomes";
import { useClientProfile } from "@/hooks/clients/useClientProfile";

function calculateAge(dob: string): number | null {
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

function getStatusBadgeStyles(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-success/10 text-success border-success/20";
    case "blocked":
      return "bg-danger/10 text-danger border-danger/20";
    default:
      return "bg-warn/10 text-warn border-warn/20";
  }
}

function formatDate(iso: string | null | undefined, withYear = true): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: withYear ? "numeric" : undefined,
    month: "short",
    day: "numeric",
  });
}

export default function ClientProfile() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { connection, loading, error, refetch } = useClientProfile(clientId ?? "");
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-200">
        <div className="flex items-center gap-4">
          <div className="h-11 w-20 rounded-xl bg-muted/60 animate-pulse" />
          <div className="h-16 w-16 rounded-2xl bg-muted/60 animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-32 rounded bg-muted/60 animate-pulse" />
          </div>
        </div>
        <CardMain className="min-h-64 items-center justify-center text-sm text-muted-foreground">
          Loading client profile…
        </CardMain>
      </div>
    );
  }

  if (error || !connection) {
    return (
      <CardMain className="items-center justify-center py-14 text-center">
        <p className="text-lg font-medium text-destructive">{error || "Client not found"}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-ink-foreground transition hover:opacity-90 cursor-pointer"
        >
          Retry
        </button>
        <button
          type="button"
          onClick={() => navigate("/dashboard/clients")}
          className="mt-2 text-sm font-semibold text-brand hover:underline cursor-pointer"
        >
          Back to clients
        </button>
      </CardMain>
    );
  }

  const { client, status, joinedAt, createdAt, lastActiveAt } = connection;
  const fullName = `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Unknown Client";
  const age = calculateAge(client.dateOfBirth);
  const heightM = client.heightCm ? client.heightCm / 100 : null;
  const weight = client.weightKg != null ? Number(client.weightKg) : null;
  const bmi = heightM && weight ? (weight / (heightM * heightM)).toFixed(1) : null;
  const genderLabel = client.gender
    ? client.gender.charAt(0).toUpperCase() + client.gender.slice(1)
    : "—";

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Back row */}
      <button
        type="button"
        onClick={() => navigate("/dashboard/clients")}
        className="flex w-fit items-center gap-2 rounded-xl border border-border bg-background/70 px-3.5 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground hover:bg-muted/60 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to clients
      </button>

      {/* Header card */}
      <CardMain className="gap-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            {client.avatarUrl ? (
              <button
                type="button"
                onClick={() => setIsAvatarPreviewOpen(true)}
                className="group shrink-0 rounded-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label={`View ${fullName}'s photo`}
                title={`View ${fullName}'s photo`}
              >
                <Avatar className="h-20 w-20 shrink-0 border-2 border-border shadow-sm transition group-hover:opacity-85">
                  <AvatarImage src={client.avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <UserRound className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
              </button>
            ) : (
              <Avatar className="h-20 w-20 shrink-0 border-2 border-border shadow-sm">
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <UserRound className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-black font-display tracking-tight text-foreground">
                  {fullName}
                </h1>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${getStatusBadgeStyles(
                    status
                  )}`}
                >
                  {status}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground truncate">{client.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground/80">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {formatDate(joinedAt || createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  Last active {formatDate(lastActiveAt)}
                </span>
                {client.timezone && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    {client.timezone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/chat/${client.id}`)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-4 text-sm font-semibold text-foreground transition hover:bg-muted/70 cursor-pointer"
            >
              <MessageCircleMore className="h-4 w-4" strokeWidth={2.5} />
              Message
            </button>
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-ink-foreground transition hover:opacity-90 cursor-pointer"
            >
              <Dumbbell className="h-4 w-4" strokeWidth={2.5} />
              Custom plan
            </button>
            <button
              type="button"
              onClick={() => setIsNutritionModalOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground transition hover:opacity-90 cursor-pointer"
            >
              <Utensils className="h-4 w-4" strokeWidth={2.5} />
              Custom nutrition
            </button>
          </div>
        </div>
      </CardMain>

      {/* Profile stats */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <CardMain className="gap-4 xl:col-span-1">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Contact</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2.5 text-muted-foreground/90 min-w-0">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground/75" />
              <span className="truncate" title={client.email}>{client.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground/90 min-w-0">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground/75" />
              <span className="truncate">{client.phone || "—"}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl bg-muted/40 border border-border/50 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Timezone
              </span>
              <span className="font-semibold text-foreground">{client.timezone || "—"}</span>
            </div>
          </div>
        </CardMain>

        <CardMain className="gap-4 xl:col-span-2">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Vitals</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <div className="flex flex-col gap-1 rounded-2xl border border-border/50 bg-muted/40 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Gender</span>
              <span className="text-base font-extrabold text-foreground">{genderLabel}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-border/50 bg-muted/40 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Age</span>
              <span className="text-base font-extrabold text-foreground">{age ?? "—"}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-border/50 bg-muted/40 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Height</span>
              <span className="text-base font-extrabold text-foreground">
                {client.heightCm ? `${client.heightCm} cm` : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-border/50 bg-muted/40 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Weight</span>
              <span className="text-base font-extrabold text-foreground">
                {weight != null ? `${weight} kg` : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-border/50 bg-muted/40 p-3.5 sm:col-span-3">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Scale className="h-3 w-3" />
                BMI
              </span>
              <span className="text-base font-extrabold text-foreground">{bmi ?? "—"}</span>
            </div>
          </div>
        </CardMain>
      </div>

      <MeasurementsPanel clientId={connection.client.id} />

      <ClientStrengthOutcomes membershipId={connection.id} />

      <CreatePlanModal
        open={isPlanModalOpen}
        clients={[connection]}
        selectedClientId={connection.id}
        onClose={() => setIsPlanModalOpen(false)}
        onCreated={(draft) => {
          navigate(`/dashboard/plans/${draft.id}`, {
            state: { clientName: fullName },
          });
        }}
      />

      <CreateNutritionPlanModal
        open={isNutritionModalOpen}
        clients={[connection]}
        selectedClientId={connection.id}
        onClose={() => setIsNutritionModalOpen(false)}
        onCreated={(draft) => {
          navigate(`/dashboard/nutrition-plans/${draft.id}`, {
            state: { clientName: fullName },
          });
        }}
      />

      {isAvatarPreviewOpen && client.avatarUrl && (
        <MediaLightbox
          src={client.avatarUrl}
          alt={fullName}
          onClose={() => setIsAvatarPreviewOpen(false)}
        />
      )}
    </div>
  );
}