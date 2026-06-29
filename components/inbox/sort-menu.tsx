"use client";

import { ArrowUpDown, Check } from "lucide-react";
import { Menu, MenuItem } from "@/components/ui/overlay";
import { useUI, type SortKey } from "@/store/ui";

const OPTIONS: { key: SortKey; label: string }[] = [
  { key: "updated", label: "Recently updated" },
  { key: "created", label: "Newest" },
  { key: "additions", label: "Largest diff" },
  { key: "title", label: "Title (A–Z)" },
];

export function SortMenu() {
  const sort = useUI((s) => s.sort);
  const setSort = useUI((s) => s.setSort);
  const current = OPTIONS.find((o) => o.key === sort) ?? OPTIONS[0];

  return (
    <Menu
      align="end"
      trigger={
        <button className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-xs text-fg transition-colors hover:bg-surface-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted" />
          {current.label}
        </button>
      }
    >
      {(close) => (
        <>
          {OPTIONS.map((o) => (
            <MenuItem
              key={o.key}
              active={o.key === sort}
              onClick={() => {
                setSort(o.key);
                close();
              }}
            >
              <span className="flex-1">{o.label}</span>
              {o.key === sort && <Check className="h-3.5 w-3.5" />}
            </MenuItem>
          ))}
        </>
      )}
    </Menu>
  );
}
