import React from "react";
import { cn } from "@/lib/utils";

export type StatusType =
  | "active"
  | "playing"
  | "won"
  | "lost"
  | "cashed_out"
  | "idle"
  | "online"
  | "offline"
  | "blocked"
  | "error"
  | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const normalized = (status || "").toLowerCase().trim();

  let badgeClasses = "bg-white/[0.03] border-void-border text-text-muted";
  let dotClasses = "bg-text-dim";
  let hasPulse = false;
  let displayLabel = label || status;

  switch (normalized) {
    case "active":
    case "playing":
    case "won":
      badgeClasses = "bg-success/10 border-success/30 text-success";
      dotClasses = "bg-success";
      hasPulse = true;
      if (!label && normalized === "playing") displayLabel = "Playing";
      if (!label && normalized === "active") displayLabel = "Active";
      if (!label && normalized === "won") displayLabel = "Won";
      break;

    case "cashed_out":
    case "cashout":
      badgeClasses = "bg-gold/10 border-gold/30 text-gold";
      dotClasses = "bg-gold";
      if (!label) displayLabel = "Cashed Out";
      break;

    case "lost":
    case "blocked":
    case "error":
      badgeClasses = "bg-danger/10 border-danger/30 text-danger";
      dotClasses = "bg-danger";
      if (!label && normalized === "lost") displayLabel = "Lost";
      if (!label && normalized === "blocked") displayLabel = "Blocked";
      if (!label && normalized === "error") displayLabel = "Error";
      break;

    case "online":
    case "idle":
      badgeClasses = "bg-success/10 border-success/20 text-success";
      dotClasses = "bg-success";
      if (!label && normalized === "idle") displayLabel = "Idle";
      if (!label && normalized === "online") displayLabel = "Online";
      break;

    case "offline":
    default:
      badgeClasses = "bg-white/[0.02] border-white/[0.08] text-text-muted";
      dotClasses = "bg-text-dim";
      if (!label && normalized === "offline") displayLabel = "Offline";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-medium border transition-colors",
        badgeClasses,
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0",
          dotClasses,
          hasPulse && "animate-pulse"
        )}
      />
      <span>{displayLabel}</span>
    </span>
  );
}
