import { Skeleton, CardSkeleton } from "@/components/Skeleton";

export default function CategoryLoading() {
  return (
    <div className="min-h-screen" aria-busy="true">
      {/* Category Header Skeleton */}
      <header className="border-b border-[var(--color-sandDark)]/60 bg-[var(--color-cream)] pt-12 pb-12 sm:pt-16 sm:pb-16">
        <div className="max-w-4xl mx-auto px-5">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-4 w-16" />
            <span className="text-[var(--color-muted)]">/</span>
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-5 w-24 rounded-xs" />
            <Skeleton className="h-4 w-16" />
          </div>

          <Skeleton className="h-10 sm:h-14 w-4/5 mb-5" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />

          <Skeleton className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-sm mt-6" />
        </div>
      </header>

      {/* Articles Grid Skeleton */}
      <div className="max-w-4xl mx-auto px-5 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <CardSkeleton key={n} />
          ))}
        </div>
      </div>
    </div>
  );
}
