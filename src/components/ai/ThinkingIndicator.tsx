import { useEffect, useState } from "react";

const WORDS = [
  "Thinking",
  "Reading your library",
  "Checking the plan",
  "Connecting the dots",
  "Weighing the options",
  "Pulling it together",
  "Almost there",
];

const ROTATE_MS = 2600;

export function ThinkingIndicator({ slow = false }: { slow?: boolean }) {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - started) / 1000)),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (slow) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % WORDS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [slow]);

  const label = slow ? `Still thinking · ${elapsed}s` : WORDS[index];

  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <span>{label}</span>
      <span className="inline-flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/60 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/60 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/60 [animation-delay:300ms]" />
      </span>
    </span>
  );
}
