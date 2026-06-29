"use client";

import Link from "next/link";
import {
  FileText,
  GitMerge,
  GitPullRequest,
  MessageSquare,
  TriangleAlert,
} from "lucide-react";
import type { PullRequest, ReviewDecision } from "@/types/pr";
import {
  Avatar,
  AvatarStack,
  Badge,
  DiffStat,
  StatusDot,
} from "@/components/ui/kit";
import { cn, relativeTime } from "@/lib/utils";

const reviewMeta: Record<
  NonNullable<ReviewDecision>,
  { label: string; className: string }
> = {
  APPROVED: { label: "Approved", className: "text-success" },
  CHANGES_REQUESTED: { label: "Changes requested", className: "text-danger" },
  REVIEW_REQUIRED: { label: "Review required", className: "text-warning" },
  COMMENTED: { label: "Commented", className: "text-info" },
};

function ReviewStatus({ decision }: { decision: ReviewDecision }) {
  if (!decision) return null;
  const meta = reviewMeta[decision];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", meta.className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

export function PRRow({ pr, active }: { pr: PullRequest; active?: boolean }) {
  const href = `/pr/${pr.repo.owner}/${pr.repo.name}/${pr.number}`;
  const reviewerUsers = pr.reviewers.map((r) => r.user);

  return (
    <Link
      href={href}
      data-active={active ? "true" : undefined}
      className={cn(
        "group block border-b border-border px-4 py-3 transition-colors hover:bg-surface-2/60",
        active &&
          "bg-surface-2/80 ring-1 ring-inset ring-primary/40 hover:bg-surface-2/80",
      )}
    >
      {/* Primary line */}
      <div className="flex items-center gap-2.5">
        <StatusDot status={pr.ciStatus} pulse title={`CI: ${pr.ciStatus ?? "none"}`} />

        {pr.isDraft ? (
          <GitPullRequest className="h-3.5 w-3.5 shrink-0 text-muted" />
        ) : (
          <GitPullRequest className="h-3.5 w-3.5 shrink-0 text-success" />
        )}

        <span className="shrink-0 font-mono text-xs text-muted">
          {pr.repo.nameWithOwner}
          <span className="text-fg/70"> #{pr.number}</span>
        </span>

        <span className="truncate text-sm font-medium text-fg group-hover:text-fg">
          {pr.title}
        </span>

        {pr.isDraft && (
          <Badge className="shrink-0 uppercase tracking-wide">Draft</Badge>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-3">
          {pr.mergeable === "CONFLICTING" && (
            <span
              className="inline-flex items-center gap-1 text-xs text-danger"
              title="Merge conflicts"
            >
              <TriangleAlert className="h-3.5 w-3.5" />
            </span>
          )}
          <DiffStat add={pr.additions} del={pr.deletions} />
        </div>
      </div>

      {/* Meta line */}
      <div className="mt-1.5 flex items-center gap-x-3 gap-y-1 pl-[26px] text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Avatar user={pr.author} size={16} />
          {pr.author.name ?? pr.author.login}
        </span>

        <ReviewStatus decision={pr.reviewDecision} />

        {reviewerUsers.length > 0 && (
          <span className="inline-flex items-center gap-1.5" title="Reviewers">
            <AvatarStack users={reviewerUsers} max={3} />
          </span>
        )}

        {pr.requestedReviewers.length > 0 && (
          <span className="inline-flex items-center gap-1" title="Requested reviewers">
            <span className="text-muted/70">requested</span>
            <AvatarStack users={pr.requestedReviewers} max={3} />
          </span>
        )}

        {pr.labels.map((l) => (
          <Badge key={l.name} color={l.color}>
            {l.name}
          </Badge>
        ))}

        <span className="ml-auto flex items-center gap-3">
          {pr.commentCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {pr.commentCount}
            </span>
          )}
          <span className="inline-flex items-center gap-1" title="Files changed">
            <FileText className="h-3.5 w-3.5" />
            {pr.changedFiles}
          </span>
          <span
            className="inline-flex items-center gap-1 font-mono"
            title={`base: ${pr.baseRefName}`}
          >
            <GitMerge className="h-3.5 w-3.5" />
            {pr.baseRefName}
          </span>
          <span className="tabular-nums">{relativeTime(pr.updatedAt)}</span>
        </span>
      </div>
    </Link>
  );
}
