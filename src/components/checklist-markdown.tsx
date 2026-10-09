"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Rendu markdown avec cases à cocher cliquables (identifiées par leur ligne source,
 * fournie par remark sur le `input` synthétisé par le GFM — plus fiable qu'un compteur
 * incrémenté pendant le rendu face aux doubles rendus de React).
 */
export function ChecklistMarkdown({
  body,
  onToggleLine,
  className = "prose-qg",
}: {
  body: string;
  onToggleLine: (line: number) => void;
  className?: string;
}) {
  const components: Components = {
    input: (props) => {
      if (props.type !== "checkbox") return <input {...props} />;
      const node = props.node as { position?: { start?: { line?: number } } } | undefined;
      const line = node?.position?.start?.line;
      return (
        <input
          type="checkbox"
          checked={!!props.checked}
          readOnly
          onClick={(e) => {
            e.stopPropagation();
            if (line) onToggleLine(line);
          }}
          className="cursor-pointer"
        />
      );
    },
  };

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {body}
      </ReactMarkdown>
    </div>
  );
}
