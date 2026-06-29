"use client";

import type { CheckRun } from "@/types/pr";
import { StatusDot } from "@/components/ui/kit";

export function ChecksPanel({ checks }: { checks: CheckRun[] }) {
  if (checks.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Checks
        </h3>
        <p className="text-sm text-muted">No checks reported.</p>
      </div>
    );
  }

  const passed = checks.filter((c) => c.status === "SUCCESS").length;
  const failed = checks.filter((c) => c.status === "FAILURE").length;
  const pendingN = checks.filter(
    (c) => c.status === "PENDING" || c.status === "EXPECTED",
  ).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Checks
        </h3>
        <span className="text-[11px] text-muted">
          {passed} passed
          {failed > 0 && <span className="text-danger"> · {failed} failed</span>}
          {pendingN > 0 && (
            <span className="text-warning"> · {pendingN} running</span>
          )}
        </span>
      </div>

      <div className="space-y-1.5">
        {checks.map((c) => (
          <div key={c.name} className="flex items-center gap-2">
            <StatusDot status={c.status} pulse />
            <span className="font-mono text-xs text-fg">{c.name}</span>
            <span className="ml-auto text-[11px] capitalize text-muted">
              {(c.status ?? "expected").toLowerCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
