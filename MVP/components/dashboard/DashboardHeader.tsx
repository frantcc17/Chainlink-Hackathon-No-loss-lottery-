"use client";

import { Wallet, Zap, CheckCircle2, Loader2, LogOut } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { formatUSDC } from "@/utils";

// --- NUEVAS IMPORTACIONES WEB3 ---
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useEffect } from "react";
// ---------------------------------

export function DashboardHeader() {
  const { email } = useUserStore();
  
  // Hooks de Wagmi para estado global de la wallet
  const { address, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Obtenemos el balance real de la blockchain (opcional, si quieres el nativo)
  const { data: blockchainBalance } = useBalance({
    address: address,
  });

  const shortEmail = email?.split("@")[0] ?? "anon";

  // Formatear dirección para mostrar: 0x123...abcd
  const shortAddress = address 
    ? `${address.slice(0, 5)}...${address.slice(-4)}` 
    : "";

  const handleAuth = () => {
    if (isConnected) {
      // Opcional: Podrías poner un menú desplegable para desconectar
      if (confirm("Disconnect wallet?")) disconnect();
    } else {
      connect({ connector: injected() });
    }
  };

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
          {/* Balance Section (Muestra balance real si está conectado) */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <Zap size={12} style={{ color: "var(--color-accent)" }} />
            <span
              className="text-sm font-semibold"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-bright)" }}
            >
              {isConnected && blockchainBalance 
                ? Number(blockchainBalance.formatted).toFixed(4) 
                : "0.00"}
            </span>
            <span
              className="text-xs"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}
            >
              {blockchainBalance?.symbol || "ETH"}
            </span>
          </div>

          {/* Wallet Button */}
          <button
            onClick={handleAuth}
            disabled={isConnecting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all active:scale-95 ${
              isConnected ? "hover:border-red-500/50 group" : "hover:bg-white/5"
            }`}
            style={{ 
              borderColor: isConnected ? "rgba(0,229,255,0.4)" : "var(--color-border)",
              color: isConnected ? "var(--color-accent)" : "var(--color-text-bright)"
            }}
          >
            {isConnecting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isConnected ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-400 group-hover:hidden" />
                <LogOut size={14} className="text-red-400 hidden group-hover:block" />
                <span className="text-xs font-mono">{shortAddress}</span>
              </>
            ) : (
              <>
                <Wallet size={14} />
                <span className="text-xs hidden sm:block" style={{ fontFamily: "var(--font-mono)" }}>
                  Connect
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
