import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "glass rounded-xl p-10 border border-white/[0.06] text-center flex flex-col items-center justify-center",
        className
      )}
    >
      <div className="w-14 h-14 rounded-xl bg-gold/5 border border-gold/15 flex items-center justify-center mb-4 text-gold/60">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>

      <h3 className="text-base font-medium text-text mb-1 tracking-tight">
        {title}
      </h3>

      <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed mb-5">
        {description}
      </p>

      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
