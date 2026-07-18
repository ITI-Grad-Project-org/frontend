import CardMain from "./Cards/CardMain";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dumbbell, User2Icon, Utensils, Mail, Phone, Calendar } from "lucide-react";
import type { ClientConnection } from "@/types/client";
import { toast } from "react-toastify";

interface ClientCardProps {
  connection: ClientConnection;
}

function ClientCard({ connection }: ClientCardProps) {
  if (!connection || !connection.client) {
    return null;
  }
  const { client, status, joinedAt } = connection;
  const fullName = `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Unknown Client";

  // Calculate age from dateOfBirth
  const calculateAge = (dobString: string) => {
    if (!dobString) return "";
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} yrs`;
  };

  const ageStr = calculateAge(client.dateOfBirth);
  const genderCapitalized = client.gender ? client.gender.charAt(0).toUpperCase() + client.gender.slice(1) : "";
  const infoText = [genderCapitalized, ageStr].filter(Boolean).join(" · ");

  // Format joined date
  const joinedDateStr = joinedAt
    ? new Date(joinedAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : "";

  const handleCreatePlan = () => {
    toast.info(`Creating custom plan for ${fullName}`);
  };

  const handleCreateNutrition = () => {
    toast.info(`Creating custom nutrition for ${fullName}`);
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "blocked":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
  };

  return (
    <CardMain className="w-full flex flex-col justify-between gap-5 p-6 transition-all duration-300 hover:shadow-lg border border-border bg-card rounded-3xl">
      <div className="flex flex-col gap-4">
        {/* Top row: Avatar & Name */}
        <div className="flex gap-4 items-center">
          <Avatar className="w-16 h-16 border-2 border-border shadow-sm shrink-0">
            <AvatarImage src={client.avatarUrl || ""} className="object-cover" />
            <AvatarFallback className="bg-muted text-muted-foreground">
              <User2Icon className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xl font-bold tracking-tight text-foreground max-w-37.5 sm:max-w-none" title={fullName}>
                {fullName}
              </p>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadgeStyles(
                  status
                )}`}
              >
                {status}
              </span>
            </div>
            {infoText && <p className="text-sm font-medium text-muted-foreground">{infoText}</p>}
          </div>
        </div>

        {/* Contact details & joined date */}
        <div className="flex flex-col gap-2.5 py-2.5 border-t border-b border-border/60">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground/90 min-w-0">
            <Mail className="w-4 h-4 text-muted-foreground/75 shrink-0" />
            <span className="truncate" title={client.email}>
              {client.email}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground/90 min-w-0">
            <Phone className="w-4 h-4 text-muted-foreground/75 shrink-0" />
            <span className="truncate">{client.phone}</span>
          </div>
          {joinedDateStr && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground/90 min-w-0">
              <Calendar className="w-4 h-4 text-muted-foreground/75 shrink-0" />
              <span>Joined {joinedDateStr}</span>
            </div>
          )}
        </div>

        {/* Weight & Height stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-start gap-1 p-3 bg-muted/40 rounded-2xl border border-border/40">
            <span className="text-xs font-semibold text-muted-foreground">Weight</span>
            <span className="text-lg font-bold text-foreground">N/A</span>
          </div>
          <div className="flex flex-col items-start gap-1 p-3 bg-muted/40 rounded-2xl border border-border/40">
            <span className="text-xs font-semibold text-muted-foreground">Height</span>
            <span className="text-lg font-bold text-foreground">
              {client.heightCm ? `${client.heightCm} cm` : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1  gap-3 mt-2">
        <button
          onClick={handleCreatePlan}
          className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold cursor-pointer bg-ink text-ink-foreground rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all border border-transparent shadow-sm"
        >
          <Dumbbell className="w-4 h-4" strokeWidth={2.5} />
          <span className="whitespace-nowrap">Custom plan</span>
        </button>
        <button
          onClick={handleCreateNutrition}
          className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold cursor-pointer bg-brand text-brand-foreground rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all border border-transparent shadow-sm"
        >
          <Utensils className="w-4 h-4" strokeWidth={2.5} />
          <span className="whitespace-nowrap">Custom nutrition</span>
        </button>
      </div>
    </CardMain>
  );
}

export default ClientCard;