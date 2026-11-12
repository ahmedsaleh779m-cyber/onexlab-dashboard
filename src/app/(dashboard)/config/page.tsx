"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  CreditCard,
  AlertTriangle,
  Save,
  CheckCircle2,
  PowerOff,
  Power,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useConfig,
  useUpdateConfig,
  usePaymentNumbers,
  useUpdatePaymentNumbers,
} from "@/lib/api/hooks";
import { toast } from "sonner";

export default function ConfigPage() {
  const { data: configData, isLoading: configLoading } = useConfig();
  const { data: paymentData, isLoading: paymentLoading } = usePaymentNumbers();

  const updateConfigMutation = useUpdateConfig();
  const updatePaymentMutation = useUpdatePaymentNumbers();

  // Local Game Settings State
  const [difficulty, setDifficulty] = useState("standard");
  const [winRate, setWinRate] = useState("0.85");
  const [autoCashout, setAutoCashout] = useState("0");
  const [virtualBalance, setVirtualBalance] = useState("1000");
  const [minBet, setMinBet] = useState("10");
  const [maxBet, setMaxBet] = useState("5000");

  // Local Payment Numbers State
  const [vodafone, setVodafone] = useState("");
  const [etisalat, setEtisalat] = useState("");
  const [orange, setOrange] = useState("");
  const [wePay, setWePay] = useState("");
  const [instaPay, setInstaPay] = useState("");

  // Kill Switch Dialog State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Sync state on load
  useEffect(() => {
    if (configData?.config) {
      const cfg = configData.config;
      if (cfg.difficulty_profile) setDifficulty(String(cfg.difficulty_profile));
      if (cfg.win_rate !== undefined) setWinRate(String(cfg.win_rate));
      if (cfg.auto_cashout_after !== undefined)
        setAutoCashout(String(cfg.auto_cashout_after));
      if (cfg.virtual_balance !== undefined)
        setVirtualBalance(String(cfg.virtual_balance));
      if (cfg.min_bet !== undefined) setMinBet(String(cfg.min_bet));
      if (cfg.max_bet !== undefined) setMaxBet(String(cfg.max_bet));
    }
  }, [configData]);

  useEffect(() => {
    const p = paymentData?.payment_numbers || configData?.config?.payment_numbers;
    if (p) {
      setVodafone(p.VodafoneCash || "");
      setEtisalat(p.EtisalatCash || "");
      setOrange(p.OrangeCash || "");
      setWePay(p.WEPay || "");
      setInstaPay(p.InstaPay || "");
    }
  }, [paymentData, configData]);

  const isMaintenanceMode = Boolean(configData?.config?.maintenance_mode);

  // Handlers for individual and grouped updates
  const handleSaveDifficulty = async () => {
    try {
      await updateConfigMutation.mutateAsync({
        key: "difficulty_profile",
        value: difficulty,
      });
      toast.success(`Difficulty profile updated to ${difficulty}`);
    } catch {
      // toast in hook
    }
  };

  const handleSaveWinRate = async () => {
    const num = parseFloat(winRate);
    if (isNaN(num) || num < 0 || num > 1) {
      toast.error("Win rate must be a float between 0.0 and 1.0");
      return;
    }
    try {
      await updateConfigMutation.mutateAsync({
        key: "win_rate",
        value: num,
      });
      toast.success(`Win rate updated to ${(num * 100).toFixed(1)}%`);
    } catch {
      // toast in hook
    }
  };

  const handleSaveAllGameSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Promise.all([
        updateConfigMutation.mutateAsync({
          key: "difficulty_profile",
          value: difficulty,
        }),
        updateConfigMutation.mutateAsync({
          key: "win_rate",
          value: parseFloat(winRate) || 0.85,
        }),
        updateConfigMutation.mutateAsync({
          key: "auto_cashout_after",
          value: parseInt(autoCashout, 10) || 0,
        }),
        updateConfigMutation.mutateAsync({
          key: "virtual_balance",
          value: parseFloat(virtualBalance) || 1000,
        }),
        updateConfigMutation.mutateAsync({
          key: "min_bet",
          value: parseFloat(minBet) || 10,
        }),
        updateConfigMutation.mutateAsync({
          key: "max_bet",
          value: parseFloat(maxBet) || 5000,
        }),
      ]);
      toast.success("All game settings updated successfully");
    } catch {
      // toast in hook
    }
  };

  const handleSavePaymentNumbers = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      VodafoneCash: vodafone.trim(),
      EtisalatCash: etisalat.trim(),
      OrangeCash: orange.trim(),
      WEPay: wePay.trim(),
      InstaPay: instaPay.trim(),
    };
    try {
      await updatePaymentMutation.mutateAsync(payload);
      toast.success("Virtual payment numbers updated");
    } catch {
      // toast in hook
    }
  };

  const handleConfirmMaintenanceToggle = async () => {
    const nextState = !isMaintenanceMode;
    try {
      await updateConfigMutation.mutateAsync({
        key: "maintenance_mode",
        value: nextState,
      });
      setIsConfirmOpen(false);
      toast[nextState ? "warning" : "success"](
        `Maintenance mode ${nextState ? "ENABLED" : "DISABLED"}`
      );
    } catch {
      // toast in hook
    }
  };

  if (configLoading || paymentLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Configuration"
          subtitle="Global platform settings"
        />
        <LoadingSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuration"
        subtitle="Global platform settings"
      />

      {/* 1. Game Settings */}
      <div className="glass rounded-xl p-5 border border-white/[0.06]">
        <SectionHeader
          title="Game Settings"
          description="Default difficulty profiles and wagering constraints"
        />

        <form onSubmit={handleSaveAllGameSettings} className="space-y-5 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Difficulty Profile */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-wider text-text-muted">
                  Difficulty Profile
                </Label>
                <button
                  type="button"
                  onClick={handleSaveDifficulty}
                  disabled={updateConfigMutation.isPending}
                  className="text-[10px] font-mono text-gold hover:text-gold-light uppercase tracking-wider"
                >
                  Save Difficulty
                </button>
              </div>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-void-surface border border-void-border text-text font-mono text-xs focus:ring-1 focus:ring-gold/30 outline-none"
              >
                <option value="standard">standard (balanced)</option>
                <option value="easy">easy (high win)</option>
                <option value="medium">medium (moderate)</option>
                <option value="hard">hard (low win)</option>
                <option value="rigged">rigged (forced 100% loss)</option>
              </select>
            </div>

            {/* Win Rate */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-wider text-text-muted">
                  Win Rate (0.0 — 1.0)
                </Label>
                <button
                  type="button"
                  onClick={handleSaveWinRate}
                  disabled={updateConfigMutation.isPending}
                  className="text-[10px] font-mono text-gold hover:text-gold-light uppercase tracking-wider"
                >
                  Save Win Rate
                </button>
              </div>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={winRate}
                onChange={(e) => setWinRate(e.target.value)}
                className="bg-void-surface border-void-border text-text font-mono focus:ring-1 focus:ring-gold/30 h-10"
              />
            </div>

            {/* Auto Cashout */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-text-muted">
                Auto-Cashout Step (0 = Off)
              </Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={autoCashout}
                onChange={(e) => setAutoCashout(e.target.value)}
                className="bg-void-surface border-void-border text-text font-mono focus:ring-1 focus:ring-gold/30 h-10"
              />
            </div>

            {/* Virtual Balance */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-text-muted">
                Default Virtual Balance (EGP)
              </Label>
              <Input
                type="number"
                step="1"
                min="0"
                value={virtualBalance}
                onChange={(e) => setVirtualBalance(e.target.value)}
                className="bg-void-surface border-void-border text-text font-mono focus:ring-1 focus:ring-gold/30 h-10"
              />
            </div>

            {/* Min Bet */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-text-muted">
                Minimum Bet Threshold (EGP)
              </Label>
              <Input
                type="number"
                step="1"
                min="1"
                value={minBet}
                onChange={(e) => setMinBet(e.target.value)}
                className="bg-void-surface border-void-border text-text font-mono focus:ring-1 focus:ring-gold/30 h-10"
              />
            </div>

            {/* Max Bet */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-text-muted">
                Maximum Bet Threshold (EGP)
              </Label>
              <Input
                type="number"
                step="1"
                min="1"
                value={maxBet}
                onChange={(e) => setMaxBet(e.target.value)}
                className="bg-void-surface border-void-border text-text font-mono focus:ring-1 focus:ring-gold/30 h-10"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={updateConfigMutation.isPending}
              className="bg-gold text-black hover:bg-gold-light font-semibold text-xs h-10 px-4"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save All Game Settings
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Payment Numbers */}
      <div className="glass rounded-xl p-5 border border-white/[0.06]">
        <SectionHeader
          title="Payment Numbers"
          description="Virtual deposit accounts displayed in the client application"
        />

        <form onSubmit={handleSavePaymentNumbers} className="space-y-5 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-text-muted">
                Vodafone Cash
              </Label>
              <Input
                type="text"
                value={vodafone}
                onChange={(e) => setVodafone(e.target.value)}
                placeholder="010xxxxxxxx"
                className="bg-void-surface border-void-border text-text font-mono focus:ring-1 focus:ring-gold/30 h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-text-muted">
                Etisalat Cash
              </Label>
              <Input
                type="text"
                value={etisalat}
                onChange={(e) => setEtisalat(e.target.value)}
                placeholder="011xxxxxxxx"
                className="bg-void-surface border-void-border text-text font-mono focus:ring-1 focus:ring-gold/30 h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-text-muted">
                Orange Cash
              </Label>
              <Input
                type="text"
                value={orange}
                onChange={(e) => setOrange(e.target.value)}
                placeholder="012xxxxxxxx"
                className="bg-void-surface border-void-border text-text font-mono focus:ring-1 focus:ring-gold/30 h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-text-muted">
                WE Pay
              </Label>
              <Input
                type="text"
                value={wePay}
                onChange={(e) => setWePay(e.target.value)}
                placeholder="015xxxxxxxx"
                className="bg-void-surface border-void-border text-text font-mono focus:ring-1 focus:ring-gold/30 h-10"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-[10px] uppercase tracking-wider text-text-muted">
                InstaPay Handle / Number
              </Label>
              <Input
                type="text"
                value={instaPay}
                onChange={(e) => setInstaPay(e.target.value)}
                placeholder="account@instapay or mobile number"
                className="bg-void-surface border-void-border text-text font-mono focus:ring-1 focus:ring-gold/30 h-10"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={updatePaymentMutation.isPending}
              className="bg-gold text-black hover:bg-gold-light font-semibold text-xs h-10 px-4"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Save Payment Numbers
            </Button>
          </div>
        </form>
      </div>

      {/* 3. Kill Switch */}
      <div className="glass rounded-xl p-5 border border-danger/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-danger" />
              <h3 className="text-base font-semibold tracking-tight text-text">
                Kill Switch
              </h3>
            </div>
            <p className="text-xs text-text-muted">
              Emergency lockdown for incoming client requests and game sessions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider font-mono text-text-muted">
                Current Status
              </div>
              <div
                className={`text-xs font-mono font-semibold ${
                  isMaintenanceMode ? "text-danger" : "text-success"
                }`}
              >
                {isMaintenanceMode ? "MAINTENANCE ACTIVE" : "OPERATIONAL"}
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              disabled={updateConfigMutation.isPending}
              className={
                isMaintenanceMode
                  ? "bg-danger text-white hover:opacity-90 font-semibold text-xs h-10 px-4"
                  : "border border-void-border text-text hover:bg-white/[0.04] text-xs h-10 px-4"
              }
            >
              {isMaintenanceMode ? (
                <>
                  <Power className="w-3.5 h-3.5 mr-1.5" />
                  Disable
                </>
              ) : (
                <>
                  <PowerOff className="w-3.5 h-3.5 mr-1.5" />
                  Enable
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent className="glass-card border border-white/[0.1] bg-void-surface text-text max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-text flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-danger" />
                {isMaintenanceMode
                  ? "Disable Maintenance Mode"
                  : "Enable Emergency Maintenance Mode"}
              </DialogTitle>
              <DialogDescription className="text-xs text-text-muted mt-2 leading-relaxed">
                {isMaintenanceMode
                  ? "This will restore live game session acceptance for all registered devices."
                  : "Enabling maintenance mode rejects new game sessions immediately. Devices will receive maintenance notices."}
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
                onClick={handleConfirmMaintenanceToggle}
                disabled={updateConfigMutation.isPending}
                className={
                  isMaintenanceMode
                    ? "bg-gold text-black hover:bg-gold-light font-semibold text-xs h-9 px-3"
                    : "bg-danger text-white hover:opacity-90 font-semibold text-xs h-9 px-3"
                }
              >
                {isMaintenanceMode ? "Confirm Disable" : "Confirm Lockdown"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
