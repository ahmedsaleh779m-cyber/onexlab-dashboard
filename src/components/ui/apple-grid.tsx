import React from "react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/utils/format";
import { AlertCircle } from "lucide-react";

export interface AppleGridProps {
  grid?: number[][];
  currentStep?: number;
  chosenColumns?: number[];
  forcedOutcome?: string | null;
  betSum?: number | string;
  status?: string;
  size?: "sm" | "md" | "lg";
  showFooter?: boolean;
  className?: string;
}

const STEP_MULTIPLIERS = [
  "1.23x",
  "1.54x",
  "1.93x",
  "2.41x",
  "4.02x",
  "6.71x",
  "11.18x",
  "27.92x",
  "69.80x",
  "349.0x",
];

export function AppleGrid({
  grid,
  currentStep = 0,
  chosenColumns = [],
  forcedOutcome,
  betSum,
  status = "active",
  size = "md",
  showFooter = true,
  className,
}: AppleGridProps) {
  // Safe 10x5 grid fallback
  const safeGrid =
    grid && grid.length === 10
      ? grid
      : Array.from({ length: 10 }, () => [1, 0, 0, 0, 0]);

  const normalizedStatus = (status || "active").toLowerCase();
  const isGameFinished =
    normalizedStatus === "won" ||
    normalizedStatus === "lost" ||
    normalizedStatus === "cashed_out" ||
    normalizedStatus === "cashout";

  const sizeClasses = {
    sm: {
      cell: "h-5 sm:h-6 text-[9px]",
      gap: "gap-1",
      rowPad: "py-0.5 px-1",
      colHeader: "text-[8px] h-4",
      rowNum: "text-[8px] w-4",
      multiplier: "text-[8px] w-10",
    },
    md: {
      cell: "h-7 sm:h-8 text-[10px]",
      gap: "gap-1.5",
      rowPad: "py-1 px-1.5",
      colHeader: "text-[10px] h-5",
      rowNum: "text-[10px] w-5",
      multiplier: "text-[9px] w-12",
    },
    lg: {
      cell: "h-8 sm:h-9 text-xs",
      gap: "gap-2",
      rowPad: "py-1 px-2",
      colHeader: "text-xs h-6",
      rowNum: "text-xs w-6",
      multiplier: "text-[10px] w-14",
    },
  }[size];

  const progressPercent = Math.min(100, Math.max(0, (currentStep / 10) * 100));

  return (
    <div
      className={cn(
        "glass rounded-xl p-4 border border-white/[0.06] flex flex-col justify-between select-none relative overflow-hidden",
        className
      )}
    >
      {/* Forced Outcome Warning Ribbon */}
      {forcedOutcome && (
        <div className="mb-3 px-2.5 py-1 rounded-md bg-warning/10 border border-warning/30 flex items-center justify-between gap-2 text-warning">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider font-semibold">
            <AlertCircle className="w-3 h-3" />
            <span>FORCED OUTCOME: {forcedOutcome.toUpperCase()}</span>
          </div>
          <span className="text-[9px] font-mono opacity-80">ACTIVE HOOK</span>
        </div>
      )}

      {/* Grid Container */}
      <div className="w-full">
        {/* Column Headers (1 to 5) */}
        <div className="flex items-center mb-1">
          <div className={cn("shrink-0", sizeClasses.rowNum)} />
          <div className={cn("grid grid-cols-5 flex-1", sizeClasses.gap)}>
            {[1, 2, 3, 4, 5].map((col) => (
              <div
                key={col}
                className={cn(
                  "flex items-center justify-center font-mono text-text-dim uppercase tracking-wider font-medium",
                  sizeClasses.colHeader
                )}
              >
                {col}
              </div>
            ))}
          </div>
          <div className={cn("shrink-0", sizeClasses.multiplier)} />
        </div>

        {/* 10 Rows */}
        <div className="space-y-1">
          {safeGrid.map((row, rIndex) => {
            const rowNumber = rIndex + 1;
            const isCurrentRow = !isGameFinished && rIndex === currentStep;
            const isPastRow = rIndex < currentStep;
            const isFutureRow = !isGameFinished && rIndex > currentStep;

            // Chosen column for this row (1-indexed in chosenColumns array)
            const chosenCol =
              chosenColumns && chosenColumns[rIndex] !== undefined
                ? chosenColumns[rIndex]
                : null;

            return (
              <div
                key={rIndex}
                className={cn(
                  "flex items-center rounded-md transition-all duration-150",
                  sizeClasses.rowPad,
                  isCurrentRow &&
                    "ring-1 ring-gold/60 bg-gold/[0.04] shadow-[0_0_15px_-3px_rgba(212,175,55,0.2)]",
                  isFutureRow && "opacity-40",
                  isPastRow && "opacity-85",
                  isGameFinished && "opacity-90"
                )}
              >
                {/* Row Number Label */}
                <div
                  className={cn(
                    "shrink-0 font-mono text-text-muted font-medium text-center",
                    sizeClasses.rowNum,
                    isCurrentRow && "text-gold font-semibold"
                  )}
                >
                  {rowNumber}
                </div>

                {/* 5 Column Cells */}
                <div
                  className={cn("grid grid-cols-5 flex-1", sizeClasses.gap)}
                >
                  {row.map((val, cIndex) => {
                    const colNumber = cIndex + 1;
                    const isGood = val === 1;
                    const isChosen = chosenCol === colNumber;
                    const isGoodInCurrentRow = isCurrentRow && isGood;

                    return (
                      <div
                        key={cIndex}
                        className={cn(
                          "rounded-md aspect-square flex items-center justify-center relative transition-all duration-150",
                          sizeClasses.cell,
                          // Cell type background & border
                          isGood
                            ? "bg-gold/20 border border-gold/40 shadow-[0_0_8px_rgba(212,175,55,0.15)]"
                            : "bg-white/[0.02] border border-white/[0.06]",
                          // Current row hint pulse on good apple
                          isGoodInCurrentRow && "animate-pulse border-gold/70",
                          // Player choice ring & dot
                          isChosen &&
                            "ring-2 ring-gold ring-offset-1 ring-offset-black bg-gold/30 shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                        )}
                      >
                        {/* Dot indicator for chosen cell */}
                        {isChosen && (
                          <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_6px_#d4af37]" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Multiplier Label on Right */}
                <div
                  className={cn(
                    "shrink-0 font-mono text-right text-text-dim",
                    sizeClasses.multiplier,
                    isCurrentRow && "text-gold font-semibold",
                    isPastRow && "text-text-muted"
                  )}
                >
                  {STEP_MULTIPLIERS[rIndex]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Readout & Progress */}
      {showFooter && (
        <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-text font-semibold">
                Step {Math.min(10, currentStep)} / 10
              </span>
              <StatusBadge status={status} />
            </div>

            {betSum !== undefined && (
              <span className="font-mono text-xs text-gold font-semibold">
                {formatCurrency(betSum)}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
