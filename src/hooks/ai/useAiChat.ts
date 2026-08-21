import {
  connectAiSocket,
  emitAiRequest,
  isAiConnected,
  onAiConnectionChange,
  setAiEventSink,
} from "@/lib/ai-socket";
import { useCallback, useEffect, useState } from "react";
import {
  MAX_PROMPT_LENGTH,
  type AiAccepted,
  type AiCompleted,
  type AiMessage,
  type AiRejected,
  type AiRequestKind,
  type AiTimedOut,
  type WsException,
} from "@/types/ai-chat";

/**
 * Local give-up deadline. Must stay ABOVE the server's own
 * `AI_REQUEST_TIMEOUT_MS` so we never abandon a request the backend is
 * still working on.
 */
const LOCAL_TIMEOUT_MS = 180_000;

/**
 * Deadline for `ai.accepted` alone. Acceptance is a fast, local,
 * pre-dispatch step — if it hasn't landed in this long, the ask is not
 * queued and no answer is coming.
 */
const ACCEPT_TIMEOUT_MS = 20_000;

const ACCEPT_TIMER = "accept";

const COPY = {
  disconnected: "Connection lost — please ask again.",
  failed: "The assistant could not answer. Please try again.",
  noAck: "Couldn't reach the assistant. Please try again.",
  reconnecting: "Session expired — reconnecting. Please ask again.",
  serverError: "Something went wrong. Please try again.",
  slow: "Still thinking…",
  stopped: "Stopped.",
  quota:
    "The assistant has reached its usage limit for now. Please try again later.",
} as const;

function isQuotaExhausted(summary: string): boolean {
  return /429|RESOURCE_EXHAUSTED|quota|rate.?limit/i.test(summary ?? "");
}

let inFlightPlaceholderId: string | null = null;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

/** Requests the user explicitly stopped waiting for. */
const abandoned = new Set<string>();

let placeholderSeq = 0;
const nextId = () => `ai-${Date.now()}-${placeholderSeq++}`;

function clearTimer(id: string) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
}

function clearAllTimers() {
  timers.forEach((timer) => clearTimeout(timer));
  timers.clear();
}

let moduleThread: AiMessage[] = [];
let moduleBusy = false;

const threadListeners = new Set<(thread: AiMessage[]) => void>();
const busyListeners = new Set<(busy: boolean) => void>();

function setThread(updater: (prev: AiMessage[]) => AiMessage[]) {
  moduleThread = updater(moduleThread);
  threadListeners.forEach((fn) => fn(moduleThread));
}

function setBusy(busy: boolean) {
  moduleBusy = busy;
  busyListeners.forEach((fn) => fn(moduleBusy));
}

interface SendOptions {
  /** Coach only. Scopes retrieval to one client's intake and check-ins. */
  membershipId?: string | null;
  /** Display name for that client — thread annotation only, never sent. */
  scopeName?: string | null;
  kind?: AiRequestKind;
}

interface UseAiChatReturn {
  thread: AiMessage[];
  busy: boolean;
  connected: boolean;
  send: (raw: string, options?: SendOptions) => Promise<void>;
  stop: () => void;
  reset: () => void;
}

/**
 * Manages the AI assistant socket lifecycle and thread state.
 *
 * Thread state is module-level so responses land reliably and survive
 * re-renders and tab navigation.
 */
