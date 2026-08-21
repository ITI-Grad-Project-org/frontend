import Markdown from "react-markdown";

/**
 * Renders Markdown-flavoured prose from the AI assistant.
 * React handles XSS — no additional sanitization needed.
 */
export function AiMarkdown({ text }: { text: string }) {
  return (
    <Markdown
      components={{
        p: ({ children }) => (
          <p className="text-sm leading-6 text-foreground mb-2 last:mb-0">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-foreground">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => (
          <ul className="list-disc pl-4 mb-2 space-y-1 text-sm text-foreground">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-4 mb-2 space-y-1 text-sm text-foreground">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-6">{children}</li>,
        h1: ({ children }) => (
          <h1 className="text-lg font-bold text-foreground mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold text-foreground mb-2">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {children}
          </h3>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <code className="block rounded-xl border border-border bg-secondary p-3 text-xs text-foreground overflow-x-auto mb-2">
                {children}
              </code>
            );
          }
          return (
            <code className="rounded bg-secondary px-1.5 py-0.5 text-xs text-foreground">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="mb-2">{children}</pre>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-3 border-primary pl-3 mb-2 text-sm text-muted-foreground">
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="border-border my-2" />,
        table: ({ children }) => (
          <div className="overflow-x-auto mb-2">
            <table className="w-full text-sm border border-border rounded-lg">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-b border-border px-3 py-2 text-left font-semibold text-foreground">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-b border-border/50 px-3 py-2 text-muted-foreground">
            {children}
          </td>
        ),
      }}
    >
      {text}
    </Markdown>
  );
}
