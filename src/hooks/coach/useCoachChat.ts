import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getApiErrorMessage } from "@/lib/api";
import {
  getCoachConversationMessages,
  getCoachConversations,
  markCoachConversationRead,
  sendCoachMessage,
} from "@/services/chat";
import { getClientById } from "@/services/clients";
import { useAuthStore } from "@/stores/auth-store";
import type { ClientConnection } from "@/types/client";
import type { ChatMessage, ConversationSummary } from "@/types/chat";

export type ChatThreadMessage = ChatMessage & {
  localStatus?: "sending" | "failed";
};

type SocketAck<T> = { ok: true; data?: T } | { ok: false; error: string };

const socketBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? "https://api.20.54.71.51.nip.io";

// How often to poll for new messages when the socket is not connected.
const POLL_MESSAGES_MS = 3_000;
const POLL_CONVERSATIONS_MS = 5_000;

function isSocketAck<T>(value: unknown): value is SocketAck<T> {
  return value !== null && typeof value === "object" && "ok" in value;
}

function formatLocalMessage(
  clientId: string,
  body: string,
  clientMsgId: string,
): ChatThreadMessage {
  const now = new Date().toISOString();

  return {
    id: clientMsgId,
    clientMsgId,
    tenantId: "",
    clientId,
    senderType: "coach",
    body,
    // null until the server confirms — lets the tick stay grey (sent)
    readAt: null,
    createdAt: now,
    localStatus: "sending",
  };
}

function getFallbackClient(
  clientId: string,
  source?: Partial<ConversationSummary["client"]>,
): ConversationSummary["client"] {
  return {
    id: source?.id ?? clientId,
    firstName: source?.firstName ?? "Client",
    lastName: source?.lastName ?? "",
    email: source?.email ?? "",
    avatarUrl: source?.avatarUrl ?? null,
  };
}

function upsertConversation(
  conversations: ConversationSummary[],
  nextConversation: ConversationSummary,
) {
  const withoutConversation = conversations.filter(
    (conversation) => conversation.clientId !== nextConversation.clientId,
  );

  return [nextConversation, ...withoutConversation].sort((left, right) => {
    const leftTime = new Date(
      left.lastMessage?.createdAt ?? left.updatedAt ?? 0,
    ).getTime();
    const rightTime = new Date(
      right.lastMessage?.createdAt ?? right.updatedAt ?? 0,
    ).getTime();
    return rightTime - leftTime;
  });
}

