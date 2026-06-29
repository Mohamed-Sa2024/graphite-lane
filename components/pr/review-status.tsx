"use client";

import type { Reviewer, ReviewDecision, User } from "@/types/pr";
import { Avatar } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

const stateMeta: Record<
  Reviewer["state"],
  { label: string; cls: string }
> = {
  APPROVED: { label: "approved", cls: "text-success" },
  CHANGES_REQUESTED: { label: "requested changes", cls: "text-danger" },
  COMMENTED: { label: "commented", cls: "text-info" },
  PENDING: { label: "pending", cls: "text-muted" },
};

const decisionMeta: Record<
  NonNullable<ReviewDecision>,
  { label: string; cls: string }
> = {
  APPROVED: { label: "Approved", cls: "bg-success/15 text-success" },
  CHANGES_REQUESTED: {
    label: "Changes requested",
    cls: "bg-danger/15 text-danger",
  },
  REVIEW_REQUIRED: { label: "Review required", cls: "bg-warning/15 text-warning" },
  COMMENTED: { label: "Commented", cls: "bg-info/15 text-info" },
};

export function ReviewStatusPanel({
  decision,
  reviewers,
  requestedReviewers,
}: {
  decision: ReviewDecision;
  reviewers: Reviewer[];
  requestedReviewers: User[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Reviews
        </h3>
        {decision && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              decisionMeta[decision].cls,
            )}
          >
            {decisionMeta[decision].label}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {reviewers.length === 0 && requestedReviewers.length === 0 && (
          <p className="text-sm text-muted">No reviewers yet.</p>
        )}

        {reviewers.map((r) => (
          <div key={r.user.login} className="flex items-center gap-2">
            <Avatar user={r.user} size={20} />
            <span className="text-sm text-fg">{r.user.name ?? r.user.login}</span>
            <span className={cn("ml-auto text-xs", stateMeta[r.state].cls)}>
              {stateMeta[r.state].label}
            </span>
          </div>
        ))}

        {requestedReviewers.map((u) => (
          <div key={u.login} className="flex items-center gap-2">
            <Avatar user={u} size={20} className="opacity-70" />
            <span className="text-sm text-muted">{u.name ?? u.login}</span>
            <span className="ml-auto text-xs text-muted">awaiting</span>
          </div>
        ))}
      </div>
    </div>
  );
}
