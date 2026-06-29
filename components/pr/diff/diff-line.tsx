"use client";

import * as React from "react";
import type { DiffLine } from "@/lib/diff";
import { highlightLine, TOKEN_COLORS } from "@/lib/highlight";
import { cn } from "@/lib/utils";

export function CodeContent({ content, lang }: { content: string; lang: string }) {
  const tokens = React.useMemo(() => highlightLine(content, lang), [content, lang]);
  return (
    <code className="whitespace-pre">
      {tokens.map((t, i) => (
        <span key={i} style={{ color: TOKEN_COLORS[t.kind] }}>
          {t.text}
        </span>
      ))}
    </code>
  );
}

const lineBg: Record<DiffLine["type"], string> = {
  add: "bg-[var(--diff-add)]",
  del: "bg-[var(--diff-del)]",
  context: "",
};

const gutterBg: Record<DiffLine["type"], string> = {
  add: "bg-[var(--diff-add-line)]",
  del: "bg-[var(--diff-del-line)]",
  context: "bg-surface-2/50",
};

const marker: Record<DiffLine["type"], string> = {
  add: "+",
  del: "−",
  context: " ",
};

/** Unified single-line row with old + new gutters. */
export function UnifiedLine({
  line,
  lang,
  onComment,
}: {
  line: DiffLine;
  lang: string;
  onComment?: () => void;
}) {
  return (
    <div className={cn("group flex font-mono text-xs leading-[1.55]", lineBg[line.type])}>
      <span
        className={cn(
          "w-11 shrink-0 select-none px-2 text-right text-muted/70 tabular-nums",
          gutterBg[line.type],
        )}
      >
        {line.oldNumber ?? ""}
      </span>
      <span
        className={cn(
          "w-11 shrink-0 select-none px-2 text-right text-muted/70 tabular-nums",
          gutterBg[line.type],
        )}
      >
        {line.newNumber ?? ""}
      </span>
      <span
        className={cn(
          "w-4 shrink-0 select-none text-center",
          line.type === "add" && "text-success",
          line.type === "del" && "text-danger",
          line.type === "context" && "text-transparent",
        )}
      >
        {marker[line.type]}
      </span>
      {onComment && (
        <button
          onClick={onComment}
          className="mr-1 hidden h-4 w-4 shrink-0 items-center justify-center rounded bg-primary text-[11px] leading-none text-primary-fg group-hover:flex"
          title="Add comment"
        >
          +
        </button>
      )}
      <span className="flex-1 overflow-x-auto pr-3">
        <CodeContent content={line.content} lang={lang} />
      </span>
    </div>
  );
}

/** One side of a side-by-side row. */
export function SplitCell({
  line,
  lang,
}: {
  line: DiffLine | null;
  lang: string;
}) {
  if (!line) {
    return <div className="flex flex-1 bg-surface-2/20 font-mono text-xs" />;
  }
  const number = line.type === "del" ? line.oldNumber : line.newNumber;
  return (
    <div className={cn("flex flex-1 font-mono text-xs leading-[1.55]", lineBg[line.type])}>
      <span
        className={cn(
          "w-11 shrink-0 select-none px-2 text-right text-muted/70 tabular-nums",
          gutterBg[line.type],
        )}
      >
        {number ?? ""}
      </span>
      <span
        className={cn(
          "w-4 shrink-0 select-none text-center",
          line.type === "add" && "text-success",
          line.type === "del" && "text-danger",
          line.type === "context" && "text-transparent",
        )}
      >
        {marker[line.type]}
      </span>
      <span className="flex-1 overflow-x-auto pr-3">
        <CodeContent content={line.content} lang={lang} />
      </span>
    </div>
  );
}
