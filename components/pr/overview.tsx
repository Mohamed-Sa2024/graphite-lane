"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  GitMerge,
  GitPullRequest,
  Lock,
} from "lucide-react";
import type { PullRequestDetail, TimelineEvent, User } from "@/types/pr";
import { usePRDetail } from "@/hooks/use-pull-requests";
import { uid } from "@/store/sections";
import { Avatar, Badge, Button, DiffStat, StatusDot } from "@/components/ui/kit";
import { cn, relativeTime } from "@/lib/utils";
import { Markdown } from "./markdown";
import { Timeline } from "./timeline";
import { ReviewStatusPanel } from "./review-status";
import { ChecksPanel } from "./checks";
import { CommentComposer } from "./comment-composer";

const stateMeta = {
  OPEN: { label: "Open", cls: "bg-success/15 text-success" },
  MERGED: { label: "Merged", cls: "bg-primary/15 text-primary" },
  CLOSED: { label: "Closed", cls: "bg-danger/15 text-danger" },
};

const mergeMeta = {
  MERGEABLE: { label: "No conflicts with base branch", cls: "text-success" },
  CONFLICTING: { label: "This branch has conflicts", cls: "text-danger" },
  UNKNOWN: { label: "Checking mergeability…", cls: "text-muted" },
};

export function Overview({
  detail: initial,
  viewer,
}: {
  detail: PullRequestDetail;
  viewer: User;
}) {
  const { data } = usePRDetail(
    initial.repo.owner,
    initial.repo.name,
    initial.number,
    initial,
  );
  const pr = data ?? initial;
  const owner = pr.repo.owner;
  const repo = pr.repo.name;

  // Optimistically show comments the viewer posts this session, appended to
  // the server-provided activity.
  const [posted, setPosted] = React.useState<TimelineEvent[]>([]);
  const timeline = React.useMemo(
    () => [...pr.timeline, ...posted],
    [pr.timeline, posted],
  );

  const handlePosted = (body: string) =>
    setPosted((prev) => [
      ...prev,
      {
        id: uid(),
        type: "comment",
        actor: viewer,
        createdAt: new Date().toISOString(),
        body,
      },
    ]);

  const state = pr.isDraft
    ? { label: "Draft", cls: "bg-surface-2 text-muted" }
    : stateMeta[pr.state];

  return (
    <div className="h-full overflow-y-auto bg-bg">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                state.cls,
              )}
            >
              <GitPullRequest className="h-3.5 w-3.5" />
              {state.label}
            </span>
            <span className="font-mono text-sm text-muted">
              {pr.repo.nameWithOwner} #{pr.number}
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            {pr.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Avatar user={pr.author} size={20} />
              <span className="text-fg">{pr.author.name ?? pr.author.login}</span>
              opened {relativeTime(pr.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs">
              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-fg">
                {pr.headRefName}
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-fg">
                {pr.baseRefName}
              </span>
            </span>
            <DiffStat add={pr.additions} del={pr.deletions} />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Link href={`/pr/${owner}/${repo}/${pr.number}/review`}>
              <Button variant="primary" size="md">
                <GitPullRequest className="h-4 w-4" />
                Finish your review
              </Button>
            </Link>

            <Button
              variant="secondary"
              size="md"
              disabled
              title="Merging is read-only in this demo"
            >
              <GitMerge className="h-4 w-4" />
              Merge
              <Lock className="ml-0.5 h-3 w-3 opacity-60" />
            </Button>

            <a href={pr.url} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="md">
                <ExternalLink className="h-4 w-4" />
                GitHub
              </Button>
            </a>
          </div>
        </div>

        {/* Body grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0 space-y-6">
            <section className="rounded-xl border border-border bg-surface p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Description
              </h2>
              {pr.body ? (
                <Markdown source={pr.body} />
              ) : (
                <p className="text-sm text-muted">No description provided.</p>
              )}
            </section>

            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
                Activity
              </h2>
              <Timeline events={timeline} />
            </section>

            <section className="rounded-xl border border-border bg-surface p-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
                Add a comment
              </h2>
              <CommentComposer
                owner={owner}
                repo={repo}
                number={pr.number}
                viewer={viewer}
                onPosted={handlePosted}
              />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-xl border border-border bg-surface p-4">
              <ReviewStatusPanel
                decision={pr.reviewDecision}
                reviewers={pr.reviewers}
                requestedReviewers={pr.requestedReviewers}
              />
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <ChecksPanel checks={pr.checks} />
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Labels
              </h3>
              {pr.labels.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {pr.labels.map((l) => (
                    <Badge key={l.name} color={l.color}>
                      {l.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">None</p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Merge status
              </h3>
              <div className="flex items-start gap-2">
                <StatusDot status={pr.ciStatus} />
                <div>
                  <p className={cn("text-sm", mergeMeta[pr.mergeable].cls)}>
                    {mergeMeta[pr.mergeable].label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {pr.changedFiles} file{pr.changedFiles === 1 ? "" : "s"} changed
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
