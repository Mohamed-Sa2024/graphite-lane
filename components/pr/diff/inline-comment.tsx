"use client";

import type { InlineComment as InlineCommentType } from "@/types/pr";
import { Avatar } from "@/components/ui/kit";
import { Markdown } from "@/components/pr/markdown";
import { relativeTime } from "@/lib/utils";

export function InlineCommentCard({ comment }: { comment: InlineCommentType }) {
  return (
    <div className="border-y border-border bg-surface px-4 py-3">
      <div className="rounded-lg border border-border bg-surface-2/40 p-3">
        <div className="mb-1.5 flex items-center gap-2">
          <Avatar user={comment.author} size={18} />
          <span className="text-xs font-medium text-fg">
            {comment.author.name ?? comment.author.login}
          </span>
          <span className="text-xs text-muted">
            {relativeTime(comment.createdAt)}
          </span>
          {comment.pending && (
            <span className="rounded-full border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning">
              Pending
            </span>
          )}
        </div>
        <Markdown source={comment.body} />
      </div>
    </div>
  );
}
