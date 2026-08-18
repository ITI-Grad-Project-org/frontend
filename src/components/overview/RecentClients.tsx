import { Link } from "react-router";
import { ArrowRight, MessageCircleMore } from "lucide-react";
import CardMain from "@/components/cards/CardMain";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ClientConnection } from "@/types/client";

function clientName(connection: ClientConnection): string {
  const { firstName, lastName, email } = connection.client;
  return `${firstName ?? ""} ${lastName ?? ""}`.trim() || email;
}

function clientInitials(connection: ClientConnection): string {
  const { firstName, lastName } = connection.client;
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "C";
}

function describeActive(ts: number | undefined, connection: ClientConnection): string {
  const time = ts ?? (connection.lastActiveAt ? new Date(connection.lastActiveAt).getTime() : Number.NaN);
  if (!Number.isFinite(time)) return "never been active";
  const diff = Date.now() - time;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "active just now";
  if (minutes < 60) return `active ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `active ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `active ${days}d ago`;
  return `last active ${new Date(time).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;
}

export function RecentClients({
  clients,
  lastSeenMs,
  loading,
}: {
  clients: ClientConnection[];
  lastSeenMs: Map<string, number>;
  loading: boolean;
}) {
  const rows = [...clients]
    .sort((a, b) => {
      const at = lastSeenMs.get(a.id) ?? (a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : -1);
      const bt = lastSeenMs.get(b.id) ?? (b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : -1);
      return bt - at;
    })
    .slice(0, 5);

  return (
    <CardMain className="h-full justify-start md:col-span-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">Clients</p>
          <h3 className="mt-1 text-lg font-black font-display tracking-tight text-foreground">
            Recently active
          </h3>
        </div>
        <Link
          to="/dashboard/clients"
          aria-label="View all clients"
          className="icon-btn hover:bg-muted"
        >
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-2xl bg-muted/60" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          No active clients yet — invite someone to get started.
        </div>
      ) : (
        <ul className="flex flex-col">
          {rows.map((connection) => (
            <li
              key={connection.id}
              className="flex items-center gap-3 rounded-2xl px-1.5 py-2 transition hover:bg-muted/60"
            >
              <Avatar
                className="size-9"
                aria-label={clientName(connection)}
              >
                {connection.client.avatarUrl ? (
                  <AvatarImage src={connection.client.avatarUrl} alt={clientName(connection)} />
                ) : null}
                <AvatarFallback>{clientInitials(connection)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {clientName(connection)}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1.5 shrink-0 rounded-full bg-success" />
                  <span className="truncate">
                    {describeActive(lastSeenMs.get(connection.id), connection)}
                  </span>
                </p>
              </div>
              <Link
                to={`/dashboard/chat/${connection.client.id}`}
                aria-label={`Message ${clientName(connection)}`}
                className="icon-btn hover:bg-chip-mint hover:text-success"
              >
                <MessageCircleMore className="size-4" />
              </Link>
              <Link
                to={`/dashboard/clients/${connection.id}`}
                aria-label={`Open ${clientName(connection)}`}
                className="icon-btn hover:bg-muted"
              >
                <ArrowRight className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CardMain>
  );
}