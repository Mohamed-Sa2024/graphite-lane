"use client";

import { Inbox } from "lucide-react";

export function EmptyState({
  title = "Nothing here",
  hint,
}: {
  title?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center animate-fade-in">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted">
        <Inbox className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-fg">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-sm text-muted">{hint}</p>}
    </div>
  );
}
