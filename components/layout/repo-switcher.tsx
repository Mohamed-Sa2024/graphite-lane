"use client";

import { Check, ChevronsUpDown, GitBranch } from "lucide-react";
import { Menu } from "@/components/ui/overlay";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";

export function RepoSwitcher({ repos }: { repos: string[] }) {
  const repoScope = useUI((s) => s.repoScope);
  const toggleRepoScope = useUI((s) => s.toggleRepoScope);
  const clearRepoScope = useUI((s) => s.clearRepoScope);

  const label =
    repoScope.length === 0
      ? "All repositories"
      : repoScope.length === 1
        ? repoScope[0]
        : `${repoScope.length} repositories`;

  return (
    <Menu
      align="start"
      trigger={
        <button className="flex h-8 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-sm text-fg transition-colors hover:bg-surface-2">
          <GitBranch className="h-3.5 w-3.5 text-muted" />
          <span className="max-w-[200px] truncate font-mono text-xs">
            {label}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted" />
        </button>
      }
    >
      {() => (
        <div className="min-w-[240px]">
          <button
            onClick={clearRepoScope}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-surface-2",
              repoScope.length === 0 ? "text-primary" : "text-fg",
            )}
          >
            All repositories
            {repoScope.length === 0 && <Check className="h-3.5 w-3.5" />}
          </button>
          <div className="my-1 h-px bg-border" />
          <div className="max-h-[280px] overflow-y-auto">
            {repos.map((repo) => {
              const active = repoScope.includes(repo);
              return (
                <button
                  key={repo}
                  onClick={() => toggleRepoScope(repo)}
                  className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left hover:bg-surface-2"
                >
                  <span className="truncate font-mono text-xs text-fg">
                    {repo}
                  </span>
                  {active && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Menu>
  );
}
