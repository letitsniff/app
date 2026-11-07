import { Skeleton } from "@/components/Skeleton";

export default function ServiceDetailLoading() {
  return (
    <div className="min-h-screen" aria-busy="true">
      <header className="border-b border-[var(--color-sandDark)]/60 bg-[var(--color-cream)] pt-12 pb-12 sm:pt-16 sm:pb-16">
        <div className="max-w-4xl mx-auto px-5">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-4 w-20" />
            <span className="text-[var(--color-muted)]">/</span>
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 sm:h-12 w-3/4 mb-4" />
          <Skeleton className="h-5 w-full max-w-xl mb-6" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-12 sm:py-16">
        <Skeleton className="w-full aspect-[16/10] sm:aspect-[21/9] rounded-sm mb-10" />
        <div className="space-y-4 max-w-2xl">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
}
