import { Skeleton, ServiceCardSkeleton } from "@/components/Skeleton";

export default function ServicesLoading() {
  return (
    <div className="max-w-5xl mx-auto px-5 py-12 sm:py-16 md:py-24" aria-busy="true">
      {/* Header Skeleton */}
      <header className="mb-14 sm:mb-18 pb-10 border-b border-[var(--color-sandDark)]/60">
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-10 sm:h-12 w-2/3 mb-5" />
        <Skeleton className="h-4 w-full max-w-2xl mb-2" />
        <Skeleton className="h-4 w-4/5 max-w-xl" />
      </header>

      {/* Services List Skeletons */}
      <div className="space-y-8 md:space-y-12 mb-20">
        {[1, 2, 3].map((n) => (
          <ServiceCardSkeleton key={n} />
        ))}
      </div>
    </div>
  );
}
