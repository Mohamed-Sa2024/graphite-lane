"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./kit";

export function ErrorState({
  title = "Something went wrong",
  message,
  hint,
  onRetry,
}: {
  title?: string;
  message?: string;
  hint?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center animate-fade-in">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-danger/30 bg-danger/10 text-danger">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-fg">{title}</p>
      {message && (
        <p className="mt-1 max-w-md break-words text-sm text-muted">{message}</p>
      )}
      {hint && <p className="mt-1 max-w-md text-xs text-muted">{hint}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-5">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}

/** Map a thrown fetch/GitHub error to friendly copy. */
export function describeError(err: unknown): { message: string; hint?: string } {
  const e = err as { message?: string; type?: string; status?: number };
  const type = e?.type;
  if (type === "rate_limit" || e?.status === 429) {
    return {
      message: "GitHub's API rate limit was reached.",
      hint: "Wait a moment before retrying, or sign in to raise your limit.",
    };
  }
  if (type === "auth" || e?.status === 401) {
    return {
      message: "Your GitHub session has expired.",
      hint: "Sign out and sign back in to continue.",
    };
  }
  if (type === "not_found" || e?.status === 404) {
    return { message: "We couldn't find that on GitHub." };
  }
  if (type === "network") {
    return {
      message: "A network error occurred reaching GitHub.",
      hint: "Check your connection and try again.",
    };
  }
  return { message: e?.message || "An unexpected error occurred." };
}
