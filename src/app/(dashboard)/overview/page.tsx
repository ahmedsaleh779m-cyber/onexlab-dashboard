"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Smartphone,
  Gamepad2,
  TrendingUp,
  Wallet,
  Activity,
  ArrowRight,
  Radio,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { SectionHeader } from "@/components/ui/section-header";
import { useStats, useLive, useSessions } from "@/lib/api/hooks";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  truncate,
} from "@/lib/utils/format";

// 24h activity chart baseline
const ACTIVITY_DATA = [
  { time: "00:00", sessions: 4, volume: 450 },
  { time: "03:00", sessions: 2, volume: 180 },
  { time: "06:00", sessions: 1, volume: 100 },
  { time: "09:00", sessions: 8, volume: 1200 },
  { time: "12:00", sessions: 14, volume: 2400 },
  { time: "15:00", sessions: 19, volume: 3800 },
  { time: "18:00", sessions: 26, volume: 5100 },
  { time: "21:00", sessions: 22, volume: 4200 },
  { time: "Now", sessions: 18, volume: 3100 },
];

export default function OverviewPage() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: live, isLoading: liveLoading } = useLive();
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions({ limit: 8 });

  const totalSessions = stats?.sessions?.total ?? 0;
  const wonSessions = stats?.sessions?.won ?? 0;
  const lostSessions = stats?.sessions?.lost ?? 0;
  const cashedSessions = stats?.sessions?.cashed_out ?? 0;

  const winRate =
    totalSessions > 0
      ? ((wonSessions + cashedSessions) / totalSessions) * 100
      : 0;

  const netEconomy = stats?.economy?.net ?? 0;
  const netSign = netEconomy > 0 ? "+" : "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle="System status and real-time operations"
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Devices"
          value={formatNumber(stats?.devices ?? 0)}
          hint={`${live?.count ?? 0} active now`}
          icon={Smartphone}
          accent="gold"
          loading={statsLoading}
        />
        <StatCard
          label="Sessions"
          value={formatNumber(totalSessions)}
          hint={`${wonSessions} won · ${lostSessions} lost`}
          icon={Gamepad2}
          accent="gold"
          loading={statsLoading}
        />
        <StatCard
          label="Win Rate"
          value={formatPercent(winRate)}
          hint={`${cashedSessions} cashed out`}
          icon={TrendingUp}
          accent="gold"
          loading={statsLoading}
        />
        <StatCard
          label="Volume"
          value={formatCurrency(stats?.economy?.total_bet ?? 0)}
          hint={`Net: ${netSign}${formatCurrency(netEconomy)}`}
          icon={Wallet}
          accent="gold"
          loading={statsLoading}
        />
      </div>

      {/* 2-Column: Activity Chart (2) + Live Snapshot (1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Activity Chart */}
        <div className="lg:col-span-2 glass rounded-xl p-5 border border-white/[0.06] flex flex-col justify-between">
          <SectionHeader
            title="Activity Timeline"
            description="24-hour session distribution"
            action={
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted bg-white/[0.02] border border-white/[0.06] px-2 py-0.5 rounded">
                24H Window
              </span>
            }
          />

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={ACTIVITY_DATA}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1f1f1f"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="#404040"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#1f1f1f" }}
                />
                <YAxis
                  stroke="#404040"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#1f1f1f" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0a0a",
                    borderColor: "#1f1f1f",
                    borderRadius: "0.5rem",
                    padding: "8px 12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.8)",
                  }}
                  itemStyle={{
                    color: "#d4af37",
                    fontSize: "12px",
                    fontFamily: "var(--font-geist-mono)",
                  }}
                  labelStyle={{
                    color: "#737373",
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  name="Sessions"
                  stroke="#d4af37"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#d4af37",
                    stroke: "#000000",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Live Snapshot */}
        <div className="glass rounded-xl p-5 border border-white/[0.06] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-wider font-medium text-text-muted">
                Live Snapshot
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider text-success bg-success/10 border border-success/30">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Live
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-text-muted block mb-1">
                  Active Games
                </span>
                <div className="text-4xl font-mono font-semibold text-gold tracking-tight">
                  {liveLoading ? "—" : (live?.count ?? 0)}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06]">
                <span className="text-xs text-text-muted block mb-1">
                  Global Balance
                </span>
                <div className="text-xl font-mono font-semibold text-text">
                  {statsLoading
                    ? "—"
                    : formatCurrency(stats?.current_balance ?? live?.balance ?? 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.06]">
            <Link
              href="/live"
              className="inline-flex items-center justify-between w-full px-3 py-2 text-xs font-mono text-gold hover:text-gold-light bg-gold/5 hover:bg-gold/10 border border-gold/20 rounded-md transition-colors duration-150"
            >
              <span>View live games</span>
              <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="glass rounded-xl border border-white/[0.06] p-5">
        <SectionHeader
          title="Recent Sessions"
          description="Latest activity across registered devices"
          action={
            <Link
              href="/sessions"
              className="text-xs text-text-muted hover:text-gold transition-colors inline-flex items-center gap-1 font-mono"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          }
        />

        {sessionsLoading ? (
          <LoadingSkeleton count={5} />
        ) : !sessionsData?.sessions || sessionsData.sessions.length === 0 ? (
          <EmptyState
            icon={Gamepad2}
            title="No sessions yet"
            description="Game sessions will appear here as connected clients interact with the platform."
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
                    Outcome
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Status
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium text-right">
                    When
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessionsData.sessions.slice(0, 8).map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => router.push(`/sessions?device_id=${session.device_id}`)}
                    className="border-b border-void-border last:border-b-0 hover:bg-white/[0.03] transition-colors cursor-pointer"
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
                    <td className="py-3 px-3 text-xs capitalize text-text">
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
