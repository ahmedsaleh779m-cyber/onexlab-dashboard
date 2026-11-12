"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Radio, RefreshCw, Zap } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { AppleGrid } from "@/components/ui/apple-grid";
import { ForceOutcomeControls } from "@/components/ui/force-outcome-controls";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useLive } from "@/lib/api/hooks";
import { formatCurrency, truncate } from "@/lib/utils/format";

export default function LivePage() {
  const { data: liveData, isLoading, dataUpdatedAt } = useLive();
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    setSecondsAgo(0);
    const interval = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  const activeGames = liveData?.active || [];
  const activeCount = liveData?.count ?? activeGames.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Monitoring"
        subtitle={`Real-time game monitoring · ${activeCount} active round${
          activeCount === 1 ? "" : "s"
        }`}
        action={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.06] font-mono text-xs text-text-muted">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-text font-medium">1s Polling</span>
            <span className="text-text-dim">·</span>
            <span>{secondsAgo === 0 ? "Just now" : `${secondsAgo}s ago`}</span>
          </div>
        }
      />

      {/* Main Content */}
      {isLoading ? (
        <LoadingSkeleton count={4} />
      ) : activeGames.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No active games"
          description="Open the client app and start a round. Active sessions will stream here in real-time."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeGames.map((game, idx) => {
            const shortGuid = truncate(game.device_guid, 12);
            const statusKey =
              game.status === 2
                ? "won"
                : game.status === 3
                ? "lost"
                : "active";

            return (
              <div
                key={game.session_id || `${game.device_guid}-${idx}`}
                className="glass rounded-xl p-5 border border-white/[0.06] flex flex-col justify-between space-y-4"
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-mono text-text-muted block">
                      Target Device
                    </span>
                    <span className="font-mono text-xs font-semibold text-text">
                      {shortGuid}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={statusKey} />
                  </div>
                </div>

                {/* THE GRID */}
                <div className="w-full">
                  <AppleGrid
                    grid={game.grid}
                    currentStep={game.action_step}
                    chosenColumns={game.chosen_columns}
                    forcedOutcome={game.forced_outcome}
                    betSum={game.bet_sum}
                    status={statusKey}
                    size="sm"
                    showFooter={true}
                  />
                </div>

                {/* Intervention Controls */}
                <div className="pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-medium text-text-muted">
                      Live Intervention
                    </span>
                    {game.session_id && (
                      <Link
                        href={`/sessions/${game.session_id}`}
                        className="text-[10px] font-mono text-gold hover:text-gold-light inline-flex items-center gap-1 transition-colors"
                      >
                        Full detail <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  <ForceOutcomeControls
                    sessionId={game.session_id}
                    currentOutcome={game.forced_outcome}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
