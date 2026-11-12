"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Smartphone, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Input } from "@/components/ui/input";
import { useDevices, useLive } from "@/lib/api/hooks";
import { formatRelativeTime, truncate } from "@/lib/utils/format";

export default function DevicesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: devicesData, isLoading: devicesLoading } = useDevices(100, 0);
  const { data: liveData } = useLive();

  const activeDeviceGuids = useMemo(() => {
    const set = new Set<string>();
    if (liveData?.active) {
      liveData.active.forEach((g) => {
        if (g.device_guid) set.add(g.device_guid);
      });
    }
    return set;
  }, [liveData]);

  const filteredDevices = useMemo(() => {
    if (!devicesData?.devices) return [];
    if (!searchQuery.trim()) return devicesData.devices;

    const q = searchQuery.toLowerCase().trim();
    return devicesData.devices.filter((d) => {
      const matchGuid = d.app_guid?.toLowerCase().includes(q);
      const matchName = d.name?.toLowerCase().includes(q);
      const matchModel = d.model?.toLowerCase().includes(q);
      const matchIp = d.ip_address?.toLowerCase().includes(q);
      return matchGuid || matchName || matchModel || matchIp;
    });
  }, [devicesData, searchQuery]);

  const deviceCount = devicesData?.devices?.length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Devices"
        subtitle={`${deviceCount} device${deviceCount === 1 ? "" : "s"} connected`}
      />

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by GUID, name, or model..."
          className="pl-9 h-10 bg-void-surface border-void-border text-text placeholder:text-text-muted rounded-md focus:ring-1 focus:ring-gold/30"
        />
      </div>

      {/* Devices Table Card */}
      <div className="glass rounded-xl border border-white/[0.06] p-5">
        {devicesLoading ? (
          <LoadingSkeleton count={8} />
        ) : filteredDevices.length === 0 ? (
          searchQuery.trim() ? (
            <EmptyState
              icon={Smartphone}
              title="No matching devices"
              description={`No devices found matching "${searchQuery}". Clear your search term to view all devices.`}
            />
          ) : (
            <EmptyState
              icon={Smartphone}
              title="No devices yet"
              description="Devices will appear once a client connects to the platform backend."
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
                    Device
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Platform
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    IP Address
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Sessions
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Status
                  </th>
                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium text-right">
                    Last Seen
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map((device) => {
                  const isPlaying = activeDeviceGuids.has(device.app_guid);
                  const statusKey = device.is_blocked
                    ? "blocked"
                    : isPlaying
                    ? "playing"
                    : "idle";

                  return (
                    <tr
                      key={device.id}
                      onClick={() => router.push(`/devices/${device.id}`)}
                      className="border-b border-void-border last:border-b-0 hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      {/* Icon */}
                      <td className="py-3 pl-3 pr-2 w-10">
                        <div className="w-8 h-8 rounded-md bg-white/[0.02] border border-gold/25 flex items-center justify-center text-gold">
                          <Smartphone className="w-4 h-4" />
                        </div>
                      </td>

                      {/* Name / GUID */}
                      <td className="py-3 pr-3">
                        <div className="text-sm font-medium text-text">
                          {device.name || `Device ${truncate(device.app_guid, 8)}`}
                        </div>
                        <div className="text-[10px] font-mono text-text-muted tracking-tight">
                          {truncate(device.app_guid, 14)}
                        </div>
                      </td>

                      {/* Platform & Model */}
                      <td className="py-3 px-3">
                        <div className="text-xs text-text">
                          {device.platform || "Android"}
                        </div>
                        <div className="text-[10px] text-text-dim truncate max-w-[120px]">
                          {device.model || "—"}
                        </div>
                      </td>

                      {/* IP */}
                      <td className="py-3 px-3 font-mono text-[11px] text-text">
                        {device.ip_address || "—"}
                      </td>

                      {/* Sessions */}
                      <td className="py-3 px-3 font-mono text-xs text-text-muted">
                        —
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <StatusBadge status={statusKey} />
                      </td>

                      {/* Last Seen */}
                      <td className="py-3 px-3 text-right font-mono text-[11px] text-text-muted">
                        {formatRelativeTime(device.last_seen_at)}
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
