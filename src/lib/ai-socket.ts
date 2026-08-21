import type {
  AiAccepted,
  AiCompleted,
  AiRejected,
  AiRequestPayload,
  AiTimedOut,
  WsException,
} from "@/types/ai-chat";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Where `ai.*` frames are delivered. Registered by `useAiChat`.
 *
 * The socket binds its listeners ONCE, synchronously, at creation — they
 * forward here. Consumers swap the sink instead of attaching their own
 * handlers, because attaching from a React effect meant racing the socket's
 * own creation.
 */
export interface AiEventSink {
  onAccepted(event: AiAccepted): void;
  onCompleted(event: AiCompleted): void;
  onTimedOut(event: AiTimedOut): void;
  onRejected(event: AiRejected): void;
  onUnauthorized(): void;
  onException(event: WsException): void;
  onDisconnect(): void;
}

let sink: Partial<AiEventSink> = {};

/** Register the sink. Returns an unsubscribe that restores the empty sink. */
export function setAiEventSink(next: Partial<AiEventSink>): () => void {
  sink = next;
  return () => {
    if (sink === next) sink = {};
  };
}

/**
 * The AI assistant lives on the DEFAULT namespace. `/chat` is the human
 * messaging gateway — different events, different rooms, nothing crosses over.
 */

const MAX_AUTH_RETRIES = 3;

let socket: Socket | null = null;
let connecting: Promise<Socket | null> | null = null;
let authRetries = 0;
let recoveringAuth = false;
let generation = 0;

type ConnectionListener = (connected: boolean) => void;

const connectionListeners = new Set<ConnectionListener>();

function emitConnectionChange(connected: boolean) {
  connectionListeners.forEach((fn) => fn(connected));
}

/** Subscribe to connect/disconnect. Returns an unsubscribe. */
export function onAiConnectionChange(fn: ConnectionListener): () => void {
  connectionListeners.add(fn);
  return () => {
    connectionListeners.delete(fn);
  };
}

export function getAiSocket(): Socket | null {
  return socket;
}

export function isAiConnected(): boolean {
  return socket?.connected ?? false;
}

const socketBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? "https://api.20.54.71.51.nip.io";

export async function connectAiSocket(): Promise<Socket | null> {
  if (socket) {
    if (!socket.connected) socket.connect();
    return socket;
  }
  if (connecting) return connecting;

  const gen = generation;

  connecting = (async () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return null;
    if (gen !== generation) return null;

    const s = io(socketBaseUrl, {
      auth: (cb: (data: { token: string }) => void) => {
        const fresh = useAuthStore.getState().accessToken;
        cb({ token: fresh ?? token });
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    s.on("connect", () => {
      authRetries = 0;
      recoveringAuth = false;
      emitConnectionChange(true);
    });
    s.on("disconnect", () => {
      emitConnectionChange(false);
      sink.onDisconnect?.();
    });

    // Bound here, synchronously, for the lifetime of the socket.
    s.on("ai.accepted", (e: AiAccepted) => sink.onAccepted?.(e));
    s.on("ai.completed", (e: AiCompleted) => sink.onCompleted?.(e));
    s.on("ai.timed_out", (e: AiTimedOut) => sink.onTimedOut?.(e));
    s.on("ai.rejected", (e: AiRejected) => sink.onRejected?.(e));
    s.on("exception", (e: WsException) => sink.onException?.(e));

    s.on("ai.unauthorized", () => {
      sink.onUnauthorized?.();
      void handleAuthFailure();
    });
    s.on("connect_error", () => {
      emitConnectionChange(false);
    });

    if (gen !== generation) {
      s.removeAllListeners();
      s.disconnect();
      return null;
    }

    socket = s;
    return s;
  })().finally(() => {
    connecting = null;
  });

  return connecting;
}

async function handleAuthFailure() {
  if (recoveringAuth) return;

  if (authRetries >= MAX_AUTH_RETRIES) {
    disconnectAiSocket();
    return;
  }
  recoveringAuth = true;
  authRetries += 1;

  try {
    await reconnectAiSocket({ keepAuthRetries: true });
  } finally {
    recoveringAuth = false;
  }
}

export function disconnectAiSocket({ keepAuthRetries = false } = {}) {
  generation += 1;
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    emitConnectionChange(false);
  }
  if (!keepAuthRetries) authRetries = 0;
}

export async function reconnectAiSocket(
  opts: { keepAuthRetries?: boolean } = {},
): Promise<Socket | null> {
  disconnectAiSocket(opts);
  return connectAiSocket();
}

const CONNECT_WAIT_MS = 15_000;

function waitForConnection(s: Socket): Promise<boolean> {
  if (s.connected) return Promise.resolve(true);
  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      s.off("connect", onUp);
      s.off("connect_error", onFail);
      resolve(ok);
    };
    const onUp = () => finish(true);
    const onFail = () => finish(false);
    const timer = setTimeout(() => finish(false), CONNECT_WAIT_MS);
    s.on("connect", onUp);
    s.on("connect_error", onFail);
  });
}

/**
 * Fire-and-forget. The gateway never invokes an acknowledgement callback —
 * the reply arrives as a separate `ai.accepted` / `ai.completed` event.
 */
export async function emitAiRequest(
  payload: AiRequestPayload,
): Promise<boolean> {
  const s = socket;
  if (!s) return false;
  const ready = await waitForConnection(s);
  if (!ready || socket !== s || !s.connected) return false;
  s.emit("ai.requested", payload);
  return true;
}
