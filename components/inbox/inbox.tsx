"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  GroupedVirtuoso,
  type GroupedVirtuosoHandle,
} from "react-virtuoso";
import {
  ChevronDown,
  ChevronRight,
  Keyboard,
  PanelLeft,
  RefreshCw,
  Search,
  Settings2,
  X,
} from "lucide-react";
import type { PullRequest } from "@/types/pr";
import { useInboxPRs } from "@/hooks/use-pull-requests";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard";
import { useSections } from "@/store/sections";
import { useUI } from "@/store/ui";
import { prsForSection, sortPRs } from "@/services/review/sections";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/kit";
import { ErrorState, describeError } from "@/components/ui/error-state";
import type { Shortcut } from "@/components/ui/shortcuts";
import { Sidebar } from "./sidebar";
import { PRRow } from "./pr-row";
import { SortMenu } from "./sort-menu";
import { EmptyState } from "./empty-state";
import { InboxSkeleton } from "./skeletons";

// Lazy-load the heavier drawer + help overlay so they stay out of the
// initial inbox bundle until first used.
const EditSectionDrawer = dynamic(
  () =>
    import("@/components/drawer/edit-section-drawer").then((m) => ({
      default: m.EditSectionDrawer,
    })),
  { ssr: false },
);
const ShortcutsOverlay = dynamic(
  () =>
    import("@/components/ui/shortcuts").then((m) => ({
      default: m.ShortcutsOverlay,
    })),
  { ssr: false },
);

const SHORTCUTS: Shortcut[] = [
  { keys: ["j"], label: "Next pull request" },
  { keys: ["k"], label: "Previous pull request" },
  { keys: ["↵"], label: "Open selected" },
  { keys: ["/"], label: "Search" },
  { keys: ["e"], label: "Edit section" },
  { keys: ["r"], label: "Refresh" },
  { keys: ["?"], label: "Toggle this help" },
];

function queryMatch(pr: PullRequest, q: string): boolean {
  if (!q) return true;
  const hay = (
    pr.title +
    " " +
    pr.repo.nameWithOwner +
    " #" +
    pr.number +
    " " +
    pr.author.login +
    " " +
    (pr.author.name ?? "") +
    " " +
    pr.headRefName +
    " " +
    pr.baseRefName
  ).toLowerCase();
  return hay.includes(q.toLowerCase());
}

