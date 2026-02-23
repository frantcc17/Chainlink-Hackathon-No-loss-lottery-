"use client";

import { Wallet, Zap } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { formatUSDC } from "@/utils";

export function DashboardHeader() {
  const { email, balance } = useUserStore();
  const shortEmail = email?.split("@")[0] ?? "anon";

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: "rgba(8,11,18,0.80)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: greeting */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center border"
            style={{
              background: "linear-gradient(135deg, rgba(0,229,255,.3), rgba(0,229,255,.1))",
              borderColor: "rgba(0,229,255,.2)",
            }}
          >
            <span
              className="text-xs font-bold"
              style={{ color: "var(--color-accent)", fontFamily: "var(--font-display)" }}
            >
              {shortEmail[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-xs leading-tight" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
              Hello,
            </p>
            <p
              className="text-sm font-semibold leading-tight"
              style={{ color: "var(--color-text-bright)", fontFamily: "var(--font-display)" }}
            >
              {shortEmail}
            </p>
          </div>
        </div>

        {/* Right: balance + wallet */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <Zap size={12} style={{ color: "var(--color-accent)" }} />
            <span
              className="text-sm font-semibold"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-bright)" }}
            >
              {formatUSDC(balance)}
            </span>
            <span
              className="text-xs"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}
            >
              USDC
            </span>
          </div>

          <button
            disabled
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-not-allowed opacity-50"
            style={{ borderColor: "rgba(30,42,58,0.5)", color: "var(--color-muted)" }}
            title="Connect wallet — coming soon"
          >
            <Wallet size={14} />
            <span className="text-xs hidden sm:block" style={{ fontFamily: "var(--font-mono)" }}>
              Connect
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
