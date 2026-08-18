import { useState } from "react";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MediaLightbox } from "@/components/ui/MediaLightbox";
import type { ClientConnection } from "@/types/client";

function formatDate(isoStr: string | null | undefined): string {
  if (!isoStr) return "—";
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return isoStr;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

interface ClientInfoCardProps {
  client: ClientConnection | null;
  membershipId: string;
}

export function ClientInfoCard({ client, membershipId }: ClientInfoCardProps) {
  const clientDetail = client?.client;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const clientName = clientDetail ? `${clientDetail.firstName} ${clientDetail.lastName}` : "Client";
  const avatarUrl = clientDetail?.avatarUrl;

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <button
              type="button"
              onClick={() => setPreviewUrl(avatarUrl)}
              className="group shrink-0 rounded-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label={`View ${clientName}'s photo`}
              title={`View ${clientName}'s photo`}
            >
              <Avatar className="size-10 border border-border/60 transition group-hover:opacity-85">
                <AvatarImage src={avatarUrl} alt={clientName} className="object-cover" />
                <AvatarFallback className="bg-brand/10 text-brand">
                  <User className="size-5" />
                </AvatarFallback>
              </Avatar>
            </button>
          ) : (
            <Avatar className="size-10 border border-border/60">
              <AvatarFallback className="bg-brand/10 text-brand">
                <User className="size-5" />
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <h2 className="font-bold text-foreground">Client Information</h2>
            <p className="text-xs text-muted-foreground">Assigned client details</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="block text-xs font-medium text-muted-foreground">Name</span>
          <span className="font-semibold text-foreground">
            {clientDetail ? `${clientDetail.firstName} ${clientDetail.lastName}` : `Client ID: ${membershipId.slice(0, 8)}`}
          </span>
        </div>
        <div>
          <span className="block text-xs font-medium text-muted-foreground">Email</span>
          <span className="font-semibold text-foreground wrap-break-word">{clientDetail?.email || "—"}</span>
        </div>
        <div>
          <span className="block text-xs font-medium text-muted-foreground">Phone</span>
          <span className="font-semibold text-foreground">{clientDetail?.phone || "—"}</span>
        </div>
        <div>
          <span className="block text-xs font-medium text-muted-foreground">Gender / DOB</span>
          <span className="font-semibold text-foreground">
            {clientDetail?.gender ? clientDetail.gender.toUpperCase() : "—"}{" "}
            {clientDetail?.dateOfBirth ? `(${formatDate(clientDetail.dateOfBirth)})` : ""}
          </span>
        </div>
        <div>
          <span className="block text-xs font-medium text-muted-foreground">Height / Weight</span>
          <span className="font-semibold text-foreground">
            {clientDetail?.heightCm ? `${clientDetail.heightCm} cm` : "—"} /{" "}
            {clientDetail?.weightKg ? `${clientDetail.weightKg} kg` : "—"}
          </span>
        </div>
        <div>
          <span className="block text-xs font-medium text-muted-foreground">Joined At</span>
          <span className="font-semibold text-foreground">
            {client?.joinedAt ? formatDate(client.joinedAt) : "—"}
          </span>
        </div>
      </div>

      {previewUrl && (
        <MediaLightbox src={previewUrl} alt={clientName} onClose={() => setPreviewUrl(null)} />
      )}
    </section>
  );
}
