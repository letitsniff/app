import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-5 py-14 sm:py-20 md:py-28 animate-fadeIn" aria-busy="true">
      <div className="max-w-3xl mb-12">
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-10 sm:h-14 w-4/5 mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-8" />
        <div className="flex gap-4">
          <Skeleton className="h-12 w-36" />
          <Skeleton className="h-12 w-36" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-12 border-t border-[var(--color-sandDark)]/60">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white border border-[var(--color-sandDark)]/60 p-6 rounded-sm">
            <Skeleton className="h-5 w-24 mb-4" />
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
