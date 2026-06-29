"use client";

import { create } from "zustand";

export type Theme = "dark" | "light";
export type DiffView = "unified" | "split";
export type SortKey = "updated" | "created" | "additions" | "title";

interface UIState {
  theme: Theme;
  diffView: DiffView;
  sort: SortKey;
  /** Repo names to scope the inbox to; empty = all repos. */
  repoScope: string[];
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setDiffView: (v: DiffView) => void;
  setSort: (s: SortKey) => void;
  toggleRepoScope: (repo: string) => void;
  clearRepoScope: () => void;
  initTheme: () => void;
}

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
  try {
    localStorage.setItem("lane-theme", t);
  } catch {
    /* ignore */
  }
}

export const useUI = create<UIState>((set, get) => ({
  theme: "dark",
  diffView: "split",
  sort: "updated",
  repoScope: [],
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    set({ theme: next });
  },
  setDiffView: (diffView) => set({ diffView }),
  setSort: (sort) => set({ sort }),
  toggleRepoScope: (repo) =>
    set((s) => ({
      repoScope: s.repoScope.includes(repo)
        ? s.repoScope.filter((r) => r !== repo)
        : [...s.repoScope, repo],
    })),
  clearRepoScope: () => set({ repoScope: [] }),
  initTheme: () => {
    if (typeof window === "undefined") return;
    let stored: Theme = "dark";
    try {
      stored = (localStorage.getItem("lane-theme") as Theme) || "dark";
    } catch {
      /* ignore */
    }
    applyTheme(stored);
    set({ theme: stored });
  },
}));
