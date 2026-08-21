import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MAX_PROMPT_LENGTH } from "@/types/ai-chat";

interface AiComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  busy: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function AiComposer({
  value,
  onChange,
  onSend,
  onStop,
  busy,
  placeholder = "Ask Coach AI",
  disabled,
}: AiComposerProps) {
  const trimmed = value.trim();
  const tooLong = trimmed.length > MAX_PROMPT_LENGTH;
  const canSend = Boolean(trimmed) && !busy && !tooLong && !disabled;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {tooLong && (
        <p className="px-1 text-xs text-destructive">
          {trimmed.length.toLocaleString()} / {MAX_PROMPT_LENGTH.toLocaleString()} characters
          — shorten the question to send it.
        </p>
      )}
      <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/80 p-1.5 shadow-sm">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={busy ? "Thinking…" : placeholder}
          disabled={busy || disabled}
          className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm shadow-none focus-visible:ring-0"
        />
        {busy ? (
          <Button
            type="button"
            size="icon"
            variant="default"
            onClick={onStop}
            className="h-9 w-9 shrink-0 rounded-full"
            aria-label="Stop"
          >
            <Square className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            variant="default"
            onClick={onSend}
            disabled={!canSend}
            className={cn(
              "h-9 w-9 shrink-0 rounded-full",
              !canSend && "opacity-40",
            )}
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