function replaceThreadMessage(
  messages: ChatThreadMessage[],
  nextMessage: ChatMessage,
) {
  const nextMessages = messages.filter((message) => {
    if (message.id === nextMessage.id) {
      return false;
    }

    if (
      message.clientMsgId &&
      nextMessage.clientMsgId &&
      message.clientMsgId === nextMessage.clientMsgId
    ) {
      return false;
    }

    return true;
  });

  return [...nextMessages, nextMessage].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

function markThreadRead(messages: ChatThreadMessage[]) {
  const readAt = new Date().toISOString();

  return messages.map((message) =>
    message.senderType === "client" && !message.readAt
      ? { ...message, readAt }
      : message,
  );
}

export function useCoachChat(clientId?: string) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [clientConnection, setClientConnection] =
    useState<ClientConnection | null>(null);
  const [messages, setMessages] = useState<ChatThreadMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingThread, setIsLoadingThread] = useState(Boolean(clientId));
  const [isSending, setIsSending] = useState(false);
  const [socketState, setSocketState] = useState<
    "idle" | "connecting" | "connected" | "disconnected" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const markReadInFlightRef = useRef(false);

  // Stable refs so socket event handlers never go stale
  const clientIdRef = useRef(clientId);
  useEffect(() => {
    clientIdRef.current = clientId;
  });

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.clientId === clientId,
      ) ?? null,
    [clientId, conversations],
  );

  const displayedClient =
    clientConnection?.client ?? selectedConversation?.client ?? null;

  // ─── Socket lifecycle (only recreated on token change) ───────────────────
  useEffect(() => {
    if (!accessToken) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(`${socketBaseUrl}/chat`, {
      auth: { token: accessToken },
      autoConnect: false,
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current = socket;

    const handleMessage = (message: ChatMessage) => {
      if (message.clientId === clientIdRef.current) {
        setMessages((current) => replaceThreadMessage(current, message));
      }

      setConversations((current) => {
        const existingConversation = current.find(
          (c) => c.clientId === message.clientId,
        );
        return upsertConversation(current, {
          clientId: message.clientId,
          client: getFallbackClient(
            message.clientId,
            existingConversation?.client,
          ),
          lastMessage: message,
        });
      });
    };

    const handleConversationUpdated = (payload: {
      clientId: string;
      lastMessage: ChatMessage;
    }) => {
      setConversations((current) => {
        const existingConversation = current.find(
          (c) => c.clientId === payload.clientId,
        );
        return upsertConversation(current, {
          clientId: payload.clientId,
          client: getFallbackClient(
            payload.clientId,
            existingConversation?.client,
          ),
          lastMessage: payload.lastMessage,
        });
      });
    };

    const handleRead = (payload: {
      clientId: string;
      reader: "coach" | "client";
      readAt: string;
      count: number;
    }) => {
      if (
        payload.clientId !== clientIdRef.current ||
        payload.reader !== "client"
      ) {
        return;
      }
      setMessages((current) =>
        current.map((message) =>
          message.senderType === "coach" && !message.readAt
            ? { ...message, readAt: payload.readAt }
            : message,
        ),
      );
    };

    socket.on("connect", () => setSocketState("connected"));
    socket.on("disconnect", () => setSocketState("disconnected"));
    socket.on("connect_error", () => setSocketState("error"));
    socket.on("message:new", handleMessage);
    socket.on("conversation:updated", handleConversationUpdated);
    socket.on("messages:read", handleRead);
    socket.on("error", (payload: { message?: string } | string) => {
      const message = typeof payload === "string" ? payload : payload.message;
      setError(message ?? "Chat connection failed.");
      setSocketState("error");
    });

    const connectTimer = window.setTimeout(() => socket.connect(), 0);

    return () => {
      window.clearTimeout(connectTimer);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("message:new", handleMessage);
      socket.off("conversation:updated", handleConversationUpdated);
      socket.off("messages:read", handleRead);
      socket.off("error");
      if (socket.connected) socket.disconnect();
      socketRef.current = null;
      setSocketState("idle");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // ─── Join conversation room (separate from socket lifecycle) ─────────────
  useEffect(() => {
    if (socketState !== "connected" || !clientId) return;

    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("conversation:join", { clientId }, (ack?: SocketAck<void>) => {
      if (ack && !ack.ok) {
        setError(
          getApiErrorMessage(
            ack.error,
            "We could not open this conversation live.",
          ),
        );
      }
    });
  }, [socketState, clientId]);

  // ─── Load conversations list (once on mount, then poll if socket is down) ─
  const loadConversations = useCallback(async () => {
    try {
      const data = await getCoachConversations();
      setConversations(data);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "We could not load your chat conversations."),
      );
    }
  }, []);

  useEffect(() => {
    setIsLoadingConversations(true);
    void loadConversations().finally(() => setIsLoadingConversations(false));
  }, [loadConversations]);

  // Poll conversations when socket is not connected
  useEffect(() => {
    if (socketState === "connected") return;

    const id = window.setInterval(
      () => void loadConversations(),
      POLL_CONVERSATIONS_MS,
    );
    return () => window.clearInterval(id);
  }, [socketState, loadConversations]);

  // ─── Load thread (only when clientId changes — NOT when socketState changes) ─
  useEffect(() => {
    if (!clientId) {
      setClientConnection(null);
      setMessages([]);
      setIsLoadingThread(false);
      return;
    }

    let isMounted = true;
    setIsLoadingThread(true);
    setError(null);
    setMessages([]);
    setClientConnection(null);

    Promise.all([
      getClientById(clientId),
      getCoachConversationMessages(clientId),
    ])
      .then(([client, threadMessages]) => {
        if (!isMounted) return;
        setClientConnection(client);
        setMessages(threadMessages.map((m) => ({ ...m })));
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(
          getApiErrorMessage(err, "We could not load this chat thread."),
        );
        setMessages([]);
        setClientConnection(null);
      })
      .finally(() => {
        if (isMounted) setIsLoadingThread(false);
      });

    return () => {
      isMounted = false;
    };
    // Only re-run when the selected client changes — NOT on socketState changes.
    // The socket pushes new messages in real time; polling below is the fallback.
  }, [clientId]);

  // Poll the thread when socket is not connected
  useEffect(() => {
    if (!clientId || socketState === "connected") return;

    const id = window.setInterval(async () => {
      try {
        const threadMessages = await getCoachConversationMessages(clientId);
        setMessages(threadMessages.map((m) => ({ ...m })));
      } catch {
        // silent — the user can see the last loaded state
      }
    }, POLL_MESSAGES_MS);

    return () => window.clearInterval(id);
  }, [clientId, socketState]);

  // ─── Mark unread messages as read ────────────────────────────────────────
  useEffect(() => {
    if (!clientId || !messages.length) return;

    const hasUnread = messages.some(
      (m) => m.senderType === "client" && !m.readAt,
    );

    if (!hasUnread || markReadInFlightRef.current) return;

    let isMounted = true;
    markReadInFlightRef.current = true;

    void markCoachConversationRead(clientId)
      .then(({ count }) => {
        if (!isMounted) return;
        setMessages((current) => markThreadRead(current));
        setConversations((current) =>
          current.map((conversation) =>
            conversation.clientId === clientId
              ? {
                  ...conversation,
                  unreadCount: Math.max(
                    (conversation.unreadCount ?? 0) - count,
                    0,
                  ),
                }
              : conversation,
          ),
        );
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            getApiErrorMessage(err, "We could not mark the thread as read."),
          );
        }
      })
      .finally(() => {
        if (isMounted) markReadInFlightRef.current = false;
      });

    return () => {
      isMounted = false;
    };
  }, [clientId, messages]);

  // ─── Send helpers ─────────────────────────────────────────────────────────
  async function emitWithAck<T>(
    event: string,
    payload: Record<string, unknown>,
  ) {
    const socket = socketRef.current;
    if (!socket || !socket.connected)
      throw new Error("Chat socket is not connected.");

    return new Promise<T>((resolve, reject) => {
      socket.emit(event, payload, (ack: unknown) => {
        if (isSocketAck<T>(ack)) {
          if (ack.ok) resolve(ack.data as T);
          else reject(new Error(ack.error));
          return;
        }
        reject(new Error("Unexpected chat acknowledgement."));
      });
    });
  }

  async function sendMessage(bodyOverride?: string) {
    if (!clientId) throw new Error("Select a client before sending a message.");

    const body = (bodyOverride ?? draft).trim();
    if (!body) throw new Error("Message body cannot be empty.");

    const clientMsgId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const optimisticMessage = formatLocalMessage(clientId, body, clientMsgId);
    setMessages((current) => [...current, optimisticMessage]);
    setDraft("");
    setIsSending(true);
    setError(null);

    try {
      let persistedMessage: ChatMessage;

      if (socketRef.current?.connected) {
        persistedMessage = await emitWithAck<ChatMessage>("message:send", {
          clientId,
          body,
          clientMsgId,
        });
      } else {
        persistedMessage = await sendCoachMessage(clientId, {
          body,
          clientMsgId,
        });
      }

      setMessages((current) => replaceThreadMessage(current, persistedMessage));
      setConversations((current) =>
        upsertConversation(current, {
          clientId,
          client: displayedClient
            ? {
                id: displayedClient.id,
                firstName: displayedClient.firstName,
                lastName: displayedClient.lastName,
                email: displayedClient.email,
                avatarUrl: displayedClient.avatarUrl,
              }
            : (selectedConversation?.client ?? {
                id: clientId,
                firstName: "Client",
                lastName: "",
                email: "",
                avatarUrl: null,
              }),
          lastMessage: persistedMessage,
        }),
      );
    } catch (err) {
      setMessages((current) =>
        current.map((message) =>
          message.clientMsgId === clientMsgId
            ? { ...message, localStatus: "failed" }
            : message,
        ),
      );
      setError(getApiErrorMessage(err, "We could not send the message."));
      throw err;
    } finally {
      setIsSending(false);
    }
  }

  function retryFailedMessage(clientMsgId: string) {
    const failedMessage = messages.find((m) => m.clientMsgId === clientMsgId);
    if (!failedMessage) return;
    setMessages((current) =>
      current.filter((m) => m.clientMsgId !== clientMsgId),
    );
    void sendMessage(failedMessage.body);
  }

  return {
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
  };
}
