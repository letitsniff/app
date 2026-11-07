import { Skeleton } from "@/components/Skeleton";

export default function ArticleLoading() {
  return (
    <article className="min-h-screen" aria-busy="true">
      {/* Header Skeleton */}
      <header className="border-b border-[var(--color-sandDark)]/60 bg-[var(--color-cream)] pt-12 pb-12 sm:pt-16 sm:pb-16">
        <div className="max-w-4xl mx-auto px-5">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-4 w-16" />
            <span className="text-[var(--color-muted)]">/</span>
            <Skeleton className="h-4 w-36" />
          </div>

          <Skeleton className="h-10 sm:h-14 w-full mb-4" />
          <Skeleton className="h-10 sm:h-14 w-3/4 mb-6" />

          <div className="flex items-center gap-3 pt-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </header>

      {/* Hero Image Skeleton */}
      <div className="max-w-4xl mx-auto px-5 pt-10 sm:pt-12">
        <Skeleton className="w-full aspect-[16/9] rounded-sm" />
      </div>

      {/* Body & Sidebar Skeleton */}
      <div className="max-w-5xl mx-auto px-5 py-12 sm:py-16 md:py-24">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-16 items-start">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <div className="py-6">
              <Skeleton className="h-7 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          <aside className="mt-16 lg:mt-0 space-y-6">
            <div className="bg-white border border-[var(--color-sandDark)]/60 p-6 rounded-sm">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-4/5 mb-5" />
              <Skeleton className="h-8 w-28" />
            </div>
            <div className="bg-[var(--color-sand)]/30 border border-[var(--color-sandDark)]/60 p-6 rounded-sm">
              <Skeleton className="h-4 w-28 mb-3" />
              <Skeleton className="h-6 w-1/2 mb-3" />
              <Skeleton className="h-3 w-full mb-4" />
              <Skeleton className="h-4 w-20" />
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
