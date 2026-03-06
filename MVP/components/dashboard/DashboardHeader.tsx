"use client";

import { useState, useEffect } from "react";
import { Wallet, Zap, CheckCircle2 } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { formatUSDC } from "@/utils";

export function DashboardHeader() {
  const { email, balance } = useUserStore();
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const shortEmail = email?.split("@")[0] ?? "anon";

  // Verificar si ya estaba conectado al cargar
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) setAccount(accounts[0]);
        } catch (err) {
          console.error("Error checking wallet connection", err);
        }
      }
    };
    checkConnection();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      setIsConnecting(true);
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("User rejected connection");
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("MetaMask no está instalado. Por favor, instálalo para continuar.");
    }
  };

  // Formatear dirección para mostrar: 0x123...abcd
  const shortAddress = account 
    ? `${account.slice(0, 5)}...${account.slice(-4)}` 
    : "";

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
            onClick={connectWallet}
            disabled={isConnecting || !!account}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              account ? "cursor-default" : "hover:bg-white/5 active:scale-95"
            }`}
            style={{ 
              borderColor: account ? "rgba(0,229,255,0.4)" : "var(--color-border)",
              color: account ? "var(--color-accent)" : "var(--color-text-bright)"
            }}
          >
            {account ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-xs font-mono">{shortAddress}</span>
              </>
            ) : (
              <>
                <Wallet size={14} />
                <span className="text-xs hidden sm:block" style={{ fontFamily: "var(--font-mono)" }}>
                  {isConnecting ? "Connecting..." : "Connect"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
