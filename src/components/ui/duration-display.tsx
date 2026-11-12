import React from "react";
import { parseISO, differenceInSeconds } from "date-fns";
import { cn } from "@/lib/utils";

interface DurationDisplayProps {
  startedAt?: string | Date | null;
  endedAt?: string | Date | null;
  className?: string;
}

export function DurationDisplay({
  startedAt,
  endedAt,
  className,
}: DurationDisplayProps) {
  if (!startedAt) {
    return <span className={cn("font-mono text-xs text-text-muted", className)}>—</span>;
  }

  try {
    const startDate = typeof startedAt === "string" ? parseISO(startedAt) : startedAt;
    const endDate = endedAt
      ? typeof endedAt === "string"
        ? parseISO(endedAt)
        : endedAt
      : new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return <span className={cn("font-mono text-xs text-text-muted", className)}>—</span>;
    }

    const totalSecs = Math.max(0, differenceInSeconds(endDate, startDate));
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    let formatted = "";
    if (hours > 0) {
      formatted = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      formatted = `${minutes}m ${seconds}s`;
    } else {
      formatted = `${seconds}s`;
    }

    if (!endedAt) {
      return (
        <span className={cn("font-mono text-xs text-success flex items-center gap-1", className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
          Active for {formatted}
        </span>
      );
    }

    return (
      <span className={cn("font-mono text-xs text-text-muted", className)}>
        {formatted}
      </span>
    );
  } catch {
    return <span className={cn("font-mono text-xs text-text-muted", className)}>—</span>;
  }
}
