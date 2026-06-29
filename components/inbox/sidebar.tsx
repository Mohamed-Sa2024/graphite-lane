"use client";

import { Plus, Settings2 } from "lucide-react";
import type { Section } from "@/store/sections";
import { cn } from "@/lib/utils";

const kindAccent: Record<string, string> = {
  waiting_for_review: "var(--warning)",
  waiting_for_author: "var(--info)",
  approved: "var(--success)",
  production: "var(--primary)",
  custom: "var(--muted)",
};

export function Sidebar({
  sections,
  counts,
  activeId,
  onSelect,
  onEdit,
  onAdd,
}: {
  sections: Section[];
  counts: Record<string, number>;
  activeId: string;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="px-3 py-3">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Sections
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
        {sections.map((section) => {
          const active = section.id === activeId;
          const count = counts[section.id] ?? 0;
          return (
            <div
              key={section.id}
              className={cn(
                "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                active
                  ? "bg-surface-2 text-fg"
                  : "text-muted hover:bg-surface-2/60 hover:text-fg",
              )}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: kindAccent[section.kind] ?? "var(--muted)" }}
              />
              <button
                onClick={() => onSelect(section.id)}
                className="flex-1 truncate text-left"
                title={section.name}
              >
                {section.name}
              </button>
              <button
                onClick={() => onEdit(section.id)}
                aria-label={`Edit ${section.name}`}
                className="hidden rounded p-0.5 text-muted hover:text-fg group-hover:block"
              >
                <Settings2 className="h-3.5 w-3.5" />
              </button>
              <span
                className={cn(
                  "min-w-[20px] rounded-full px-1.5 text-center text-[11px] font-medium tabular-nums",
                  active ? "bg-primary/15 text-primary" : "text-muted",
                )}
              >
                {count}
              </span>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border p-2">
        <button
          onClick={onAdd}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <Plus className="h-4 w-4" />
          Add section
        </button>
      </div>
    </aside>
  );
}