export function useAiChat(): UseAiChatReturn {
  const [thread, setLocalThread] = useState<AiMessage[]>(() => moduleThread);
  const [busy, setLocalBusy] = useState<boolean>(() => moduleBusy);
  const [connected, setConnected] = useState(() => isAiConnected());

  useEffect(() => {
    const onThreadChange = (t: AiMessage[]) => setLocalThread(t);
    const onBusyChange = (b: boolean) => setLocalBusy(b);

    threadListeners.add(onThreadChange);
    busyListeners.add(onBusyChange);

    return () => {
      threadListeners.delete(onThreadChange);
      busyListeners.delete(onBusyChange);
    };
  }, []);

  // ─── Socket lifecycle ──────────────────────────────────────────────────
  useEffect(() => {
    const releaseConnection = onAiConnectionChange((c) => setConnected(c));

    const onAccepted = ({ requestId }: AiAccepted) => {
      clearTimer(ACCEPT_TIMER);
      const targetId = inFlightPlaceholderId;

      setThread((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          const msg = next[i];
          if (
            msg.role === "assistant" &&
            (msg.id === targetId ||
              (!msg.requestId &&
                (msg.state === "thinking" || msg.state === "slow")))
          ) {
            next[i] = { ...msg, requestId };
            break;
          }
        }
        return next;
      });

      // Arm the local deadline
      timers.set(
        requestId,
        setTimeout(() => {
          timers.delete(requestId);
          inFlightPlaceholderId = null;
          setThread((prev) =>
            prev.map((m) =>
              (m.id === requestId || m.requestId === requestId) &&
              m.state &&
              m.state !== "failed" &&
              m.state !== "stopped"
                ? { ...m, state: "failed", text: COPY.failed }
                : m,
            ),
          );
          setBusy(false);
        }, LOCAL_TIMEOUT_MS),
      );
    };

    const onCompleted = (event: AiCompleted) => {
      clearTimer(event.requestId);
      const targetId = inFlightPlaceholderId;
      inFlightPlaceholderId = null;

      if (abandoned.has(event.requestId)) {
        abandoned.delete(event.requestId);
        setBusy(false);
        return;
      }

      if (event.status === "succeeded") {
        setThread((prev) =>
          prev.map((m) =>
            m.requestId === event.requestId ||
            (targetId && m.id === targetId) ||
            m.id === event.requestId
              ? { ...m, text: event.summary, state: undefined }
              : m,
          ),
        );
      } else {
        console.warn("[ai] request failed:", event.summary);
        setThread((prev) =>
          prev.map((m) =>
            m.requestId === event.requestId ||
            (targetId && m.id === targetId) ||
            m.id === event.requestId
              ? {
                  ...m,
                  state: "failed",
                  text: isQuotaExhausted(event.summary)
                    ? COPY.quota
                    : COPY.failed,
                }
              : m,
          ),
        );
      }
      setBusy(false);
    };

    const onTimedOut = ({ requestId }: AiTimedOut) => {
      setThread((prev) =>
        prev.map((m) =>
          (m.requestId === requestId || m.id === requestId) &&
          m.state === "thinking"
            ? { ...m, state: "slow", text: COPY.slow }
            : m,
        ),
      );
    };

    const failInFlight = (text: string) => {
      clearTimer(ACCEPT_TIMER);
      const placeholderId = inFlightPlaceholderId;
      inFlightPlaceholderId = null;
      if (placeholderId) {
        clearTimer(placeholderId);
        setThread((prev) =>
          prev.map((m) =>
            m.id === placeholderId || m.requestId === placeholderId
              ? { ...m, state: "failed", text }
              : m,
          ),
        );
      }
      setBusy(false);
    };

    const onUnauthorized = () => failInFlight(COPY.reconnecting);

    const onRejected = ({ message }: AiRejected) => failInFlight(message);

    const onException = (event: WsException) => {
      console.error("[ai] gateway exception:", event?.message);
      failInFlight(COPY.serverError);
    };

    const onDisconnect = () => {
      inFlightPlaceholderId = null;
      clearAllTimers();
      setThread((prev) =>
        prev.map((m) =>
          m.role === "assistant" && m.state && m.state !== "failed"
            ? { ...m, state: "failed", text: COPY.disconnected }
            : m,
        ),
      );
      setBusy(false);
    };

    const release = setAiEventSink({
      onAccepted,
      onCompleted,
      onTimedOut,
      onRejected,
      onUnauthorized,
      onException,
      onDisconnect,
    });

    void connectAiSocket();

    return () => {
      releaseConnection();
      release();
    };
  }, []);

  // ─── Send ──────────────────────────────────────────────────────────────
  const send = useCallback(async (raw: string, options: SendOptions = {}) => {
    const prompt = raw.trim();
    if (!prompt || prompt.length > MAX_PROMPT_LENGTH) return;
    if (moduleBusy || inFlightPlaceholderId) return;

    const placeholderId = nextId();

    setThread((prev) => [
      ...prev,
      {
        id: `${placeholderId}-u`,
        role: "user" as const,
        text: prompt,
        ...(options.scopeName ? { scopeName: options.scopeName } : {}),
      },
      {
        id: placeholderId,
        role: "assistant" as const,
        text: "",
        state: "thinking" as const,
      },
    ]);
    setBusy(true);
    inFlightPlaceholderId = placeholderId;

    const fail = (text: string) => {
      clearTimer(ACCEPT_TIMER);
      inFlightPlaceholderId = null;
      setThread((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, state: "failed" as const, text }
            : m,
        ),
      );
      setBusy(false);
    };

    const socket = await connectAiSocket();
    if (!socket) {
      fail(COPY.disconnected);
      return;
    }

    const sent = await emitAiRequest({
      kind: options.kind ?? "advice",
      prompt,
      ...(options.membershipId ? { membershipId: options.membershipId } : {}),
    });

    if (!sent) {
      fail(COPY.disconnected);
      return;
    }

    // Arm accept deadline
    clearTimer(ACCEPT_TIMER);
    timers.set(
      ACCEPT_TIMER,
      setTimeout(() => {
        timers.delete(ACCEPT_TIMER);
        if (inFlightPlaceholderId === placeholderId)
          inFlightPlaceholderId = null;
        setThread((prev) => {
          const msg = prev.find(
            (m) => m.id === placeholderId || m.requestId === placeholderId,
          );
          if (!msg || msg.state === "failed" || msg.state === "stopped")
            return prev;
          return prev.map((m) =>
            m.id === placeholderId
              ? { ...m, state: "failed" as const, text: COPY.noAck }
              : m,
          );
        });
        setBusy(false);
      }, ACCEPT_TIMEOUT_MS),
    );
  }, []);

  // ─── Stop ──────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    setThread((prev) => {
      const pending = prev.find(
        (m) =>
          m.role === "assistant" &&
          (m.state === "thinking" || m.state === "slow"),
      );
      if (pending?.requestId) abandoned.add(pending.requestId);

      return prev.map((m) =>
        m.role === "assistant" &&
        (m.state === "thinking" || m.state === "slow")
          ? { ...m, state: "stopped" as const, text: COPY.stopped }
          : m,
      );
    });
    clearAllTimers();
    inFlightPlaceholderId = null;
    setBusy(false);
  }, []);

  // ─── Reset ─────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    inFlightPlaceholderId = null;
    abandoned.clear();
    clearAllTimers();
    setThread(() => []);
    setBusy(false);
  }, []);

  return { thread, busy, connected, send, stop, reset };
}
