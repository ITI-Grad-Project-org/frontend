import { useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  MessageCircleMore,
  RefreshCw,
  Send,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@/components/ui/message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCoachChat } from "@/hooks/coach/useCoachChat";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

// function formatMessageTime(timestamp: string) {
//   return new Date(timestamp).toLocaleTimeString(undefined, {
//     hour: "numeric",
//     minute: "2-digit",
//   });
// }
function formatMessageTime(timestamp: string) {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short", // "Jul"
    day: "numeric", // "30"
    hour: "numeric",
    minute: "2-digit",
  });
}
function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim() || "C";
}

export default function Chat() {
  const coach = useAuthStore((state) => state.user);
  const { clientId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const {
    conversations,
    clientConnection,
    messages,
    draft,
    setDraft,
    selectedConversation,
    displayedClient,
    isLoadingConversations,
    isLoadingThread,
    isSending,
    socketState,
    error,
    sendMessage,
    retryFailedMessage,
  } = useCoachChat(clientId);

  const visibleConversations = useMemo(() => conversations.slice(0, 20), [conversations]);

  const unreadConversations = conversations.filter((conversation) => (conversation.unreadCount ?? 0) > 0).length;
  const headerName = displayedClient
    ? `${displayedClient.firstName} ${displayedClient.lastName}`.trim()
    : "Select a client";
  const headerEmail = displayedClient?.email ?? "Choose a thread from the left panel or open one from Clients.";
  const canSend = Boolean(clientId && displayedClient);
  const coachAvatarUrl = coach?.avatarUrl ?? "";
  const coachInitials = getInitials(coach?.firstName, coach?.lastName) || "CO";

  useEffect(() => {
    if (!clientId) {
      return;
    }

    const raf = window.requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
    });

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [clientId, messages.length, isLoadingThread]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden md:gap-6">
      <div className="hidden md:flex flex-col gap-3 rounded-4xl border border-border/80 bg-card/90 p-4 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/80 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1.5">
                <MessageCircleMore className="h-3.5 w-3.5" />
                Coach chat
              </Badge>
              <Badge variant={socketState === "connected" ? "default" : "outline"} className="gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                {socketState}
              </Badge>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">{headerName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{headerEmail}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
              <UsersRound className="h-3.5 w-3.5" />
              {conversations.length} threads
            </Badge>
            <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
              {unreadConversations} unread
            </Badge>
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/clients")}>
              Back to clients
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="grid min-h-0 flex-1 gap-6 overflow-hidden lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside
          className={cn(
            "min-h-0 flex-col overflow-hidden rounded-4xl border border-border/80 bg-card shadow-sm",
            clientId ? "hidden lg:flex" : "flex",
          )}
        >
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Conversations</p>
              <p className="text-xs text-muted-foreground">Recent client threads and last messages</p>
            </div>
            <Badge variant="outline">
              {isLoadingConversations ? "Loading" : visibleConversations.length}
            </Badge>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="flex min-h-0 flex-col gap-2 p-3">
              {isLoadingConversations ? (
                <div className="space-y-3 p-2">
                  <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
                  <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
                  <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
                </div>
              ) : visibleConversations.length === 0 ? (
                <div className="flex min-h-48 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/70 bg-muted/20 px-6 text-center">
                  <p className="text-sm font-semibold text-foreground">No conversations yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Once a client sends a message, the thread will appear here.
                  </p>
                </div>
              ) : (
                visibleConversations.map((conversation) => {
                  const isActive = conversation.clientId === clientId;
                  const fullName = `${conversation.client.firstName} ${conversation.client.lastName}`.trim();
                  const preview = conversation.lastMessage?.body ?? "No messages yet";
                  const unreadCount = conversation.unreadCount ?? 0;

                  return (
                    <Link
                      key={conversation.clientId}
                      to={`/dashboard/chat/${conversation.clientId}`}
                      className={cn(
                        "flex items-start gap-3 rounded-[1.5rem] border px-4 py-3 transition-all hover:shadow-sm",
                        isActive
                          ? "border-brand/30 bg-primary/5"
                          : "border-transparent bg-muted/20 hover:bg-muted/40",
                      )}
                    >
                      <Avatar className="h-11 w-11 border border-border">
                        <AvatarImage src={conversation.client.avatarUrl ?? ""} alt={fullName} />
                        <AvatarFallback className="bg-muted text-xs font-bold text-muted-foreground">
                          {getInitials(conversation.client.firstName, conversation.client.lastName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
                          {conversation.lastMessage && (
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                              {formatMessageTime(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{preview}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge
                            variant={conversation.lastMessage?.senderType === "coach" ? "outline" : "secondary"}
                          >
                            {conversation.lastMessage?.senderType === "coach" ? "You" : "Client"}
                          </Badge>
                          {unreadCount > 0 && <Badge>{unreadCount} unread</Badge>}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </aside>

        <section
          className={cn(
            "min-h-0 flex-col overflow-hidden rounded-4xl border border-border/80 bg-card shadow-sm",
            clientId ? "flex" : "hidden lg:flex",
          )}
        >
          <div className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-1 shrink-0 px-2 lg:hidden"
                onClick={() => navigate("/dashboard/chat")}
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-12 w-12 border border-border">
                <AvatarImage src={clientConnection?.client.avatarUrl ?? displayedClient?.avatarUrl ?? ""} alt={headerName} />
                <AvatarFallback className="bg-muted text-sm font-bold text-muted-foreground">
                  {getInitials(displayedClient?.firstName, displayedClient?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-foreground">{headerName}</p>
                <p className="truncate text-sm text-muted-foreground">{headerEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* <Badge variant="outline">
                {isLoadingThread ? "Loading thread" : `${messages.length} messages`}
              </Badge> */}
              {selectedConversation?.lastMessage && (
                <Badge variant="outline" className="hidden sm:inline-flex">
                  Last update {formatMessageTime(selectedConversation.lastMessage.createdAt)}
                </Badge>
              )}
            </div>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="flex min-h-full flex-col gap-5 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--color-foreground)_4%,transparent),transparent_44%)] p-5">
              {isLoadingThread ? (
                <div className="space-y-4">
                  <div className="ml-auto h-16 w-3/4 animate-pulse rounded-[1.5rem] bg-muted/60" />
                  <div className="h-20 w-2/3 animate-pulse rounded-[1.5rem] bg-muted/60" />
                  <div className="ml-auto h-14 w-1/2 animate-pulse rounded-[1.5rem] bg-muted/60" />
                </div>
              ) : !clientId ? (
                <div className="flex min-h-112 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border/70 bg-muted/20 px-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MessageCircleMore className="h-7 w-7" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Pick a client thread</h2>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Open a client from the list on the left, or press the message button on any active client card.
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex min-h-112 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border/70 bg-muted/20 px-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MessageCircleMore className="h-7 w-7" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Start the conversation</h2>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Send a helpful first message to kick off the thread with this client.
                  </p>
                </div>
              ) : (
                <MessageGroup className="gap-4">
                  {messages.map((message) => {
                    const isCoach = message.senderType === "coach";
                    const senderLabel = isCoach ? "You" : headerName;

                    return (
                      <Message key={message.id} align={isCoach ? "end" : "start"} className="items-end">
                        <MessageAvatar className={cn("h-11 w-11 border border-border", isCoach && "bg-primary/10")}>
                          <Avatar className="h-full w-full">
                            <AvatarImage
                              src={isCoach ? coachAvatarUrl : clientConnection?.client.avatarUrl ?? displayedClient?.avatarUrl ?? ""}
                              alt={senderLabel}
                            />
                            <AvatarFallback className={cn("text-xs font-bold", isCoach ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                              {isCoach ? coachInitials : getInitials(displayedClient?.firstName, displayedClient?.lastName)}
                            </AvatarFallback>
                          </Avatar>
                        </MessageAvatar>

                        <MessageContent className={cn("max-w-[min(36rem,92%)] w-fit", isCoach && "items-end")}>
                          <div
                            className={cn(
                              "rounded-[1.5rem] border px-4 py-3 shadow-sm",
                              isCoach
                                ? "border-transparent bg-ink text-ink-foreground"
                                : "border-border bg-card",
                              message.localStatus === "failed" && "border-destructive/30 bg-destructive/5",
                            )}
                          >
                            {!isCoach && (
                              <MessageHeader className="px-0 pb-2 text-[11px] uppercase text-current/70">
                                {senderLabel}
                              </MessageHeader>
                            )}
                            <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>
                            <MessageFooter className="px-0 pt-2 text-[11px] text-current/70">
                              <span>{formatMessageTime(message.createdAt)}</span>
                              {isCoach && message.localStatus !== "failed" && (
                                <span className={cn("ml-1", message.readAt ? "text-info" : "text-current/50")}>
                                  {message.readAt ? (
                                    // Double tick (read) — both strokes blue
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 12" className="inline h-[14px] w-[20px] align-[-1px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-label="Read">
                                      <polyline points="1,6 5,10 13,2" />
                                      <polyline points="6,6 10,10 18,2" />
                                    </svg>
                                  ) : (
                                    // Single tick (sent) — grey
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 12" className="inline h-[14px] w-[14px] align-[-1px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-label="Sent">
                                      <polyline points="1,6 5,10 13,2" />
                                    </svg>
                                  )}
                                </span>
                              )}
                              {message.localStatus === "failed" && (
                                <button
                                  type="button"
                                  onClick={() => retryFailedMessage(message.clientMsgId ?? message.id)}
                                  className="ml-2 inline-flex items-center gap-1 font-semibold underline underline-offset-4"
                                >
                                  Retry
                                </button>
                              )}
                            </MessageFooter>
                          </div>
                        </MessageContent>
                      </Message>
                    );
                  })}
                </MessageGroup>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator />

          <div className="border-t border-border/70 bg-background/90 p-4 backdrop-blur">
            <div className="rounded-[1.75rem] border border-border/80 bg-card p-3 shadow-sm">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" || event.shiftKey) {
                    return;
                  }

                  event.preventDefault();

                  if (canSend && draft.trim()) {
                    void sendMessage();
                  }
                }}
                placeholder={clientId ? "Write a message to your client..." : "Select a client to start chatting"}
                disabled={!canSend || isSending}
                className="min-h-12 border-0 bg-transparent px-2 py-2 text-sm shadow-none focus-visible:ring-0"
              />

              <div className="mt-3 flex items-center justify-end gap-3">
                <Button
                  onClick={() => {
                    void sendMessage();
                  }}
                  disabled={!canSend || isSending || !draft.trim()}
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Sending
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
