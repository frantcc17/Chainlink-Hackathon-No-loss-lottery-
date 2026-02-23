"use client";

// React 19: no explicit import needed
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";
import { useUserStore } from "@/stores/userStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, email: storedEmail } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (storedEmail) router.replace("/dashboard");
  }, [storedEmail, router]);

  const handleEnter = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    login(trimmed);
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Background orbs */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "rgba(0,229,255,.05)", filter: "blur(80px)" }}
      />
      <div
        className="fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "rgba(245,197,66,.03)", filter: "blur(100px)" }}
      />

      <div className="relative w-full max-w-sm mx-auto space-y-8" style={{ animation: "var(--animate-slide-up)" }}>
        {/* Logo */}
        <div className="text-center space-y-3">
          <div
            className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center border accent-glow"
            style={{
              background: "linear-gradient(135deg, rgba(0,229,255,.20), rgba(0,229,255,.05))",
              borderColor: "rgba(0,229,255,.20)",
            }}
          >
            <Zap size={28} style={{ color: "var(--color-accent)" }} />
          </div>
          <div>
            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: "var(--color-text-bright)", fontFamily: "var(--font-display)" }}
            >
              LuckYield
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              No-loss yield raffles on-chain
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex justify-center gap-2 flex-wrap">
          {[
            { icon: Shield, label: "No-loss" },
            { icon: TrendingUp, label: "Yield-powered" },
            { icon: Zap, label: "Chainlink VRF" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
                color: "var(--color-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              <Icon size={11} style={{ color: "var(--color-accent)" }} />
              {label}
            </div>
          ))}
        </div>

        {/* Login card */}
        <div
          className="rounded-2xl border p-6 space-y-4"
          style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
        >
          <div>
            <h2
              className="text-base font-bold"
              style={{ color: "var(--color-text-bright)", fontFamily: "var(--font-display)" }}
            >
              Get started
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
              Demo mode — no password required
            </p>
          </div>

          <form onSubmit={handleEnter} className="space-y-3">
            <div>
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-wider mb-1.5"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                className="input-field"
              />
              {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Entering...
                </>
              ) : (
                <>
                  Enter App
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <p
              className="text-[10px] leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              You&apos;ll receive{" "}
              <span style={{ color: "var(--color-accent)", fontFamily: "var(--font-mono)" }}>
                100 USDC
              </span>{" "}
              demo balance.
              <br />No real funds involved.
            </p>
          </div>
        </div>

        <p
          className="text-center text-[10px]"
          style={{ color: "rgba(74,96,128,.5)", fontFamily: "var(--font-mono)" }}
        >
          LUCKYYIELD MVP · CHAINLINK HACKATHON 2025
        </p>
      </div>
    </main>
  );
}
