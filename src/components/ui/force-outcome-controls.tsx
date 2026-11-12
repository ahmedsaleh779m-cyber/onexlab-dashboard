import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForceSession } from "@/lib/api/hooks";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, XCircle, DollarSign, X } from "lucide-react";

interface ForceOutcomeControlsProps {
  sessionId?: string | null;
  currentOutcome?: string | null;
  className?: string;
  onSuccess?: () => void;
}

export function ForceOutcomeControls({
  sessionId,
  currentOutcome,
  className,
  onSuccess,
}: ForceOutcomeControlsProps) {
  const [targetOutcome, setTargetOutcome] = useState<"win" | "lose" | "cashout" | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const forceMutation = useForceSession(sessionId || "");

  const handleOpenConfirm = (outcome: "win" | "lose" | "cashout") => {
    if (!sessionId) {
      toast.error("No active session ID associated with this game");
      return;
    }
    setTargetOutcome(outcome);
    setIsConfirmOpen(true);
  };

  const handleExecuteForce = async () => {
    if (!sessionId || !targetOutcome) return;
    try {
      const res = await forceMutation.mutateAsync(targetOutcome);
      toast.success(
        `Session forced to ${targetOutcome.toUpperCase()}${
          res.in_memory_updated ? " (live memory updated)" : ""
        }`
      );
      setIsConfirmOpen(false);
      onSuccess?.();
    } catch {
      // toast in hook
    }
  };

  const handleClearForce = async () => {
    if (!sessionId) return;
    try {
      await forceMutation.mutateAsync(null);
      toast.success("Forced outcome cleared");
      onSuccess?.();
    } catch {
      // toast in hook
    }
  };

  const isForced = Boolean(currentOutcome);

  return (
    <div className={className}>
      {/* Current State Readout */}
      {isForced && (
        <div className="mb-3 p-2.5 rounded-lg bg-warning/10 border border-warning/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning shrink-0" />
            <div className="text-xs">
              <span className="text-text-muted">Current override: </span>
              <span className="font-mono font-semibold text-warning uppercase">
                {currentOutcome}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearForce}
            disabled={forceMutation.isPending}
            className="text-[10px] font-mono uppercase tracking-wider text-text-muted hover:text-danger flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear Force
          </button>
        </div>
      )}

      {/* Button Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Force Win */}
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOpenConfirm("win")}
          disabled={!sessionId || forceMutation.isPending || currentOutcome === "win"}
          className={`h-9 px-3 text-xs font-mono border-void-border hover:bg-success/10 hover:border-success/30 hover:text-success transition-colors ${
            currentOutcome === "win"
              ? "bg-success/15 border-success/40 text-success cursor-default"
              : "text-text"
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-success" />
          {currentOutcome === "win" ? "Forced to Win" : "Force Win"}
        </Button>

        {/* Force Lose */}
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOpenConfirm("lose")}
          disabled={!sessionId || forceMutation.isPending || currentOutcome === "lose"}
          className={`h-9 px-3 text-xs font-mono border-void-border hover:bg-danger/10 hover:border-danger/30 hover:text-danger transition-colors ${
            currentOutcome === "lose"
              ? "bg-danger/15 border-danger/40 text-danger cursor-default"
              : "text-text"
          }`}
        >
          <XCircle className="w-3.5 h-3.5 mr-1.5 text-danger" />
          {currentOutcome === "lose" ? "Forced to Lose" : "Force Lose"}
        </Button>

        {/* Force Cashout */}
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOpenConfirm("cashout")}
          disabled={!sessionId || forceMutation.isPending || currentOutcome === "cashout"}
          className={`h-9 px-3 text-xs font-mono border-void-border hover:bg-gold/10 hover:border-gold/30 hover:text-gold transition-colors ${
            currentOutcome === "cashout"
              ? "bg-gold/15 border-gold/40 text-gold cursor-default"
              : "text-text"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 mr-1.5 text-gold" />
          {currentOutcome === "cashout" ? "Forced Cashout" : "Force Cashout"}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="glass-card border border-white/[0.1] bg-void-surface text-text max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-text flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-warning" />
              Confirm Forced Outcome
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted mt-2 leading-relaxed">
              Are you sure you want to force session{" "}
              <span className="font-mono text-text font-semibold">
                {sessionId ? sessionId.slice(0, 8) : "—"}
              </span>{" "}
              to{" "}
              <span className="font-mono text-gold font-bold uppercase">
                {targetOutcome}
              </span>
              ? Subsequent actions by the client on this session will be guaranteed to execute with this outcome.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              className="border-void-border text-text text-xs h-9 px-3 hover:bg-white/[0.04]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteForce}
              disabled={forceMutation.isPending}
              className="bg-gold text-black hover:bg-gold-light font-semibold text-xs h-9 px-4"
            >
              Apply Force
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
