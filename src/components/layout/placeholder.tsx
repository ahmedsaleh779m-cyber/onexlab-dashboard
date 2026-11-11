import React from "react";
import { Construction } from "lucide-react";

interface PlaceholderProps {
  phase: string;
  description?: string;
}

export function Placeholder({
  phase,
  description = "This page will be built in the next phase of the control plane.",
}: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] rounded-2xl glass border border-white/[0.06] p-12 text-center relative overflow-hidden">
      {/* Decorative radial behind icon */}
      <div className="absolute w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/25 flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(212,175,55,0.2)]">
          <Construction className="w-8 h-8 text-[#d4af37]" />
        </div>
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Coming in Phase {phase}
        </h2>
        <p className="text-sm text-[#737373] max-w-sm mt-2 leading-relaxed">
          {description}
        </p>

        <div className="mt-6 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-[#d4af37]">
          FOUNDATION READY · SPEC IN PROGRESS
        </div>
      </div>
    </div>
  );
}
