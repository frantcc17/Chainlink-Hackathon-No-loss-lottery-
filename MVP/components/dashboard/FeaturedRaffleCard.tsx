"use client";

import { Ticket, TrendingUp, Users } from "lucide-react";
import { Raffle } from "@/stores/raffleStore";
import { useUIStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/Button";
import { Countdown } from "@/components/ui/Countdown";
import { formatPool, formatUSDC } from "@/utils";

interface FeaturedRaffleCardProps {
  raffle: Raffle;
}

export function FeaturedRaffleCard({ raffle }: FeaturedRaffleCardProps) {
  const { openBuyModal } = useUIStore();

  return (
    <div
      className="relative rounded-2xl overflow-hidden border accent-glow"
      style={{
        borderColor: "rgba(0,229,255,.2)",
        background: "linear-gradient(135deg, var(--color-card) 0%, rgba(0,229,255,.03) 100%)",
        animation: "var(--animate-fade-in)",
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "rgba(0,229,255,.05)", filter: "blur(48px)" }} />
      <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: "rgba(0,229,255,.03)", filter: "blur(32px)" }} />

      <div className="relative p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: "rgba(0,229,255,.7)", fontFamily: "var(--font-mono)" }}
              >
                Featured Raffle
              </span>
              <span
                className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 border"
                style={{
                  color: "var(--color-accent)",
                  backgroundColor: "rgba(0,229,255,.10)",
                  borderColor: "rgba(0,229,255,.15)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]"
                  style={{ animation: "var(--animate-pulse-slow)" }} />
                LIVE
              </span>
            </div>
            <h2
              className="text-xl font-bold"
              style={{ color: "var(--color-text-bright)", fontFamily: "var(--font-display)" }}
            >
              {raffle.title}
            </h2>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatItem icon={<Ticket size={14} style={{ color: "var(--color-accent)" }} />}
            label="Entry" value={`${formatUSDC(raffle.ticketPrice)} USDC`} />
          <StatItem icon={<TrendingUp size={14} style={{ color: "var(--color-gold)" }} />}
            label="Pool" value={`${formatPool(raffle.pool)} USDC`} />
          <StatItem icon={<Users size={14} style={{ color: "var(--color-accent)" }} />}
            label="Protocol" value={raffle.yieldProtocol} />
        </div>

        {/* Countdown */}
        <div
          className="rounded-xl p-3 border"
          style={{ backgroundColor: "rgba(8,11,18,.4)", borderColor: "var(--color-border)" }}
        >
          <p
            className="text-[10px] uppercase tracking-wider mb-2"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
          >
            Ends in
          </p>
          <Countdown endsAt={raffle.endsAt} />
        </div>

        {/* Payout */}
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
          {raffle.payoutInfo}
        </p>

        <Button variant="primary" size="lg" className="w-full" onClick={() => openBuyModal(raffle.id)}>
          <Ticket size={16} />
          Buy Entries
        </Button>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="rounded-xl p-2.5 border"
      style={{ backgroundColor: "rgba(14,20,32,.6)", borderColor: "rgba(30,42,58,.6)" }}
    >
      <div className="flex items-center gap-1 mb-1">{icon}</div>
      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
        {label}
      </p>
      <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-bright)", fontFamily: "var(--font-display)" }}>
        {value}
      </p>
    </div>
  );
}
