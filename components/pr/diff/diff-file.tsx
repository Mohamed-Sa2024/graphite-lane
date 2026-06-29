"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { DiffFile, InlineComment, User } from "@/types/pr";
import { parsePatch, toSplitRows, languageFromPath } from "@/lib/diff";
import { DiffStat, Checkbox, Badge, Button, Textarea } from "@/components/ui/kit";
import { cn } from "@/lib/utils";
import { UnifiedLine, SplitCell } from "./diff-line";
import { InlineCommentCard } from "./inline-comment";

const statusBadge: Record<DiffFile["status"], { label: string; cls: string }> = {
  added: { label: "Added", cls: "text-success" },
  removed: { label: "Removed", cls: "text-danger" },
  modified: { label: "Modified", cls: "text-info" },
  renamed: { label: "Renamed", cls: "text-warning" },
};

function commentKey(side: string, line: number) {
  return `${side}:${line}`;
}

export function DiffFileView({
  file,
  view,
  viewed,
  onToggleViewed,
  pending,
  onAddPending,
  viewer,
  registerRef,
}: {
  file: DiffFile;
  view: "unified" | "split";
  viewed: boolean;
  onToggleViewed: () => void;
  pending: InlineComment[];
  onAddPending: (line: number, side: "LEFT" | "RIGHT", body: string) => void;
  viewer: User;
  registerRef?: (el: HTMLDivElement | null) => void;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const hunks = React.useMemo(() => parsePatch(file.patch), [file.patch]);
  const lang = languageFromPath(file.path);

  const allComments = React.useMemo(
    () => [...(file.comments ?? []), ...pending],
    [file.comments, pending],
  );
  const byLine = React.useMemo(() => {
    const map = new Map<string, InlineComment[]>();
    for (const c of allComments) {
      const k = commentKey(c.side, c.line);
      map.set(k, [...(map.get(k) ?? []), c]);
    }
    return map;
  }, [allComments]);

  const badge = statusBadge[file.status];

  return (
    <div
      ref={registerRef}
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-surface",
        viewed && "opacity-70",
      )}
    >
      {/* File header */}
      <div className="flex items-center gap-2.5 border-b border-border bg-surface-2/40 px-3 py-2">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-muted hover:text-fg"
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        <span className="truncate font-mono text-xs text-fg">
          {file.previousPath && file.previousPath !== file.path && (
            <span className="text-muted">{file.previousPath} → </span>
          )}
          {file.path}
        </span>
        <Badge className={cn("shrink-0", badge.cls)}>{badge.label}</Badge>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <DiffStat add={file.additions} del={file.deletions} />
          <Checkbox checked={viewed} onChange={onToggleViewed} label={<span className="text-xs text-muted">Viewed</span>} />
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="overflow-x-auto">
          {hunks.length === 0 ? (
            <p className="px-4 py-3 text-xs text-muted">
              No textual diff available for this file.
            </p>
          ) : view === "unified" ? (
            hunks.map((hunk, hi) => (
              <div key={hi}>
                <div className="bg-surface-2/60 px-3 py-1 font-mono text-[11px] text-muted">
                  @@ -{hunk.oldStart} +{hunk.newStart} @@ {hunk.header}
                </div>
                {hunk.lines.map((line, li) => {
                  const side: "LEFT" | "RIGHT" =
                    line.newNumber != null ? "RIGHT" : "LEFT";
                  const lineNo = line.newNumber ?? line.oldNumber ?? 0;
                  const comments = byLine.get(commentKey(side, lineNo)) ?? [];
                  return (
                    <React.Fragment key={li}>
                      <UnifiedLineWithAdd
                        line={line}
                        lang={lang}
                        onAdd={(body) => onAddPending(lineNo, side, body)}
                        viewer={viewer}
                      />
                      {comments.map((c) => (
                        <InlineCommentCard key={c.id} comment={c} />
                      ))}
                    </React.Fragment>
                  );
                })}
              </div>
            ))
          ) : (
            hunks.map((hunk, hi) => {
              const rows = toSplitRows(hunk.lines);
              return (
                <div key={hi}>
                  <div className="bg-surface-2/60 px-3 py-1 font-mono text-[11px] text-muted">
                    @@ -{hunk.oldStart} +{hunk.newStart} @@ {hunk.header}
                  </div>
                  {rows.map((row, ri) => {
                    const rightNo = row.right?.newNumber ?? 0;
                    const leftNo = row.left?.oldNumber ?? 0;
                    const comments = [
                      ...(byLine.get(commentKey("RIGHT", rightNo)) ?? []),
                      ...(byLine.get(commentKey("LEFT", leftNo)) ?? []),
                    ];
                    return (
                      <div key={ri}>
                        <div className="flex divide-x divide-border">
                          <SplitCell line={row.left} lang={lang} />
                          <SplitCell line={row.right} lang={lang} />
                        </div>
                        {comments.map((c) => (
                          <InlineCommentCard key={c.id} comment={c} />
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/** A unified line with a hover "+" that opens an inline pending-comment composer. */
function UnifiedLineWithAdd({
  line,
  lang,
  onAdd,
  viewer,
}: {
  line: import("@/lib/diff").DiffLine;
  lang: string;
  onAdd: (body: string) => void;
  viewer: User;
}) {
  const [open, setOpen] = React.useState(false);
  const [body, setBody] = React.useState("");

  return (
    <>
      <UnifiedLine line={line} lang={lang} onComment={() => setOpen((o) => !o)} />
      {open && (
        <div className="border-y border-border bg-surface px-4 py-3">
          <div className="rounded-lg border border-border bg-surface-2/40 p-2.5">
            <Textarea
              autoFocus
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Leave a comment as @${viewer.login}…`}
              className="text-sm"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  setBody("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                disabled={!body.trim()}
                onClick={() => {
                  onAdd(body.trim());
                  setBody("");
                  setOpen(false);
                }}
              >
                Add comment
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
