import { Skeleton } from "@/components/Skeleton";

export default function AboutLoading() {
  return (
    <div className="min-h-screen" aria-busy="true">
      <header className="border-b border-[var(--color-sandDark)]/60 bg-[var(--color-cream)] pt-14 pb-14 sm:pt-20 sm:pb-20">
        <div className="max-w-4xl mx-auto px-5">
          <Skeleton className="h-4 w-28 mb-4" />
          <Skeleton className="h-10 sm:h-14 w-2/3 mb-6" />
          <Skeleton className="h-5 w-full max-w-xl mb-4" />
          <Skeleton className="h-5 w-4/5 max-w-lg" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
        <div className="grid md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-7 space-y-4">
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-8 w-3/4 mb-6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="md:col-span-5">
            <Skeleton className="w-full aspect-[4/5] rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
