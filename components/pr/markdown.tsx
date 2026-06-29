"use client";

import * as React from "react";

/** Inline formatting: `code`, **bold**, *italic*, [text](url). */
function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("`")) {
      nodes.push(
        <code
          key={`${keyBase}-${i}`}
          className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[0.85em] text-fg"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith("**")) {
      nodes.push(
        <strong key={`${keyBase}-${i}`} className="font-semibold text-fg">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else if (tok.startsWith("*")) {
      nodes.push(<em key={`${keyBase}-${i}`}>{tok.slice(1, -1)}</em>);
    } else {
      const match = tok.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        nodes.push(
          <a
            key={`${keyBase}-${i}`}
            href={match[2]}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            {match[1]}
          </a>,
        );
      }
    }
    last = m.index + tok.length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // closing fence
      blocks.push(
        <pre
          key={key++}
          className="my-2 overflow-x-auto rounded-md border border-border bg-surface-2/60 p-3 font-mono text-xs leading-relaxed text-fg"
        >
          {buf.join("\n")}
        </pre>,
      );
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const sizes = ["text-lg", "text-base", "text-sm", "text-sm"];
      blocks.push(
        <p
          key={key++}
          className={`mt-3 mb-1 font-semibold text-fg ${sizes[level - 1]}`}
        >
          {renderInline(h[2], `h${key}`)}
        </p>,
      );
      i++;
      continue;
    }

    // List block
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-1.5 list-disc space-y-1 pl-5 text-sm text-fg">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it, `li${key}-${j}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph (collect consecutive non-empty, non-special lines)
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !lines[i].match(/^(#{1,4})\s+/) &&
      !lines[i].trimStart().startsWith("```")
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="my-1.5 text-sm leading-relaxed text-fg">
        {renderInline(para.join(" "), `p${key}`)}
      </p>,
    );
  }

  return <div className="text-fg">{blocks}</div>;
}
