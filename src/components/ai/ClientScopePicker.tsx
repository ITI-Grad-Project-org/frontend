import { useMemo } from "react";
import { ChevronDown, User, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClientsData } from "@/hooks/clients/useClientsData";
import { cn } from "@/lib/utils";

export interface ScopedClient {
  membershipId: string;
  name: string;
  avatarUrl?: string | null;
}

interface ClientScopePickerProps {
  value: ScopedClient | null;
  onChange: (client: ScopedClient | null) => void;
  disabled?: boolean;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ClientScopePicker({
  value,
  onChange,
  disabled,
}: ClientScopePickerProps) {
  const { clients: clientsState } = useClientsData();
  const rawClients = clientsState.data;
  const isLoading = clientsState.loading;

  const clients = useMemo(() => {
    return (rawClients ?? [])
      .filter((c) => c && c.client)
      .map((c) => ({
        membershipId: c.id,
        name:
          `${c.client.firstName ?? ""} ${c.client.lastName ?? ""}`.trim() ||
          c.client.email ||
          "Client",
        avatarUrl: c.client.avatarUrl,
      }));
  }, [rawClients]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || (isLoading && clients.length === 0)}
          className={cn(
            "h-7 gap-1.5 rounded-full px-2.5 text-xs font-medium",
            value
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border/60 text-muted-foreground",
          )}
        >
          {value ? <User className="h-3 w-3" /> : <Users className="h-3 w-3" />}
          {value ? `About ${value.name}` : "Ask about a client"}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuItem
          onClick={() => onChange(null)}
          className="gap-2 text-xs"
        >
          <Users className="h-3.5 w-3.5" />
          <div>
            <p className="font-medium">All clients</p>
            <p className="text-muted-foreground">
              Your library and coaching corpus only
            </p>
          </div>
          {!value && (
            <span className="ml-auto text-primary">&#10003;</span>
          )}
        </DropdownMenuItem>
        {clients.length === 0 ? (
          <div className="px-3 py-2 text-xs text-muted-foreground text-center">
            {isLoading ? "Loading clients…" : "No active clients found"}
          </div>
        ) : (
          clients.map((c) => (
            <DropdownMenuItem
              key={c.membershipId}
              onClick={() => onChange(c)}
              className="gap-2 text-xs"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={c.avatarUrl ?? ""} alt={c.name} />
                <AvatarFallback className="text-[9px]">
                  {getInitials(c.name)}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{c.name}</span>
              {value?.membershipId === c.membershipId && (
                <span className="text-primary">&#10003;</span>
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
