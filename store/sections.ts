"use client";

import { create } from "zustand";
import type { FilterCondition, FilterGroup, FilterQuery } from "@/services/filters/types";

export type SectionKind =
  | "waiting_for_review"
  | "waiting_for_author"
  | "approved"
  | "production"
  | "custom";

export interface Section {
  id: string;
  name: string;
  kind: SectionKind;
  /** Used by "production" and "custom" sections. */
  filter: FilterQuery;
  /** Repo scoping; empty = all repos. */
  repos: string[];
  collapsed: boolean;
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function newCondition(): FilterCondition {
  return { id: uid(), field: "repository", operator: "is", value: "" };
}

export function newGroup(): FilterGroup {
  return { id: uid(), connector: "AND", conditions: [newCondition()] };
}

const emptyFilter = (): FilterQuery => ({ groups: [] });

const DEFAULT_SECTIONS: Section[] = [
  {
    id: "waiting_for_review",
    name: "Waiting for review",
    kind: "waiting_for_review",
    filter: emptyFilter(),
    repos: [],
    collapsed: false,
  },
  {
    id: "waiting_for_author",
    name: "Waiting for author",
    kind: "waiting_for_author",
    filter: emptyFilter(),
    repos: [],
    collapsed: false,
  },
  {
    id: "approved",
    name: "Approved",
    kind: "approved",
    filter: emptyFilter(),
    repos: [],
    collapsed: false,
  },
  {
    id: "production",
    name: "Production PRs",
    kind: "production",
    filter: {
      groups: [
        {
          id: uid(),
          connector: "OR",
          conditions: [
            { id: uid(), field: "label", operator: "is", value: "production" },
            { id: uid(), field: "baseBranch", operator: "contains", value: "release" },
          ],
        },
      ],
    },
    repos: [],
    collapsed: false,
  },
];

interface SectionState {
  sections: Section[];
  activeId: string;
  setActive: (id: string) => void;
  toggleCollapse: (id: string) => void;
  addSection: () => string;
  updateSection: (id: string, patch: Partial<Section>) => void;
  removeSection: (id: string) => void;
}

export const useSections = create<SectionState>((set, get) => ({
  sections: DEFAULT_SECTIONS,
  activeId: DEFAULT_SECTIONS[0].id,
  setActive: (id) => set({ activeId: id }),
  toggleCollapse: (id) =>
    set((s) => ({
      sections: s.sections.map((sec) =>
        sec.id === id ? { ...sec, collapsed: !sec.collapsed } : sec,
      ),
    })),
  addSection: () => {
    const id = uid();
    const section: Section = {
      id,
      name: "New section",
      kind: "custom",
      filter: { groups: [newGroup()] },
      repos: [],
      collapsed: false,
    };
    set((s) => ({ sections: [...s.sections, section], activeId: id }));
    return id;
  },
  updateSection: (id, patch) =>
    set((s) => ({
      sections: s.sections.map((sec) =>
        sec.id === id ? { ...sec, ...patch } : sec,
      ),
    })),
  removeSection: (id) =>
    set((s) => {
      const sections = s.sections.filter((sec) => sec.id !== id);
      const activeId =
        s.activeId === id ? (sections[0]?.id ?? "") : s.activeId;
      return { sections, activeId };
    }),
}));

export { uid };
