"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Wallet,
  Gamepad2,
  TrendingUp,
  Clock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Save,
  Coins,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { SectionHeader } from "@/components/ui/section-header";
import { Input } from "@/components/ui/input";
import {
  useAccount,
  useUpdateAccount,
  useSetAccountBalance,
} from "@/lib/api/hooks";
import {
  formatCurrency,
  formatNumber,
  formatRelativeTime,
  truncate,
} from "@/lib/utils/format";

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params?.id as string;

  const { data: detailData, isLoading, refetch } = useAccount(accountId);
  const updateAccountMutation = useUpdateAccount(accountId);
  const setBalanceMutation = useSetAccountBalance(accountId);

  const account = detailData?.account;
  const sessions = detailData?.sessions ?? [];

  // Edit form state
  const [displayName, setDisplayName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState("");
  const [newBalance, setNewBalance] = useState("");

  useEffect(() => {
    if (account) {
      setDisplayName(account.display_name || "");
      setIsActive(account.is_active);
      setNotes(account.notes || "");
    }
  }, [account]);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAccountMutation.mutateAsync({
      display_name: displayName.trim() || null,
      is_active: isActive,
      notes: notes.trim() || null,
    });
    refetch();
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newBalance);
    if (isNaN(val) || val < 0) return;
    await setBalanceMutation.mutateAsync(val);
    setNewBalance("");
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-white/[0.04] rounded animate-pulse" />
        <LoadingSkeleton count={6} />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="space-y-6">
        <Link
          href="/accounts"
          className="inline-flex items-center text-xs font-mono text-text-muted hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Accounts
        </Link>
        <EmptyState
          icon={Users}
          title="Account Not Found"
          description={`No account was found with identifier ${accountId}`}
        />
      </div>
    );
  }

  const curCode = account.currencies?.code || "USD";
  const curSymbol = account.currencies?.symbol || "$";
  const curBalance = Number(account.balance || 0);

  // Quick stats calculations
  const totalSessions = sessions.length;
  const wonSessions = sessions.filter((s) => s.status === "won").length;
  const lostSessions = sessions.filter((s) => s.status === "lost").length;
  const cashedSessions = sessions.filter((s) => s.status === "cashed_out").length;
  const totalBet = sessions.reduce((acc, s) => acc + Number(s.bet_sum || 0), 0);
  const totalWin = sessions.reduce((acc, s) => acc + Number(s.win_sum || 0), 0);
  const netEconomy = totalWin - totalBet;
  const netSign = netEconomy > 0 ? "+" : "";

  return (
    <div className="space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/accounts"
          className="inline-flex items-center text-xs font-mono text-text-muted hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Accounts
        </Link>
        <span className="text-[11px] font-mono text-text-muted">
          UUID: {account.id}
        </span>
      </div>

      {/* Header with Title + Status + Currency badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {account.email}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-gold/15 text-gold border border-gold/30 font-semibold">
              {curSymbol} {curCode}
            </span>
            {account.is_active ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Disabled
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1">
            Registered {formatRelativeTime(account.created_at)} · Last active {formatRelativeTime(account.last_seen_at)}
          </p>
        </div>
      </div>

      {/* Quick stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Account Balance"
          value={`${curSymbol} ${curBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          hint={`Currency: ${curCode}`}
          icon={Wallet}
          accent="gold"
        />
        <StatCard
          label="Sessions"
          value={formatNumber(totalSessions)}
          hint={`${wonSessions} won · ${cashedSessions} cashed`}
          icon={Gamepad2}
          accent="gold"
        />
        <StatCard
          label="Lost Sessions"
          value={formatNumber(lostSessions)}
          hint={`Win rate: ${totalSessions > 0 ? Math.round(((wonSessions + cashedSessions) / totalSessions) * 100) : 0}%`}
          icon={TrendingUp}
          accent="gold"
        />
        <StatCard
          label="Net Win / Loss"
          value={`${netSign}${curSymbol} ${Math.abs(netEconomy).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          hint={`Bet: ${curSymbol}${totalBet.toFixed(2)} · Won: ${curSymbol}${totalWin.toFixed(2)}`}
          icon={Coins}
          accent="gold"
        />
      </div>

      {/* 2-Column: Balance Adjust Card (1) + Account Settings Card (2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Adjust Card */}
        <div className="glass rounded-xl border border-white/[0.06] p-5 flex flex-col justify-between">
          <div>
            <SectionHeader
              title="Balance Adjustment"
              description="Directly modify this account's live balance."
            />
            <div className="my-4 p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium block mb-1">
                Current Balance
              </span>
              <div className="text-2xl font-mono font-bold text-gold">
                {curSymbol} {curBalance.toFixed(2)} <span className="text-xs text-text-muted font-normal">{curCode}</span>
              </div>
            </div>

            <form onSubmit={handleAdjustBalance} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1.5">
                  Set New Balance ({curCode})
                </label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  placeholder="e.g. 500.00"
                  className="bg-void-surface border-void-border text-text font-mono focus:ring-1 focus:ring-gold/30"
                />
              </div>

              <button
                type="submit"
                disabled={!newBalance || setBalanceMutation.isPending}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] hover:from-[#f4e4a8] hover:to-[#d4af37] text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_-4px_rgba(212,175,55,0.4)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {setBalanceMutation.isPending ? "Updating..." : "Update Balance"}
              </button>
            </form>
          </div>

          <div className="pt-4 mt-4 border-t border-white/[0.06] text-[11px] text-text-dim">
            Balances update immediately in Supabase and reflect live on the target client.
          </div>
        </div>

        {/* Edit Details Card */}
        <div className="lg:col-span-2 glass rounded-xl border border-white/[0.06] p-5">
          <SectionHeader
            title="Account Information & Settings"
            description="Manage display metadata, access restrictions, and administrative notes."
          />

          <form onSubmit={handleSaveDetails} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1.5">
                  Display Name
                </label>
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Test Trader 1"
                  className="bg-void-surface border-void-border text-text focus:ring-1 focus:ring-gold/30"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1.5">
                  Account Status
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-void-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    <span className="ml-3 text-xs font-medium text-text">
                      {isActive ? "Active (Login allowed)" : "Disabled (Login blocked)"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">
                Admin Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes regarding this account..."
                className="w-full px-3 py-2 bg-void-surface border border-void-border text-text rounded-md focus:outline-none focus:ring-1 focus:ring-gold/30 text-xs font-sans placeholder:text-text-muted resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updateAccountMutation.isPending}
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-lg bg-gold/15 text-gold hover:bg-gold/25 border border-gold/30 font-medium text-xs tracking-wider uppercase transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {updateAccountMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Account Sessions History */}
      <div className="glass rounded-xl border border-white/[0.06] p-5">
        <SectionHeader
          title="Session Ledger"
          description={`Historical game sessions initiated by ${account.email}`}
        />

        {sessions.length === 0 ? (
          <EmptyState
            icon={Gamepad2}
            title="No sessions recorded"
            description="This account has not played any game rounds yet."
          />
        ) : (
          <div className="overflow-x-auto mt-4">
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
                    Final Step
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Win Sum
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Status
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium text-right">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => router.push(`/sessions/${session.id}`)}
                    className="border-b border-void-border last:border-b-0 hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 font-mono text-xs text-text">
                      {truncate(session.id, 10)}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-text">
                      {curSymbol} {Number(session.bet_sum).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-text-muted">
                      {session.current_step}/10
                    </td>
                    <td className="py-3 px-3 text-xs capitalize text-text font-mono">
                      {session.win_sum && Number(session.win_sum) > 0
                        ? `+${curSymbol} ${Number(session.win_sum).toFixed(2)}`
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