export function Inbox({
  initialPRs,
  viewerLogin,
  repos,
}: {
  initialPRs: PullRequest[];
  viewerLogin: string;
  repos: string[];
}) {
  const router = useRouter();
  const { data, refetch, isFetching, isError, error } =
    useInboxPRs(initialPRs);
  const prs = data ?? initialPRs;

  const sections = useSections((s) => s.sections);
  const activeId = useSections((s) => s.activeId);
  const setActive = useSections((s) => s.setActive);
  const toggleCollapse = useSections((s) => s.toggleCollapse);
  const addSection = useSections((s) => s.addSection);

  const sort = useUI((s) => s.sort);
  const repoScope = useUI((s) => s.repoScope);

  const [query, setQuery] = React.useState("");
  const [cursor, setCursor] = React.useState(0);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [drawerOpened, setDrawerOpened] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [helpMounted, setHelpMounted] = React.useState(false);
  const [mobileNav, setMobileNav] = React.useState(false);

  const virtuoso = React.useRef<GroupedVirtuosoHandle>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  // Resolve, filter and sort PRs per section.
  const resolved = React.useMemo(
    () =>
      sections.map((s) => ({
        section: s,
        prs: sortPRs(
          prsForSection(s, prs, viewerLogin, repoScope).filter((p) =>
            queryMatch(p, query),
          ),
          sort,
        ),
      })),
    [sections, prs, viewerLogin, repoScope, sort, query],
  );

  const counts = React.useMemo(
    () => Object.fromEntries(resolved.map((r) => [r.section.id, r.prs.length])),
    [resolved],
  );

  const shown = resolved.filter((r) => r.prs.length > 0);
  const groupCounts = shown.map((r) =>
    r.section.collapsed ? 0 : r.prs.length,
  );
  const flat = shown.flatMap((r) => (r.section.collapsed ? [] : r.prs));
  const total = flat.length;

  // Keep the cursor within bounds when the list changes.
  React.useEffect(() => {
    setCursor((c) => Math.min(Math.max(0, c), Math.max(0, total - 1)));
  }, [total]);

  const sectionIdForFlatIndex = (index: number): string | null => {
    let acc = 0;
    for (let i = 0; i < shown.length; i++) {
      acc += groupCounts[i];
      if (index < acc) return shown[i].section.id;
    }
    return null;
  };

  const openEdit = (id: string) => {
    setDrawerOpened(true);
    setEditingId(id);
  };

  const handleSelect = (id: string) => {
    setActive(id);
    setMobileNav(false);
    const groupIdx = shown.findIndex((r) => r.section.id === id);
    if (groupIdx >= 0) {
      const offset = groupCounts.slice(0, groupIdx).reduce((a, b) => a + b, 0);
      virtuoso.current?.scrollToIndex({ index: offset, align: "start" });
    }
  };

  const handleAdd = () => {
    const id = addSection();
    openEdit(id);
  };

  const move = (delta: number) => {
    if (!total) return;
    setCursor((c) => {
      const next = Math.min(Math.max(0, c + delta), total - 1);
      virtuoso.current?.scrollToIndex({ index: next, align: "center" });
      const sid = sectionIdForFlatIndex(next);
      if (sid && sid !== activeId) setActive(sid);
      return next;
    });
  };

  const openCursor = () => {
    const pr = flat[cursor];
    if (pr) router.push(`/pr/${pr.repo.owner}/${pr.repo.name}/${pr.number}`);
  };

  const toggleHelp = () => {
    setHelpMounted(true);
    setHelpOpen((o) => !o);
  };

  useKeyboardShortcuts({
    j: () => move(1),
    k: () => move(-1),
    Enter: openCursor,
    o: openCursor,
    "/": () => searchRef.current?.focus(),
    r: () => {
      if (!isFetching) refetch();
    },
    e: () => {
      const sid = sectionIdForFlatIndex(cursor) ?? activeId;
      if (sid) openEdit(sid);
    },
    "?": toggleHelp,
    Escape: () => {
      if (helpOpen) {
        setHelpOpen(false);
        return;
      }
      if (query) setQuery("");
      searchRef.current?.blur();
    },
  });

  const errInfo = isError ? describeError(error) : null;

  return (
    <div className="relative flex h-full min-h-0">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          sections={sections}
          counts={counts}
          activeId={activeId}
          onSelect={handleSelect}
          onEdit={openEdit}
          onAdd={handleAdd}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileNav && (
        <div className="absolute inset-0 z-30 flex md:hidden">
          <div className="relative z-10">
            <Sidebar
              sections={sections}
              counts={counts}
              activeId={activeId}
              onSelect={handleSelect}
              onEdit={(id) => {
                setMobileNav(false);
                openEdit(id);
              }}
              onAdd={() => {
                setMobileNav(false);
                handleAdd();
              }}
            />
          </div>
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileNav(false)}
          />
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-4">
          <button
            onClick={() => setMobileNav(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg md:hidden"
            aria-label="Open sections"
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          <h1 className="hidden text-sm font-semibold text-fg sm:block">Inbox</h1>
          <span className="hidden rounded-full bg-surface-2 px-2 py-0.5 text-xs tabular-nums text-muted sm:block">
            {prs.length} open
          </span>

          {/* Search */}
          <div className="relative ml-1 max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pull requests"
              className="h-8 pl-8 pr-7 text-xs"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1" />

          <button
            onClick={toggleHelp}
            className="hidden h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-fg sm:flex"
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </button>
          <SortMenu />
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-60"
            aria-label="Refresh"
            title="Refresh (r)"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          </button>
        </div>

        {/* List */}
        <div className="min-h-0 flex-1">
          {errInfo ? (
            <div className="flex h-full items-center justify-center">
              <ErrorState
                title="Couldn't load pull requests"
                message={errInfo.message}
                hint={errInfo.hint}
                onRetry={() => refetch()}
              />
            </div>
          ) : isFetching && prs.length === 0 ? (
            <InboxSkeleton />
          ) : total === 0 ? (
            <EmptyState
              title={query ? "No matches" : "Inbox zero"}
              hint={
                query
                  ? "No pull requests match your search in these sections."
                  : "No pull requests match your sections right now. Try adjusting filters or the repository scope."
              }
            />
          ) : (
            <GroupedVirtuoso
              ref={virtuoso}
              className="h-full"
              groupCounts={groupCounts}
              groupContent={(index) => {
                const { section, prs: list } = shown[index];
                return (
                  <GroupHeader
                    name={section.name}
                    count={list.length}
                    collapsed={section.collapsed}
                    onToggle={() => toggleCollapse(section.id)}
                    onEdit={() => openEdit(section.id)}
                  />
                );
              }}
              itemContent={(index) => {
                const pr = flat[index];
                return pr ? <PRRow pr={pr} active={index === cursor} /> : null;
              }}
            />
          )}
        </div>
      </div>

      {drawerOpened && (
        <EditSectionDrawer
          sectionId={editingId}
          prs={prs}
          repos={repos}
          onClose={() => setEditingId(null)}
        />
      )}

      {helpMounted && (
        <ShortcutsOverlay
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
          shortcuts={SHORTCUTS}
        />
      )}
    </div>
  );
}

function GroupHeader({
  name,
  count,
  collapsed,
  onToggle,
  onEdit,
}: {
  name: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="group flex items-center gap-2 border-b border-border bg-bg/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted hover:text-fg"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        {name}
      </button>
      <span className="rounded-full bg-surface-2 px-1.5 text-[11px] tabular-nums text-muted">
        {count}
      </span>
      <button
        onClick={onEdit}
        className="hidden rounded p-0.5 text-muted hover:text-fg group-hover:block"
        aria-label="Edit section"
      >
        <Settings2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
