import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-5 py-10 sm:py-14 md:py-20 animate-fadeIn" aria-busy="true">
      <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center mb-16 pb-12 border-b border-[var(--color-sandDark)]/60">
        <div className="md:col-span-7">
          <Skeleton className="h-10 sm:h-14 w-11/12 mb-3" />
          <Skeleton className="h-10 sm:h-14 w-3/4 mb-6" />
          <Skeleton className="h-4 w-full mb-2.5" />
          <Skeleton className="h-4 w-5/6 mb-8" />
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Skeleton className="h-12 w-full sm:w-44" />
            <Skeleton className="h-12 w-full sm:w-44" />
          </div>
        </div>
        <div className="md:col-span-5">
          <Skeleton className="aspect-[4/3] w-full rounded-sm" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="bg-white border border-[var(--color-sandDark)]/60 p-6 rounded-sm">
            <Skeleton className="aspect-[16/10] w-full mb-5" />
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
