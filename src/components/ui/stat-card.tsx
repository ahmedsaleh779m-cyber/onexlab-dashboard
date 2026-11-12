import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accent?: "gold" | "success" | "danger" | "warning";
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "gold",
  loading = false,
  className,
}: StatCardProps) {
  const accentBorderMap = {
    gold: "group-hover:border-gold/30",
    success: "group-hover:border-success/30",
    danger: "group-hover:border-danger/30",
    warning: "group-hover:border-warning/30",
  };

  const accentColorMap = {
    gold: "text-gold",
    success: "text-success",
    danger: "text-danger",
    warning: "text-warning",
  };

  if (loading) {
    return (
      <div
        className={cn(
          "glass rounded-xl p-5 border border-white/[0.06] animate-pulse space-y-3",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-white/[0.05] rounded" />
          <div className="h-4 w-4 bg-white/[0.05] rounded" />
        </div>
        <div className="h-8 w-28 bg-white/[0.08] rounded" />
        <div className="h-3 w-24 bg-white/[0.04] rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group glass rounded-xl p-5 border border-white/[0.06] transition-colors duration-150 relative overflow-hidden",
        accentBorderMap[accent],
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider font-medium text-text-muted">
          {label}
        </span>
        {Icon && (
          <div
            className={cn(
              "w-7 h-7 rounded-md bg-white/[0.02] border border-white/[0.05] flex items-center justify-center shrink-0",
              accentColorMap[accent]
            )}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="text-3xl font-mono font-semibold tracking-tight text-text">
        {value}
      </div>

      {hint && (
        <div className="mt-2 text-xs text-text-muted truncate font-sans">
          {hint}
        </div>
      )}
    </div>
  );
}
