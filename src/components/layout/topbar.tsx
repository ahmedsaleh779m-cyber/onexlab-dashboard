"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Shield } from "lucide-react";

export function Topbar() {
  const [email, setEmail] = useState<string>("admin@onexlab.site");
  const [apiOnline, setApiOnline] = useState<boolean>(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setEmail(data.user.email);
      }
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://lab.onexlab.site";
    fetch(`${apiUrl}/api/v1/health`)
      .then((res) => setApiOnline(res.ok))
      .catch(() => setApiOnline(false));
  }, [supabase]);

  const initials = email.slice(0, 2).toUpperCase();

  return (
    <header className="fixed top-0 right-0 left-[260px] h-16 bg-[#000000]/70 backdrop-blur-xl border-b border-[#1f1f1f] px-8 flex items-center justify-between z-30">
      {/* API Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs">
          <span className="relative flex h-2 w-2">
            {apiOnline && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                apiOnline ? "bg-[#10b981]" : "bg-[#ef4444]"
              }`}
            ></span>
          </span>
          <span className="font-mono text-[11px] text-[#737373]">
            API:{" "}
            <span className={apiOnline ? "text-[#10b981]" : "text-[#ef4444]"}>
              {apiOnline ? "CONNECTED" : "OFFLINE"}
            </span>
          </span>
        </div>
      </div>

      {/* User Details */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#d4af37]/10 border border-[#d4af37]/20 text-[11px] font-mono text-[#d4af37]">
          <Shield className="w-3 h-3" />
          <span>ADMIN</span>
        </div>
        <div className="flex items-center gap-3 pl-2 border-l border-[#1f1f1f]">
          <div className="text-right">
            <div className="text-xs font-medium text-[#e5e5e5]">{email}</div>
            <div className="text-[10px] font-mono text-[#737373]">Lab Operator</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#141414] border border-[#d4af37]/40 flex items-center justify-center text-xs font-mono font-bold text-[#d4af37] shadow-[0_0_10px_-2px_rgba(212,175,55,0.25)]">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
