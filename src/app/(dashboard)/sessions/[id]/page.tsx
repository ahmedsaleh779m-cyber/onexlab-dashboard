"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Gamepad2,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Code2,
  Save,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { SectionHeader } from "@/components/ui/section-header";
import { AppleGrid } from "@/components/ui/apple-grid";
import { ForceOutcomeControls } from "@/components/ui/force-outcome-controls";
import { DurationDisplay } from "@/components/ui/duration-display";
import { Button } from "@/components/ui/button";
import {
  useSession,
  useUpdateConfig,
  useDevice,
} from "@/lib/api/hooks";
import {
  formatCurrency,
  formatRelativeTime,
  truncate,
} from "@/lib/utils/format";
import { toast } from "sonner";

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const { data, isLoading, error } = useSession(sessionId);
  const session = data?.session;
  const gridObj = data?.grid;
  const actions = data?.actions || [];

  const { data: deviceData } = useDevice(session?.device_id);
  const updateConfigMutation = useUpdateConfig();

  const [overrideJson, setOverrideJson] = useState(
    JSON.stringify(
      Array.from({ length: 10 }, () => [1, 0, 0, 0, 0]),
      null,
      2
    )
  );

  // Extract chosen column array from chronological action steps
  const chosenColumns = useMemo(() => {
    const cols: number[] = [];
    if (actions && actions.length > 0) {
      actions.forEach((a) => {
        if (a.step !== undefined && a.chosen_column !== undefined) {
          cols[a.step] = a.chosen_column;
        }
      });
    }
    return cols;
  }, [actions]);

  const handleApplyGridOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(overrideJson);
      if (!Array.isArray(parsed) || parsed.length !== 10) {
        throw new Error("Grid override must be a 10-row array");
      }
      for (let r = 0; r < 10; r++) {
        if (!Array.isArray(parsed[r]) || parsed[r].length !== 5) {
          throw new Error(`Row ${r + 1} must contain exactly 5 column integers`);
        }
      }
      await updateConfigMutation.mutateAsync({
        key: "grid_override_json",
        value: parsed,
      });
      await updateConfigMutation.mutateAsync({
        key: "grid_override_enabled",
        value: true,
      });
      toast.success("Global 10×5 grid override applied successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid grid JSON format";
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-4 w-32 bg-white/[0.05] rounded animate-pulse" />
        <div className="h-10 w-64 bg-white/[0.05] rounded animate-pulse" />
        <LoadingSkeleton count={6} />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="space-y-6">
        <Link
          href="/sessions"
          className="text-xs font-mono text-text-muted hover:text-gold inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sessions
        </Link>
        <EmptyState
          icon={Gamepad2}
          title="Session not found"
          description="The requested session ID could not be retrieved from the database."
          action={
            <Button
              variant="outline"
              onClick={() => router.push("/sessions")}
              className="text-xs border-void-border hover:bg-white/[0.04]"
            >
              Return to sessions
            </Button>
          }
        />
      </div>
    );
  }

  const shortId = truncate(session.id, 8);
  const isWin = session.win_sum && Number(session.win_sum) > 0;
  const targetDeviceGuid =
    deviceData?.device?.app_guid || truncate(session.device_id, 14);

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/sessions"
          className="text-xs font-mono text-text-muted hover:text-gold inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sessions
        </Link>
      </div>

      {/* Header */}
      <PageHeader
        title={`Session ${shortId}`}
        subtitle={`Hardware Target: ${targetDeviceGuid}`}
        action={<StatusBadge status={session.status} />}
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Bet Amount"
          value={formatCurrency(session.bet_sum)}
          hint="Initial stake sum"
          icon={Wallet}
          accent="gold"
        />
        <StatCard
          label="Result"
          value={isWin ? `+${formatCurrency(session.win_sum)}` : "—"}
          hint={isWin ? "Gross payout won" : "No payout credited"}
          icon={TrendingUp}
          accent={isWin ? "success" : "gold"}
        />
        <StatCard
          label="Session Status"
          value={session.status.toUpperCase()}
          hint={`Step reached: ${session.current_step}/10`}
          icon={Gamepad2}
          accent={session.status === "won" ? "success" : "gold"}
        />
        <StatCard
          label="Elapsed Time"
          value={
            <DurationDisplay
              startedAt={session.started_at}
              endedAt={session.ended_at}
              className="text-xl font-semibold text-text"
            />
          }
          hint={`Started ${formatRelativeTime(session.started_at)}`}
          icon={Clock}
          accent="gold"
        />
      </div>

      {/* 2-Column: LEFT (Grid + Actions) + RIGHT (Controls & Specs) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Grid & Timeline (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: THE GRID */}
          <div className="glass rounded-xl p-5 border border-white/[0.06]">
            <SectionHeader
              title="Apple Matrix (10×5)"
              description="Full matrix view with step choices and win pathways"
              action={
                gridObj?.is_forced && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-warning bg-warning/10 border border-warning/30 px-2 py-0.5 rounded">
                    Forced Grid Active
                  </span>
                )
              }
            />

            <AppleGrid
              grid={gridObj?.grid_json}
              currentStep={session.current_step}
              chosenColumns={chosenColumns}
              forcedOutcome={session.forced_outcome}
              betSum={session.bet_sum}
              status={session.status}
              size="md"
              showFooter={true}
            />
          </div>

          {/* Card 2: Actions Timeline */}
          <div className="glass rounded-xl p-5 border border-white/[0.06]">
            <SectionHeader
              title="Action Ledger"
              description="Chronological audit of player column selections"
            />

            {actions.length === 0 ? (
              <EmptyState
                icon={Gamepad2}
                title="No actions recorded"
                description="This session has no recorded player steps yet."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                        Step
                      </th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                        Chosen Col
                      </th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                        Correct Col
                      </th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                        Outcome
                      </th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                        Multiplier
                      </th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium text-right">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {actions.map((act) => {
                      const isGood = act.result === "good";
                      return (
                        <tr
                          key={act.id}
                          className="border-b border-void-border last:border-b-0 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-2.5 px-3 font-mono text-xs text-text font-semibold">
                            Step {act.step + 1}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-xs text-gold">
                            Column {act.chosen_column}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-xs text-text-muted">
                            Column {act.correct_column}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${
                                isGood
                                  ? "bg-success/10 border-success/30 text-success"
                                  : "bg-danger/10 border-danger/30 text-danger"
                              }`}
                            >
                              {isGood ? (
                                <CheckCircle className="w-3 h-3 text-success" />
                              ) : (
                                <XCircle className="w-3 h-3 text-danger" />
                              )}
                              {act.result}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-xs text-text">
                            {act.coefficient}x
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[11px] text-text-muted">
                            {formatRelativeTime(act.at)}
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

        {/* RIGHT COLUMN: Intervention & Specs (1 col) */}
        <div className="space-y-6">
          {/* Card 1: Intervention Controls */}
          <div className="glass rounded-xl p-5 border border-white/[0.06]">
            <SectionHeader
              title="Intervention"
              description="Enforce next outcome for this specific session"
            />
            <div className="pt-2">
              <ForceOutcomeControls
                sessionId={session.id}
                currentOutcome={session.forced_outcome}
              />
            </div>
          </div>

          {/* Card 2: Session Specs */}
          <div className="glass rounded-xl p-5 border border-white/[0.06]">
            <SectionHeader
              title="Session Details"
              description="Execution parameters and foreign identifiers"
            />

            <dl className="space-y-3 pt-1 text-xs">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                  Session ID
                </dt>
                <dd className="font-mono text-text break-all mt-0.5">
                  {session.id}
                </dd>
              </div>

              <div>
                <dt className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                  Device ID
                </dt>
                <dd className="font-mono text-text break-all mt-0.5">
                  <Link
                    href={`/devices/${session.device_id}`}
                    className="text-gold hover:underline"
                  >
                    {session.device_id}
                  </Link>
                </dd>
              </div>

              <div>
                <dt className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                  Difficulty Profile
                </dt>
                <dd className="font-mono text-text mt-0.5 uppercase tracking-wider">
                  {session.difficulty_profile || "standard"}
                </dd>
              </div>

              <div>
                <dt className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                  Forced Outcome
                </dt>
                <dd className="font-mono text-text mt-0.5">
                  {session.forced_outcome ? (
                    <span className="text-warning font-semibold uppercase">
                      {session.forced_outcome}
                    </span>
                  ) : (
                    "None"
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                  Created At
                </dt>
                <dd className="font-mono text-text-muted mt-0.5">
                  {formatRelativeTime(session.started_at)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Card 3: Grid Override (if still active or general) */}
          <div className="glass rounded-xl p-5 border border-white/[0.06]">
            <SectionHeader
              title="Grid Override"
              description="Inject custom 10×5 matrix into engine"
            />

            <form onSubmit={handleApplyGridOverride} className="space-y-3 pt-1">
              <div className="p-2.5 rounded-md bg-warning/10 border border-warning/20 text-warning text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Applies globally to future rounds generated by MakeBetGame.
                </span>
              </div>

              <textarea
                rows={7}
                value={overrideJson}
                onChange={(e) => setOverrideJson(e.target.value)}
                className="w-full p-2.5 rounded-md bg-void-surface border border-void-border font-mono text-[11px] text-text focus:ring-1 focus:ring-gold/30 outline-none scrollbar-thin"
              />

              <Button
                type="submit"
                disabled={updateConfigMutation.isPending}
                className="w-full bg-gold text-black hover:bg-gold-light font-semibold text-xs h-9"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Validate & Apply Override
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
