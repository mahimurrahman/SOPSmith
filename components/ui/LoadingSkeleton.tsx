import { cn } from "@/lib/cn";

type LoadingSkeletonProps = {
  className?: string;
};

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return <div className={cn("animate-pulse rounded-[1.5rem] skeleton-block", className)} />;
}
