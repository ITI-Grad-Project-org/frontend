import { useEffect, useMemo, useRef, useState } from "react";
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
  import.meta.env.VITE_API_BASE_URL ?? "https://api.74.162.148.3.nip.io";

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
    readAt: now,
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

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.clientId === clientId,
      ) ?? null,
    [clientId, conversations],
  );

  const displayedClient =
    clientConnection?.client ?? selectedConversation?.client ?? null;

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
      if (message.clientId === clientId) {
        setMessages((current) => replaceThreadMessage(current, message));
      }

      setConversations((current) => {
        const existingConversation = current.find(
          (conversation) => conversation.clientId === message.clientId,
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
          (conversation) => conversation.clientId === payload.clientId,
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
      if (payload.clientId !== clientId || payload.reader !== "client") {
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

    const joinConversation = () => {
      if (!clientId) {
        return;
      }

      socket.emit(
        "conversation:join",
        { clientId },
        (ack?: SocketAck<void>) => {
          if (ack && !ack.ok) {
            setError(
              getApiErrorMessage(
                ack.error,
                "We could not open this conversation live.",
              ),
            );
          }
        },
      );
    };

    socket.on("connect", () => {
      setSocketState("connected");
      joinConversation();
    });
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

    const connectTimer = window.setTimeout(() => {
      socket.connect();
    }, 0);

    return () => {
      window.clearTimeout(connectTimer);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("message:new", handleMessage);
      socket.off("conversation:updated", handleConversationUpdated);
      socket.off("messages:read", handleRead);
      socket.off("error");
      if (socket.connected) {
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [accessToken, clientId]);

  useEffect(() => {
    let isMounted = true;

    async function loadConversations(isInitialLoad = false) {
      if (isInitialLoad) {
        setIsLoadingConversations(true);
      }

      try {
        const data = await getCoachConversations();

        if (isMounted) {
          setConversations(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "We could not load your chat conversations.",
            ),
          );
        }
      } finally {
        if (isMounted && isInitialLoad) {
          setIsLoadingConversations(false);
        }
      }
    }

    void loadConversations(true);

    let intervalId: number | undefined;
    if (socketState !== "connected") {
      intervalId = window.setInterval(() => {
        void loadConversations(false);
      }, 5000);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [socketState]);

  useEffect(() => {
    let isMounted = true;

    async function loadThread(isInitialLoad = false) {
      if (!clientId) {
        setClientConnection(null);
        setMessages([]);
        if (isInitialLoad) {
          setIsLoadingThread(false);
        }
        return;
      }

      if (isInitialLoad) {
        setIsLoadingThread(true);
        setError(null);
        setMessages([]);
        setClientConnection(null);
      }

      try {
        const [client, threadMessages] = await Promise.all([
          getClientById(clientId),
          getCoachConversationMessages(clientId),
        ]);

        if (!isMounted) {
          return;
        }

        setClientConnection(client);
        // Replace the active thread instead of merging it into whatever was
        // previously on screen; otherwise messages leak across client switches.
        setMessages(threadMessages.map((message) => ({ ...message })));
      } catch (err) {
        if (isMounted && isInitialLoad) {
          setError(
            getApiErrorMessage(err, "We could not load this chat thread."),
          );
          setMessages([]);
          setClientConnection(null);
        }
      } finally {
        if (isMounted && isInitialLoad) {
          setIsLoadingThread(false);
        }
      }
    }

    void loadThread(true);

    let intervalId: number | undefined;
    if (clientId && socketState !== "connected") {
      intervalId = window.setInterval(() => {
        void loadThread(false);
      }, 3000);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [clientId, socketState]);

  useEffect(() => {
    if (!clientId || !messages.length) {
      return;
    }

    const hasUnreadClientMessages = messages.some(
      (message) => message.senderType === "client" && !message.readAt,
    );

    if (!hasUnreadClientMessages || markReadInFlightRef.current) {
      return;
    }

    let isMounted = true;
    markReadInFlightRef.current = true;

    void markCoachConversationRead(clientId)
      .then(({ count }) => {
        if (!isMounted) {
          return;
        }

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
        if (isMounted) {
          markReadInFlightRef.current = false;
        }
      });

    return () => {
      isMounted = false;
    };
  }, [clientId, messages]);

  async function emitWithAck<T>(
    event: string,
    payload: Record<string, unknown>,
  ) {
    const socket = socketRef.current;

    if (!socket || !socket.connected) {
      throw new Error("Chat socket is not connected.");
    }

    return new Promise<T>((resolve, reject) => {
      socket.emit(event, payload, (ack: unknown) => {
        if (isSocketAck<T>(ack)) {
          if (ack.ok) {
            resolve(ack.data as T);
          } else {
            reject(new Error(ack.error));
          }
          return;
        }

        reject(new Error("Unexpected chat acknowledgement."));
      });
    });
  }

  async function sendMessage(bodyOverride?: string) {
    if (!clientId) {
      throw new Error("Select a client before sending a message.");
    }

    const body = (bodyOverride ?? draft).trim();

    if (!body) {
      throw new Error("Message body cannot be empty.");
    }

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
    const failedMessage = messages.find(
      (message) => message.clientMsgId === clientMsgId,
    );

    if (!failedMessage) {
      return;
    }

    setMessages((current) =>
      current.filter((message) => message.clientMsgId !== clientMsgId),
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
