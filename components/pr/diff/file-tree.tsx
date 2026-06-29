"use client";

import * as React from "react";
import { Check, Search } from "lucide-react";
import type { DiffFile } from "@/types/pr";
import { Input } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

const statusColor: Record<DiffFile["status"], string> = {
  added: "var(--success)",
  removed: "var(--danger)",
  modified: "var(--info)",
  renamed: "var(--warning)",
};

export function FileTree({
  files,
  viewed,
  activePath,
  onSelect,
}: {
  files: DiffFile[];
  viewed: Set<string>;
  activePath: string | null;
  onSelect: (path: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const filtered = files.filter((f) =>
    f.path.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-2 text-[11px] text-muted">
        <span>
          {files.length} file{files.length === 1 ? "" : "s"}
        </span>
        <span className="tabular-nums">
          {viewed.size}/{files.length} viewed
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-1.5 pb-2">
        {filtered.map((f) => {
          const parts = f.path.split("/");
          const name = parts.pop();
          const dir = parts.join("/");
          const isViewed = viewed.has(f.path);
          return (
            <button
              key={f.path}
              onClick={() => onSelect(f.path)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-surface-2",
                activePath === f.path && "bg-surface-2",
                isViewed && "opacity-60",
              )}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-sm"
                style={{ background: statusColor[f.status] }}
              />
              <span className="min-w-0 flex-1 truncate font-mono">
                {dir && <span className="text-muted">{dir}/</span>}
                <span className="text-fg">{name}</span>
              </span>
              {isViewed && <Check className="h-3 w-3 shrink-0 text-success" />}
              <span className="shrink-0 font-mono tabular-nums text-[10px]">
                <span className="text-success">+{f.additions}</span>{" "}
                <span className="text-danger">−{f.deletions}</span>
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-muted">
            No files match.
          </p>
        )}
      </div>
    </div>
  );
}
