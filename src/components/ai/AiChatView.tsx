import { useEffect, useRef, useState } from "react";
import {
  Dumbbell,
  Lightbulb,
  Sparkles,
  Square,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAiChat } from "@/hooks/ai/useAiChat";
import { AiComposer } from "./AiComposer";
import { AiMarkdown } from "./AiMarkdown";
import {
  ClientScopePicker,
  type ScopedClient,
} from "./ClientScopePicker";
import { ThinkingIndicator } from "./ThinkingIndicator";

interface Suggestion {
  icon: typeof Lightbulb;
  text: string;
}

const GENERAL_SUGGESTIONS: Suggestion[] = [
  { icon: Lightbulb, text: "How should I progress a beginner's squat?" },
  { icon: Dumbbell, text: "Give me safe alternatives to overhead pressing." },
  { icon: Lightbulb, text: "Build a high-protein day around 2,200 kcal." },
];

const scopedSuggestions = (name: string): Suggestion[] => [
  { icon: Lightbulb, text: `What should I watch for with ${name}?` },
  { icon: Dumbbell, text: `How is ${name} progressing against their goal?` },
  { icon: Lightbulb, text: `What should I change in ${name}'s next block?` },
];

export function AiChatView() {
  const [input, setInput] = useState("");
  const [scope, setScope] = useState<ScopedClient | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { thread, busy, connected, send, stop, reset } = useAiChat();

  const hasChat = thread.length > 0;

  const scopeFirstName = scope?.name.split(" ")[0] ?? "";
  const suggestions = scope
    ? scopedSuggestions(scopeFirstName)
    : GENERAL_SUGGESTIONS;

  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const raf = window.requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
    return () => window.cancelAnimationFrame(raf);
  }, [thread]);

  function handleSend(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    void send(t, {
      membershipId: scope?.membershipId,
      scopeName: scope?.name,
    });
  }

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Coach AI</p>
            <p className="text-sm text-muted-foreground">
              {connected ? "Your AI assistant" : "Connecting…"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasChat && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (busy) stop();
                else reset();
              }}
              className="gap-1.5 text-muted-foreground"
            >
              {busy ? (
                <>
                  <Square className="h-3.5 w-3.5" />
                  Stop
                </>
              ) : (
                "New chat"
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      {!hasChat ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <h3 className="text-xl font-bold text-foreground">Ask anything</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your second pair of eyes
          </p>
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div ref={scrollRef} className="flex flex-col gap-3 p-5">
            {thread.map((m) => {
              const isMe = m.role === "user";
              const isThinking = m.state === "thinking" || m.state === "slow";

              return (
                <div key={m.id}>
                  {m.scopeName && (
                    <div className="mb-0.5 flex items-center gap-1 justify-end pr-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        About {m.scopeName}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex items-end gap-2",
                      isMe ? "justify-end" : "justify-start",
                    )}
                  >
                    {!isMe && (
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          <Sparkles className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {isThinking ? (
                      <div className="rounded-2xl rounded-bl-md border border-border/30 bg-card px-4 py-3">
                        <ThinkingIndicator slow={m.state === "slow"} />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-3",
                          isMe
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : m.state === "failed"
                              ? "rounded-bl-md border border-destructive/40 bg-destructive/10 text-foreground"
                              : m.state === "stopped"
                                ? "rounded-bl-md border border-border/40 bg-secondary/50 text-foreground"
                                : "rounded-bl-md border border-border/30 bg-card text-foreground shadow-sm",
                        )}
                      >
                        {isMe || m.state === "failed" || m.state === "stopped" ? (
                          <p className="whitespace-pre-wrap text-sm leading-6">
                            {m.text}
                          </p>
                        ) : (
                          <AiMarkdown text={m.text} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      <Separator />

      {/* ── Composer ───────────────────────────────────────────── */}
      <div className="p-4">
        {!hasChat && (
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.text}
                  type="button"
                  onClick={() => handleSend(s.text)}
                  disabled={busy}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border border-border/60 bg-card/70 px-3 py-1.5 text-left text-xs font-medium text-foreground transition-all hover:shadow-sm active:opacity-80",
                    busy && "opacity-50",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {s.text}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2">
          <ClientScopePicker
            value={scope}
            onChange={setScope}
            disabled={busy}
          />
        </div>

        <div className="mt-2">
          <AiComposer
            value={input}
            onChange={setInput}
            onSend={() => handleSend(input)}
            onStop={stop}
            busy={busy}
            placeholder={
              busy
                ? "Thinking…"
                : scope
                  ? `Ask about ${scopeFirstName}`
                  : "Ask Coach AI"
            }
          />
        </div>
      </div>
    </>
  );
}
