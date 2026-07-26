import { useState } from "react";
import { Trash2, Dumbbell, User2Icon, Utensils, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import CardMain from "./CardMain";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { ClientConnection } from "@/types/client";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { deleteClient } from "@/services/clients";

interface ClientCardProps {
  connection: ClientConnection;
  onDeleted?: () => void | Promise<void>;
  onCreatePlan?: (connection: ClientConnection) => void;
}

function ClientCard({ connection, onDeleted, onCreatePlan }: ClientCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    onCreatePlan?.(connection);
    if (!onCreatePlan) {
      toast.info(`Creating custom plan for ${fullName}`);
    }
  };

  const handleCreateNutrition = () => {
    toast.info(`Creating custom nutrition for ${fullName}`);
  };

  const handleDeleteClient = async () => {
    setIsDeleting(true);

    try {
      await deleteClient(connection.id);
      toast.success(`${fullName} was removed from your tenant.`);
      setIsDeleteDialogOpen(false);
      await onDeleted?.();
    } catch (error) {
      console.error(error);
      toast.error("We could not remove this client. Please try again.");
    } finally {
      setIsDeleting(false);
    }
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
        <div className="flex justify-between">
          <Avatar className="w-16 h-16 border-2 border-border shadow-sm shrink-0">
            <AvatarImage src={client.avatarUrl || ""} className="object-cover" />
            <AvatarFallback className="bg-muted text-muted-foreground">
              <User2Icon className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-destructive/20 bg-destructive/5 text-destructive transition hover:bg-destructive/10 active:scale-[0.98]"
            aria-label="Remove client"
            title="Remove client"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4 items-center min-w-0">
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
            <span className="text-lg font-bold text-foreground">{client.weightKg ? `${client.weightKg} KG` : "N/A"}</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
        <button
          onClick={handleCreatePlan}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold cursor-pointer bg-ink text-ink-foreground rounded-xl hover:opacity-90 active:scale-[0.98] transition-all border border-transparent shadow-sm"
        >
          <Dumbbell className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span className="whitespace-nowrap">Custom plan</span>
        </button>
        <button
          onClick={handleCreateNutrition}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold cursor-pointer bg-brand text-brand-foreground rounded-xl hover:opacity-90 active:scale-[0.98] transition-all border border-transparent shadow-sm"
        >
          <Utensils className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span className="whitespace-nowrap">Custom nutrition</span>
        </button>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Remove this client?"
        description="This will remove the client from your tenant only. Their account will stay active."
        confirmLabel="Remove client"
        cancelLabel="Cancel"
        isConfirming={isDeleting}
        onConfirm={handleDeleteClient}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </CardMain>
  );
}

export default ClientCard;
