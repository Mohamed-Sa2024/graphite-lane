"use client";

import {
  GitCommit,
  GitMerge,
  MessageSquare,
  Tag,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import type { TimelineEvent } from "@/types/pr";
import { Avatar } from "@/components/ui/kit";
import { Markdown } from "./markdown";
import { relativeTime } from "@/lib/utils";

const icon: Record<TimelineEvent["type"], React.ReactNode> = {
  comment: <MessageSquare className="h-3.5 w-3.5" />,
  review: <CheckCircle2 className="h-3.5 w-3.5" />,
  commit: <GitCommit className="h-3.5 w-3.5" />,
  label: <Tag className="h-3.5 w-3.5" />,
  merged: <GitMerge className="h-3.5 w-3.5" />,
  review_request: <UserPlus className="h-3.5 w-3.5" />,
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted">No activity yet.</p>;
  }

  return (
    <div className="space-y-4">
      {events.map((ev) => {
        const isComment = ev.type === "comment" && ev.body;
        return (
          <div key={ev.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-2 text-muted">
                {icon[ev.type]}
              </span>
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-2 text-sm">
                <Avatar user={ev.actor} size={18} />
                <span className="font-medium text-fg">
                  {ev.actor.name ?? ev.actor.login}
                </span>
                <span className="text-muted">
                  {ev.detail ?? (isComment ? "commented" : ev.type)}
                </span>
                <span className="text-xs text-muted">
                  · {relativeTime(ev.createdAt)}
                </span>
              </div>

              {isComment && (
                <div className="mt-2 rounded-lg border border-border bg-surface p-3">
                  <Markdown source={ev.body!} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
