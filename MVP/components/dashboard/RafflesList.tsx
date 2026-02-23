"use client";

import { ChevronRight } from "lucide-react";
import { Raffle } from "@/stores/raffleStore";
import { useUIStore } from "@/stores/uiStore";
import { Badge } from "@/components/ui/Badge";
import { Countdown } from "@/components/ui/Countdown";
import { formatDate, formatPool, formatUSDC } from "@/utils";

interface RafflesListProps { raffles: Raffle[] }

export function RafflesList({ raffles }: RafflesListProps) {
  const { openBuyModal } = useUIStore();

  return (
    <div>
      <h3
        className="text-xs uppercase tracking-wider mb-3"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
      >
        All Raffles
      </h3>
      <div
        className="rounded-2xl border overflow-hidden divide-y"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border)",
          // Tailwind v4 divide utilities still work
        }}
      >
        {raffles.map((raffle) => (
          <button
            key={raffle.id}
            onClick={() => raffle.status === "active" && openBuyModal(raffle.id)}
            className={`w-full text-left p-4 transition-colors ${
              raffle.status === "active"
                ? "cursor-pointer"
                : "cursor-default opacity-70"
            }`}
            style={raffle.status === "active" ? {} : {}}
            onMouseEnter={(e) => {
              if (raffle.status === "active")
                (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(14,20,32,.6)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "";
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={raffle.status}>
                    {raffle.status === "active" ? "Active" : "Finalized"}
                  </Badge>
                  <span
                    className="text-sm font-semibold truncate"
                    style={{ color: "var(--color-text-bright)", fontFamily: "var(--font-display)" }}
                  >
                    {raffle.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-muted)" }}>
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {formatUSDC(raffle.ticketPrice)} USDC/ticket
                  </span>
                  <span style={{ color: "var(--color-border)" }}>·</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>{formatPool(raffle.pool)} pool</span>
                  <span style={{ color: "var(--color-border)" }}>·</span>
                  {raffle.status === "active" ? (
                    <Countdown endsAt={raffle.endsAt} compact />
                  ) : (
                    <span>Ended {formatDate(raffle.endsAt)}</span>
                  )}
                </div>
              </div>

              {raffle.status === "active" && (
                <ChevronRight size={16} style={{ color: "var(--color-muted)" }} className="flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
