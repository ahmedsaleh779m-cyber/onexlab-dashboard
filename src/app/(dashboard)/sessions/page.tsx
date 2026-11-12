"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Gamepad2, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { DurationDisplay } from "@/components/ui/duration-display";
import { Input } from "@/components/ui/input";
import { useSessions, useDevices } from "@/lib/api/hooks";
import {
  formatCurrency,
  formatRelativeTime,
  truncate,
} from "@/lib/utils/format";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
  { label: "Cashed Out", value: "cashed_out" },
];

export default function SessionsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [searchId, setSearchId] = useState("");

  const { data: devicesData } = useDevices(100, 0);
  const { data: sessionsData, isLoading } = useSessions({
    limit: 100,
    status: statusFilter,
    deviceId: selectedDevice,
  });

  const deviceMap = useMemo(() => {
    const map = new Map<string, string>();
    if (devicesData?.devices) {
      devicesData.devices.forEach((d) => {
        map.set(d.id, d.name || truncate(d.app_guid, 10));
      });
    }
    return map;
  }, [devicesData]);

  const filteredSessions = useMemo(() => {
    if (!sessionsData?.sessions) return [];
    if (!searchId.trim()) return sessionsData.sessions;

    const q = searchId.toLowerCase().trim();
    return sessionsData.sessions.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        (s.device_id && s.device_id.toLowerCase().includes(q))
    );
  }, [sessionsData, searchId]);

  const totalCount = sessionsData?.count ?? 0;
  const activeCount = useMemo(() => {
    return sessionsData?.sessions
      ? sessionsData.sessions.filter((s) => s.status === "active").length
      : 0;
  }, [sessionsData]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Session Ledger"
        subtitle={`${totalCount} total session${
          totalCount === 1 ? "" : "s"
        } · ${activeCount} active`}
      />

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {STATUS_FILTERS.map((f) => {
            const isSelected = statusFilter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all duration-150 shrink-0 ${
                  isSelected
                    ? "bg-gold text-black font-semibold shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                    : "bg-white/[0.02] border border-white/[0.06] text-text-muted hover:text-text hover:bg-white/[0.04]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Device Dropdown & Search */}
        <div className="flex items-center gap-3">
          {/* Device Filter */}
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="h-9 px-3 rounded-md bg-void-surface border border-void-border text-text font-mono text-xs focus:ring-1 focus:ring-gold/30 outline-none shrink-0"
          >
            <option value="">All Devices</option>
            {devicesData?.devices?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name ? `${d.name} (${truncate(d.app_guid, 8)})` : truncate(d.app_guid, 14)}
              </option>
            ))}
          </select>

          {/* Search by Session ID */}
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <Input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Search ID..."
              className="pl-8 h-9 text-xs font-mono bg-void-surface border-void-border text-text placeholder:text-text-muted focus:ring-1 focus:ring-gold/30 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="glass rounded-xl border border-white/[0.06] p-5">
        {isLoading ? (
          <LoadingSkeleton count={8} />
        ) : filteredSessions.length === 0 ? (
          <EmptyState
            icon={Gamepad2}
            title="No sessions match criteria"
            description="Adjust your status filter, device selection, or search term to locate sessions."
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
                    Device
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Bet
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Steps
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Result
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Status
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Duration
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium text-right">
                    When
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => {
                  const deviceLabel =
                    deviceMap.get(session.device_id) || truncate(session.device_id, 8);
                  const isWin =
                    session.win_sum && Number(session.win_sum) > 0;

                  return (
                    <tr
                      key={session.id}
                      onClick={() => router.push(`/sessions/${session.id}`)}
                      className="border-b border-void-border last:border-b-0 hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      {/* Session ID */}
                      <td className="py-3 px-3 font-mono text-xs text-text font-medium">
                        {truncate(session.id, 8)}
                      </td>

                      {/* Device */}
                      <td className="py-3 px-3 font-mono text-xs text-text-muted">
                        {deviceLabel}
                      </td>

                      {/* Bet */}
                      <td className="py-3 px-3 font-mono text-xs text-text">
                        {formatCurrency(session.bet_sum)}
                      </td>

                      {/* Steps */}
                      <td className="py-3 px-3 font-mono text-xs text-text-muted">
                        {session.current_step}/10
                      </td>

                      {/* Result */}
                      <td className="py-3 px-3 font-mono text-xs">
                        {isWin ? (
                          <span className="text-success font-medium">
                            +{formatCurrency(session.win_sum)}
                          </span>
                        ) : (
                          <span className="text-text-dim">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <StatusBadge status={session.status} />
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-3">
                        <DurationDisplay
                          startedAt={session.started_at}
                          endedAt={session.ended_at}
                        />
                      </td>

                      {/* When */}
                      <td className="py-3 px-3 text-right font-mono text-xs text-text-muted">
                        {formatRelativeTime(session.started_at)}
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
