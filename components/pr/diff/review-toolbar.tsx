"use client";

import * as React from "react";
import { Check, MessageSquare, X } from "lucide-react";
import { submitReview } from "@/app/actions/review";
import { Button, Textarea, Spinner } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

type Event = "APPROVE" | "REQUEST_CHANGES" | "COMMENT";

const eventMeta: Record<
  Event,
  { label: string; variant: "success" | "danger" | "secondary"; icon: React.ReactNode }
> = {
  APPROVE: { label: "Approve", variant: "success", icon: <Check className="h-3.5 w-3.5" /> },
  REQUEST_CHANGES: {
    label: "Request changes",
    variant: "danger",
    icon: <X className="h-3.5 w-3.5" />,
  },
  COMMENT: {
    label: "Comment",
    variant: "secondary",
    icon: <MessageSquare className="h-3.5 w-3.5" />,
  },
};

export function ReviewToolbar({
  owner,
  repo,
  number,
  viewedCount,
  totalFiles,
  pendingCount,
}: {
  owner: string;
  repo: string;
  number: number;
  viewedCount: number;
  totalFiles: number;
  pendingCount: number;
}) {
  const [event, setEvent] = React.useState<Event | null>(null);
  const [body, setBody] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const progress = totalFiles ? Math.round((viewedCount / totalFiles) * 100) : 0;

  const submit = () => {
    if (!event) return;
    startTransition(async () => {
      const res = await submitReview({ owner, repo, number, event, body });
      setResult(res);
      if (res.ok) {
        setBody("");
        setEvent(null);
      }
    });
  };

  return (
    <div className="border-t border-border bg-surface">
      {result && (
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs",
            result.ok ? "text-success" : "text-danger",
          )}
        >
          {result.ok ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          {result.message}
        </div>
      )}

      {event && (
        <div className="border-b border-border px-4 py-3">
          <Textarea
            autoFocus
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              event === "REQUEST_CHANGES"
                ? "Explain what needs to change…"
                : "Leave a summary comment (optional)…"
            }
            className="text-sm"
          />
        </div>
      )}

      <div className="flex items-center gap-4 px-4 py-2.5">
        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted">
            {viewedCount}/{totalFiles} viewed
          </span>
        </div>

        {pendingCount > 0 && (
          <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
            {pendingCount} pending comment{pendingCount === 1 ? "" : "s"}
          </span>
        )}

        <div className="flex-1" />

        {event ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEvent(null)} disabled={pending}>
              Cancel
            </Button>
            <Button variant={eventMeta[event].variant} size="sm" onClick={submit} disabled={pending}>
              {pending ? <Spinner className="h-3.5 w-3.5" /> : eventMeta[event].icon}
              Submit: {eventMeta[event].label.toLowerCase()}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {(Object.keys(eventMeta) as Event[]).map((e) => (
              <Button
                key={e}
                variant={eventMeta[e].variant}
                size="sm"
                onClick={() => {
                  setResult(null);
                  setEvent(e);
                }}
              >
                {eventMeta[e].icon}
                {eventMeta[e].label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
