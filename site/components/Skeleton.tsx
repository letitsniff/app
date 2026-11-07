import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--color-sand)]/70 rounded-xs ${className}`}
      {...props}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-[var(--color-sandDark)]/60 rounded-sm overflow-hidden p-6 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-7 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-6" />
      <div className="pt-4 border-t border-[var(--color-sand)]/70 flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="bg-white border border-[var(--color-sandDark)]/60 rounded-sm overflow-hidden flex flex-col md:flex-row shadow-xs">
      <Skeleton className="md:w-72 lg:w-80 h-52 md:h-auto aspect-[16/10] shrink-0" />
      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
        <div>
          <Skeleton className="h-4 w-28 mb-3" />
          <Skeleton className="h-7 w-4/5 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-5" />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="bg-white border border-[var(--color-sandDark)]/60 rounded-sm overflow-hidden flex flex-col sm:flex-row shadow-xs">
      <Skeleton className="sm:w-64 md:w-80 aspect-[16/10] shrink-0" />
      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
        <div>
          <Skeleton className="h-7 w-2/3 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5 mb-6" />
        </div>
        <div className="pt-4 border-t border-[var(--color-sand)]/70 flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
