"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Wallet,
  ShieldCheck,
  ShieldX,
  ExternalLink,
  Coins,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Input } from "@/components/ui/input";
import { useAccounts, useCurrencies } from "@/lib/api/hooks";
import { formatRelativeTime } from "@/lib/utils/format";

export default function AccountsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("ALL");

  const { data: accountsData, isLoading: accountsLoading } = useAccounts(100, 0);
  const { data: currenciesData } = useCurrencies();

  const accounts = accountsData?.accounts ?? [];
  const currencies = currenciesData?.currencies ?? [];

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      // Currency match
      const curCode = acc.currencies?.code || "USD";
      if (selectedCurrency !== "ALL" && curCode !== selectedCurrency) {
        return false;
      }
      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchEmail = acc.email?.toLowerCase().includes(q);
      const matchName = acc.display_name?.toLowerCase().includes(q);
      const matchId = acc.id?.toLowerCase().includes(q);
      return matchEmail || matchName || matchId;
    });
  }, [accounts, searchQuery, selectedCurrency]);

  // Aggregate stats
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter((a) => a.is_active).length;
  const balancesByCurrency = useMemo(() => {
    const map: Record<string, number> = {};
    accounts.forEach((a) => {
      const code = a.currencies?.code || "USD";
      map[code] = (map[code] || 0) + Number(a.balance || 0);
    });
    return map;
  }, [accounts]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        subtitle={`${totalAccounts} registered account${totalAccounts === 1 ? "" : "s"}`}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Accounts"
          value={totalAccounts.toString()}
          hint={`${activeAccounts} active · ${totalAccounts - activeAccounts} disabled`}
          icon={Users}
          accent="gold"
          loading={accountsLoading}
        />
        <StatCard
          label="Active Accounts"
          value={activeAccounts.toString()}
          hint="Operational status"
          icon={ShieldCheck}
          accent="gold"
          loading={accountsLoading}
        />
        <StatCard
          label="USD Total Balance"
          value={`$${(balancesByCurrency["USD"] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          hint="Sum across USD accounts"
          icon={Wallet}
          accent="gold"
          loading={accountsLoading}
        />
        <StatCard
          label="EGP Total Balance"
          value={`${(balancesByCurrency["EGP"] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`}
          hint="Sum across EGP accounts"
          icon={Coins}
          accent="gold"
          loading={accountsLoading}
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email, display name, or UUID..."
            className="pl-9 h-10 bg-void-surface border-void-border text-text placeholder:text-text-muted rounded-md focus:ring-1 focus:ring-gold/30"
          />
        </div>

        {/* Currency Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.02] border border-white/[0.06] rounded-lg self-stretch sm:self-auto overflow-x-auto">
          <button
            onClick={() => setSelectedCurrency("ALL")}
            className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
              selectedCurrency === "ALL"
                ? "bg-gold/15 text-gold border border-gold/30 font-semibold"
                : "text-text-muted hover:text-text hover:bg-white/[0.04]"
            }`}
          >
            All
          </button>
          {currencies.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCurrency(c.code)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                selectedCurrency === c.code
                  ? "bg-gold/15 text-gold border border-gold/30 font-semibold"
                  : "text-text-muted hover:text-text hover:bg-white/[0.04]"
              }`}
            >
              {c.code}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Table Card */}
      <div className="glass rounded-xl border border-white/[0.06] p-5">
        {accountsLoading ? (
          <LoadingSkeleton count={8} />
        ) : filteredAccounts.length === 0 ? (
          searchQuery.trim() || selectedCurrency !== "ALL" ? (
            <EmptyState
              icon={Users}
              title="No matching accounts"
              description="No accounts match your current search and filter criteria."
            />
          ) : (
            <EmptyState
              icon={Users}
              title="No accounts yet"
              description="Accounts created via the app or API registration will appear here."
            />
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th
                    colSpan={2}
                    className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium"
                  >
                    Account
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Currency
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Balance
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Status
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium text-right">
                    Created
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => {
                  const curCode = account.currencies?.code || "USD";
                  const curSymbol = account.currencies?.symbol || "$";
                  const bal = Number(account.balance || 0);

                  return (
                    <tr
                      key={account.id}
                      onClick={() => router.push(`/accounts/${account.id}`)}
                      className="border-b border-void-border last:border-b-0 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      {/* Icon */}
                      <td className="py-3 pl-3 pr-2 w-10">
                        <div className="w-8 h-8 rounded-md bg-white/[0.02] border border-gold/25 flex items-center justify-center text-gold">
                          <Users className="w-4 h-4" />
                        </div>
                      </td>

                      {/* Email / Display Name */}
                      <td className="py-3 pr-3">
                        <div className="text-sm font-medium text-text group-hover:text-gold transition-colors">
                          {account.email}
                        </div>
                        <div className="text-[10px] font-mono text-text-muted tracking-tight">
                          {account.display_name ? `${account.display_name} · ` : ""}
                          {account.id.slice(0, 8)}...
                        </div>
                      </td>

                      {/* Currency Badge */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-gold/10 text-gold border border-gold/20">
                          <span>{curSymbol}</span>
                          <span>{curCode}</span>
                        </span>
                      </td>

                      {/* Balance */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-sm font-semibold text-text">
                          {curSymbol} {bal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {account.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Disabled
                          </span>
                        )}
                      </td>

                      {/* Created date */}
                      <td className="py-3 px-3 text-right font-mono text-[11px] text-text-muted">
                        {formatRelativeTime(account.created_at)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center text-xs text-text-muted group-hover:text-gold transition-colors font-mono">
                          View <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
