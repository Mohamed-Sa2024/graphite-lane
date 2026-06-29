"use client";

import * as React from "react";
import { ErrorState, describeError } from "@/components/ui/error-state";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Surface for observability; replace with your logger in production.
    console.error(error);
  }, [error]);

  const { message, hint } = describeError(error);

  return (
    <div className="flex h-full items-center justify-center">
      <ErrorState
        title="This view failed to load"
        message={message}
        hint={hint}
        onRetry={reset}
      />
    </div>
  );
}
