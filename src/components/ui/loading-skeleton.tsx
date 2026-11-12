import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
  rowClassName?: string;
}

export function LoadingSkeleton({
  count = 6,
  className,
  rowClassName,
}: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-2 w-full", className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={cn(
            "h-14 glass rounded-lg border border-white/[0.04] animate-pulse bg-white/[0.02]",
            rowClassName
          )}
        />
      ))}
    </div>
  );
}
