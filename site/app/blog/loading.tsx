import { Skeleton, CardSkeleton } from "@/components/Skeleton";

export default function BlogLoading() {
  return (
    <div className="max-w-5xl mx-auto px-5 py-12 sm:py-16 md:py-24" aria-busy="true">
      {/* Header skeleton */}
      <header className="mb-14 sm:mb-18 pb-10 border-b border-[var(--color-sandDark)]/60">
        <Skeleton className="h-4 w-48 mb-3" />
        <Skeleton className="h-10 sm:h-12 w-3/4 mb-5" />
        <Skeleton className="h-4 w-full max-w-2xl mb-2" />
        <Skeleton className="h-4 w-4/5 max-w-xl mb-8" />

        {/* Quick jump skeleton pills */}
        <div className="pt-6 border-t border-[var(--color-sand)]/70">
          <Skeleton className="h-3 w-32 mb-3" />
          <div className="flex gap-2.5 overflow-x-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-full shrink-0" />
            ))}
          </div>
        </div>
      </header>

      {/* Grid skeletons */}
      <div className="space-y-16">
        <div>
          <div className="border-b border-[var(--color-sandDark)]/80 pb-5 mb-8 flex justify-between items-center">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <CardSkeleton key={n} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
