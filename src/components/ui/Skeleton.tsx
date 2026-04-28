import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={clsx("skeleton rounded-xl", className)} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-ink/5">
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}
