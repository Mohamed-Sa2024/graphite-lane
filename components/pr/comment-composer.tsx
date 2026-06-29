"use client";

import * as React from "react";
import { Send, Check } from "lucide-react";
import { addComment } from "@/app/actions/review";
import type { User } from "@/types/pr";
import { Avatar, Button, Textarea, Spinner } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

export function CommentComposer({
  owner,
  repo,
  number,
  viewer,
  onPosted,
}: {
  owner: string;
  repo: string;
  number: number;
  viewer: User;
  onPosted?: (body: string) => void;
}) {
  const [body, setBody] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const submit = () => {
    if (!body.trim()) return;
    const text = body.trim();
    startTransition(async () => {
      const res = await addComment({ owner, repo, number, body: text });
      setResult(res);
      if (res.ok) {
        onPosted?.(text);
        setBody("");
      }
    });
  };

  return (
    <div className="flex gap-3">
      <Avatar user={viewer} size={28} />
      <div className="flex-1">
        <Textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Leave a comment…"
          className="text-sm"
        />
        <div className="mt-2 flex items-center gap-3">
          <Button variant="primary" size="sm" onClick={submit} disabled={pending}>
            {pending ? <Spinner className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
            Comment
          </Button>
          {result && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                result.ok ? "text-success" : "text-danger",
              )}
            >
              {result.ok && <Check className="h-3.5 w-3.5" />}
              {result.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
