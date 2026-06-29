"use client";

import { Skeleton } from "@/components/ui/kit";

export function PRRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      <Skeleton className="h-2.5 w-2.5 rounded-full" />
      <Skeleton className="h-4 w-10" />
      <Skeleton className="h-4 flex-1 max-w-[340px]" />
      <div className="flex-1" />
      <Skeleton className="h-5 w-5 rounded-full" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-12" />
    </div>
  );
}

export function InboxSkeleton() {
  return (
    <div className="animate-fade-in">
      {Array.from({ length: 8 }).map((_, i) => (
        <PRRowSkeleton key={i} />
      ))}
    </div>
  );
}
