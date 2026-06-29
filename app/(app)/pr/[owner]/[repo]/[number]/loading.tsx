import { Skeleton } from "@/components/ui/kit";

export default function OverviewLoading() {
  return (
    <div className="h-full overflow-hidden bg-bg">
      <div className="mx-auto max-w-6xl px-6 py-6 animate-fade-in">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-3 h-8 w-2/3" />
        <Skeleton className="mt-4 h-5 w-80" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
