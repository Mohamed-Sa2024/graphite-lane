"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  AlignLeft,
  ChevronLeft,
  Columns2,
  ExternalLink,
  Keyboard,
} from "lucide-react";
import type { InlineComment, PullRequestDetail, User } from "@/types/pr";
import { useUI } from "@/store/ui";
import { uid } from "@/store/sections";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard";
import type { Shortcut } from "@/components/ui/shortcuts";
import { cn } from "@/lib/utils";
import { FileTree } from "./file-tree";
import { DiffFileView } from "./diff-file";
import { ReviewToolbar } from "./review-toolbar";

const ShortcutsOverlay = dynamic(
  () =>
    import("@/components/ui/shortcuts").then((m) => ({
      default: m.ShortcutsOverlay,
    })),
  { ssr: false },
);

const DIFF_SHORTCUTS: Shortcut[] = [
  { keys: ["j"], label: "Next file" },
  { keys: ["k"], label: "Previous file" },
  { keys: ["v"], label: "Toggle viewed" },
  { keys: ["u"], label: "Unified view" },
  { keys: ["s"], label: "Side-by-side view" },
  { keys: ["?"], label: "Toggle this help" },
];

export function DiffViewer({
  detail,
  viewer,
}: {
  detail: PullRequestDetail;
  viewer: User;
}) {
  const view = useUI((s) => s.diffView);
  const setDiffView = useUI((s) => s.setDiffView);

  const [viewed, setViewed] = React.useState<Set<string>>(new Set());
  const [pending, setPending] = React.useState<InlineComment[]>([]);
  const [activePath, setActivePath] = React.useState<string | null>(
    detail.files[0]?.path ?? null,
  );
  const refs = React.useRef(new Map<string, HTMLDivElement>());

  const toggleViewed = (path: string) =>
    setViewed((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });

  const addPending = (
    path: string,
    line: number,
    side: "LEFT" | "RIGHT",
    body: string,
  ) =>
    setPending((prev) => [
      ...prev,
      {
        id: uid(),
        path,
        line,
        side,
        author: viewer,
        body,
        createdAt: new Date().toISOString(),
        pending: true,
      },
    ]);

  const selectFile = (path: string) => {
    setActivePath(path);
    refs.current.get(path)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [helpOpen, setHelpOpen] = React.useState(false);
  const [helpMounted, setHelpMounted] = React.useState(false);
  const toggleHelp = () => {
    setHelpMounted(true);
    setHelpOpen((o) => !o);
  };

  const moveFile = (delta: number) => {
    const files = detail.files;
    if (!files.length) return;
    const idx = Math.max(
      0,
      files.findIndex((f) => f.path === activePath),
    );
    const next = Math.min(Math.max(0, idx + delta), files.length - 1);
    selectFile(files[next].path);
  };

  useKeyboardShortcuts({
    j: () => moveFile(1),
    k: () => moveFile(-1),
    v: () => activePath && toggleViewed(activePath),
    u: () => setDiffView("unified"),
    s: () => setDiffView("split"),
    "?": toggleHelp,
    Escape: () => helpOpen && setHelpOpen(false),
  });

  const owner = detail.repo.owner;
  const repo = detail.repo.name;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
        <Link
          href={`/pr/${owner}/${repo}/${detail.number}`}
          className="flex items-center gap-1 text-sm text-muted hover:text-fg"
        >
          <ChevronLeft className="h-4 w-4" />
          Overview
        </Link>
        <div className="h-4 w-px bg-border" />
        <span className="truncate text-sm font-medium text-fg">{detail.title}</span>
        <span className="shrink-0 font-mono text-xs text-muted">#{detail.number}</span>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-md border border-border">
            <button
              onClick={() => setDiffView("unified")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 text-xs",
                view === "unified"
                  ? "bg-surface-2 text-fg"
                  : "text-muted hover:text-fg",
              )}
            >
              <AlignLeft className="h-3.5 w-3.5" />
              Unified
            </button>
            <button
              onClick={() => setDiffView("split")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 text-xs",
                view === "split"
                  ? "bg-surface-2 text-fg"
                  : "text-muted hover:text-fg",
              )}
            >
              <Columns2 className="h-3.5 w-3.5" />
              Split
            </button>
          </div>
          <button
            onClick={toggleHelp}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted hover:bg-surface-2 hover:text-fg"
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </button>
          <a
            href={detail.url}
            target="_blank"
            rel="noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted hover:bg-surface-2 hover:text-fg"
            title="Open on GitHub"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-72 shrink-0 border-r border-border bg-surface md:block">
          <FileTree
            files={detail.files}
            viewed={viewed}
            activePath={activePath}
            onSelect={selectFile}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-bg p-4">
          <div className="mx-auto flex max-w-5xl flex-col gap-4">
            {detail.files.length === 0 ? (
              <p className="py-20 text-center text-sm text-muted">
                This pull request has no file changes.
              </p>
            ) : (
              detail.files.map((file) => (
                <DiffFileView
                  key={file.path}
                  file={file}
                  view={view}
                  viewed={viewed.has(file.path)}
                  onToggleViewed={() => toggleViewed(file.path)}
                  pending={pending.filter((p) => p.path === file.path)}
                  onAddPending={(line, side, body) =>
                    addPending(file.path, line, side, body)
                  }
                  viewer={viewer}
                  registerRef={(el) => {
                    if (el) refs.current.set(file.path, el);
                    else refs.current.delete(file.path);
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <ReviewToolbar
        owner={owner}
        repo={repo}
        number={detail.number}
        viewedCount={viewed.size}
        totalFiles={detail.files.length}
        pendingCount={pending.length}
      />

      {helpMounted && (
        <ShortcutsOverlay
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
          shortcuts={DIFF_SHORTCUTS}
        />
      )}
    </div>
  );
}
