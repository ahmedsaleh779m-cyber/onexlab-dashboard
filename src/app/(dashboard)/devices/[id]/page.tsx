"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Smartphone,
  Gamepad2,
  TrendingUp,
  Wallet,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Save,
  CheckCircle2,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useDevice,
  useUpdateDevice,
  useSetDeviceBalance,
  useResetDeviceBalance,
  useLive,
  useStats,
} from "@/lib/api/hooks";
import {
  formatCurrency,
  formatNumber,
  formatRelativeTime,
  truncate,
} from "@/lib/utils/format";
import { toast } from "sonner";

export default function DeviceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const deviceId = params.id as string;

  const { data, isLoading, error } = useDevice(deviceId);
  const { data: liveData } = useLive();
  const { data: statsData } = useStats();

  const updateDeviceMutation = useUpdateDevice(deviceId);
  const setBalanceMutation = useSetDeviceBalance(deviceId);
  const resetBalanceMutation = useResetDeviceBalance(deviceId);

  const [nameInput, setNameInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [balanceInput, setBalanceInput] = useState("");

  const device = data?.device;
  const sessions = data?.sessions || [];

  useEffect(() => {
    if (device) {
      setNameInput(device.name || "");
      setNotesInput(device.notes || "");
    }
  }, [device]);

  const isPlaying = Boolean(
    liveData?.active?.some((g) => g.device_guid === device?.app_guid)
  );

  const statusKey = device?.is_blocked
    ? "blocked"
    : isPlaying
    ? "playing"
    : "idle";

  const totalBet = sessions.reduce(
    (acc, s) => acc + Number(s.bet_sum || 0),
    0
  );
  const totalWin = sessions.reduce(
    (acc, s) => acc + Number(s.win_sum || 0),
    0
  );

  const handleToggleBlock = async () => {
    if (!device) return;
    const newBlockedState = !device.is_blocked;
    try {
      await updateDeviceMutation.mutateAsync({
        is_blocked: newBlockedState,
      });
      toast[newBlockedState ? "warning" : "success"](
        `Device ${newBlockedState ? "blocked" : "unblocked"} successfully`
      );
    } catch {
      // handled by mutation onError
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDeviceMutation.mutateAsync({
        name: nameInput.trim() || null,
        notes: notesInput.trim() || null,
      });
      toast.success("Device details updated");
    } catch {
      // handled by mutation onError
    }
  };

  const handleSetBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(balanceInput);
    if (isNaN(val) || val < 0) {
      toast.error("Please enter a valid balance amount");
      return;
    }
    try {
      await setBalanceMutation.mutateAsync(val);
      toast.success(`Balance updated to ${formatCurrency(val)}`);
      setBalanceInput("");
    } catch {
      // handled by mutation onError
    }
  };

  const handleResetBalance = async () => {
    try {
      await resetBalanceMutation.mutateAsync();
      toast.success("Balance reset successfully");
    } catch {
      // handled by mutation onError
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-4 w-32 bg-white/[0.05] rounded animate-pulse" />
        <div className="h-10 w-64 bg-white/[0.05] rounded animate-pulse" />
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="space-y-6">
        <Link
          href="/devices"
          className="text-xs font-mono text-text-muted hover:text-gold inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to devices
        </Link>
        <EmptyState
          icon={Smartphone}
          title="Device not found"
          description="The requested device ID could not be loaded from the registry."
          action={
            <Button
              variant="outline"
              onClick={() => router.push("/devices")}
              className="text-xs border-void-border hover:bg-white/[0.04]"
            >
              Return to devices
            </Button>
          }
        />
      </div>
    );
  }

  const shortGuid = truncate(device.app_guid, 8);
  const statusAccent =
    statusKey === "blocked"
      ? "danger"
      : statusKey === "playing"
      ? "success"
      : "gold";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/devices"
          className="text-xs font-mono text-text-muted hover:text-gold inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to devices
        </Link>
      </div>

      {/* Header */}
      <PageHeader
        title={device.name || `Device ${shortGuid}`}
        subtitle={device.app_guid}
        action={<StatusBadge status={statusKey} />}
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Device Status"
          value={statusKey.toUpperCase()}
          hint={isPlaying ? "Active session in progress" : "No active session"}
          icon={Smartphone}
          accent={statusAccent}
        />
        <StatCard
          label="Total Sessions"
          value={formatNumber(sessions.length)}
          hint="Lifetime sessions"
          icon={Gamepad2}
          accent="gold"
        />
        <StatCard
          label="Total Bet"
          value={formatCurrency(totalBet)}
          hint="Gross wager sum"
          icon={Wallet}
          accent="gold"
        />
        <StatCard
          label="Total Won"
          value={formatCurrency(totalWin)}
          hint="Gross payout sum"
          icon={TrendingUp}
          accent="gold"
        />
      </div>

      {/* 2-Column: Device info (LEFT) + Actions (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Device Info */}
        <div className="glass rounded-xl p-5 border border-white/[0.06]">
          <SectionHeader
            title="Device Information"
            description="Hardware identifiers and network presence"
          />

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 pt-2 text-xs">
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                Application GUID
              </dt>
              <dd className="font-mono text-text break-all mt-0.5">
                {device.app_guid}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                Platform
              </dt>
              <dd className="text-text mt-0.5">
                {device.platform || "Android"}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                Model
              </dt>
              <dd className="text-text mt-0.5 font-mono">
                {device.model || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                IP Address
              </dt>
              <dd className="font-mono text-text mt-0.5">
                {device.ip_address || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                First Seen
              </dt>
              <dd className="font-mono text-text-muted mt-0.5">
                {formatRelativeTime(device.first_seen_at)}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                Last Seen
              </dt>
              <dd className="font-mono text-text-muted mt-0.5">
                {formatRelativeTime(device.last_seen_at)}
              </dd>
            </div>
          </dl>

          {device.last_account_id && (
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between p-3 rounded-lg bg-gold/5 border border-gold/20">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-gold" />
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted block">
                    Linked Account
                  </span>
                  <span className="text-xs font-mono text-gold font-medium">
                    {device.last_account_id}
                  </span>
                </div>
              </div>
              <Link
                href={`/accounts/${device.last_account_id}`}
                className="px-2.5 py-1 text-xs font-mono bg-gold/15 text-gold hover:bg-gold/25 border border-gold/30 rounded transition-colors"
              >
                View →
              </Link>
            </div>
          )}
        </div>

        {/* Device Actions */}
        <div className="glass rounded-xl p-5 border border-white/[0.06] flex flex-col justify-between">
          <div>
            <SectionHeader
              title="Device Actions"
              description="Access enforcement and account controls"
            />

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-text">
                    Access Permission
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    {device.is_blocked
                      ? "Device is currently barred from initializing sessions."
                      : "Device has active authorization to communicate."}
                  </div>
                </div>

                <Button
                  onClick={handleToggleBlock}
                  disabled={updateDeviceMutation.isPending}
                  className={
                    device.is_blocked
                      ? "bg-success text-black hover:opacity-90 text-xs font-semibold h-9 px-3 shrink-0"
                      : "bg-danger text-white hover:opacity-90 text-xs font-semibold h-9 px-3 shrink-0"
                  }
                >
                  {device.is_blocked ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                      Unblock
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                      Block Device
                    </>
                  )}
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-text">
                    Balance Reset
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Restore balance to configured initial threshold.
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleResetBalance}
                  disabled={resetBalanceMutation.isPending}
                  className="border-void-border text-text hover:bg-white/[0.04] text-xs h-9 px-3 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset Balance
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column: Edit device (LEFT) + Set balance (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Edit Device */}
        <div className="glass rounded-xl p-5 border border-white/[0.06]">
          <SectionHeader
            title="Edit Device"
            description="Update administrative label and metadata notes"
          />

          <form onSubmit={handleSaveInfo} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-text-muted">
                Device Name
              </Label>
              <Input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Pixel 8 Lab Unit A"
                className="bg-void-surface border-void-border text-text placeholder:text-text-muted focus:ring-1 focus:ring-gold/30 h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-text-muted">
                Notes
              </Label>
              <Input
                type="text"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Administrative notes or owner information..."
                className="bg-void-surface border-void-border text-text placeholder:text-text-muted focus:ring-1 focus:ring-gold/30 h-10"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={updateDeviceMutation.isPending}
                className="bg-gold text-black hover:bg-gold-light font-semibold text-xs h-10 px-4"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Set Balance */}
        <div className="glass rounded-xl p-5 border border-white/[0.06]">
          <SectionHeader
            title="Set Balance"
            description="Adjust global credit balance"
          />

          <form onSubmit={handleSetBalance} className="space-y-4 pt-1">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
              <div className="text-xs text-text-muted">
                Current Global Balance:{" "}
                <span className="font-mono font-semibold text-text">
                  {formatCurrency(statsData?.current_balance ?? 0)}
                </span>
              </div>
              <div className="text-[10px] text-text-dim">
                Note: Per-device balance separation will be activated in Phase 2C.
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-text-muted">
                New Balance Amount (EGP)
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                placeholder="e.g. 5000"
                className="bg-void-surface border-void-border text-text placeholder:text-text-muted font-mono focus:ring-1 focus:ring-gold/30 h-10"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={setBalanceMutation.isPending}
                className="bg-gold text-black hover:bg-gold-light font-semibold text-xs h-10 px-4"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Update Balance
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Recent Sessions for this Device */}
      <div className="glass rounded-xl border border-white/[0.06] p-5">
        <SectionHeader
          title="Device Sessions"
          description="Session history recorded for this specific unit"
          action={
            <Link
              href={`/sessions?device_id=${device.id}`}
              className="text-xs text-text-muted hover:text-gold transition-colors font-mono"
            >
              View all →
            </Link>
          }
        />

        {sessions.length === 0 ? (
          <EmptyState
            icon={Gamepad2}
            title="No sessions recorded"
            description="No game activity has been logged for this hardware unit yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Session ID
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Bet
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Step
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Win Sum
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Status
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium text-right">
                    Started
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 10).map((session) => (
                  <tr
                    key={session.id}
                    className="border-b border-void-border last:border-b-0 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-3 px-3 font-mono text-xs text-text">
                      {truncate(session.id, 8)}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-text">
                      {formatCurrency(session.bet_sum)}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-text-muted">
                      {session.current_step}/10
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-text">
                      {session.win_sum && Number(session.win_sum) > 0
                        ? `+${formatCurrency(session.win_sum)}`
                        : "—"}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={session.status} />
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-text-muted">
                      {formatRelativeTime(session.started_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
