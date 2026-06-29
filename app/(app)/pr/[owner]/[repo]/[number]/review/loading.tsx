import { Skeleton } from "@/components/ui/kit";

export default function ReviewLoading() {
  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-64" />
        <div className="ml-auto">
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-72 shrink-0 border-r border-border p-3 md:block">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="mb-2 h-7 w-full" />
          ))}
        </div>
        <div className="flex-1 space-y-4 p-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
