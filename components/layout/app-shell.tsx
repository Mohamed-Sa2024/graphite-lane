"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import type { User } from "@/types/pr";
import { Avatar } from "@/components/ui/kit";
import { Menu, MenuItem } from "@/components/ui/overlay";
import { ThemeToggle } from "./theme-toggle";
import { RepoSwitcher } from "./repo-switcher";

function Logo() {
  return (
    <Link href="/inbox" className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-fg">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M5 4v11a3 3 0 0 0 3 3h7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="5" cy="4" r="2.4" fill="currentColor" />
          <circle cx="17" cy="18" r="2.4" fill="currentColor" />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-fg">
        Lane
      </span>
    </Link>
  );
}

export function AppShell({
  viewer,
  repos,
  mock,
  children,
}: {
  viewer: User;
  repos: string[];
  mock: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col bg-bg">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
        <Logo />
        <div className="mx-1 h-5 w-px bg-border" />
        <RepoSwitcher repos={repos} />

        <div className="flex-1" />

        {mock && (
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" />
            Demo data
          </span>
        )}

        <ThemeToggle />

        <Menu
          align="end"
          trigger={
            <button className="flex items-center gap-2 rounded-md p-0.5 pr-2 hover:bg-surface-2">
              <Avatar user={viewer} size={26} />
              <span className="hidden text-sm text-fg sm:inline">
                {viewer.name ?? viewer.login}
              </span>
            </button>
          }
        >
          {(close) => (
            <div className="min-w-[200px]">
              <div className="px-2.5 py-2">
                <p className="text-sm font-medium text-fg">
                  {viewer.name ?? viewer.login}
                </p>
                <p className="font-mono text-xs text-muted">@{viewer.login}</p>
              </div>
              <div className="my-1 h-px bg-border" />
              {mock ? (
                <p className="px-2.5 py-1.5 text-xs text-muted">
                  Sign-out is disabled in demo mode.
                </p>
              ) : (
                <MenuItem
                  destructive
                  onClick={() => {
                    close();
                    void signOut({ callbackUrl: "/login" });
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </MenuItem>
              )}
            </div>
          )}
        </Menu>
      </header>

      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
