"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  Smartphone,
  History,
  Radio,
  Sliders,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "/overview", icon: LayoutDashboard },
  { label: "Accounts", href: "/accounts", icon: Users },
  { label: "Devices", href: "/devices", icon: Smartphone },
  { label: "Sessions", href: "/sessions", icon: History },
  { label: "Live Games", href: "/live", icon: Radio },
  { label: "Configuration", href: "/config", icon: Sliders },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#000000] border-r border-[#1f1f1f] flex flex-col z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-[#1f1f1f]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f4e4a8] via-[#d4af37] to-[#aa8c2c] flex items-center justify-center font-bold text-black text-lg shadow-[0_0_15px_-3px_rgba(212,175,55,0.4)]">
          O
        </div>
        <div>
          <div className="text-sm font-semibold tracking-wider text-white">
            ONEX LAB
          </div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#737373]">
            Control Plane
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#737373]">
          Platform
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium border",
                isActive
                  ? "bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/25 shadow-[0_0_15px_-4px_rgba(212,175,55,0.2)]"
                  : "text-[#737373] hover:text-[#e5e5e5] hover:bg-white/[0.03] border-transparent"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-[#d4af37]" : "text-[#737373]")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Footer / Sign Out */}
      <div className="p-4 border-t border-[#1f1f1f]">
        <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] mb-3 flex items-center gap-2 text-xs text-[#737373]">
          <ShieldAlert className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Lab Environment</span>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#737373] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors border border-transparent hover:border-[#ef4444]/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
