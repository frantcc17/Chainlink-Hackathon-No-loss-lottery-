"use client";

import { useState } from "react";
import { Minus, Plus, Ticket, Clock, TrendingUp } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogBody, DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useUserStore } from "@/stores/userStore";
import { useRaffleStore } from "@/stores/raffleStore";
import { useUIStore } from "@/stores/uiStore";
import { formatUSDC } from "@/utils";

export function BuyEntriesModal() {
  const { buyModalRaffleId, closeBuyModal } = useUIStore();
  const { raffles, addToPool } = useRaffleStore();
  const { balance, deductBalance, addEntry } = useUserStore();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const raffle = raffles.find((r) => r.id === buyModalRaffleId);
  if (!raffle) return null;

  const cost = raffle.ticketPrice * quantity;
  const remainingBalance = balance - cost;
  const canAfford = remainingBalance >= 0;

  const handleChange = (delta: number) =>
    setQuantity((q) => Math.max(1, Math.min(50, q + delta)));

  const handleConfirm = async () => {
    if (!canAfford) return;
    setLoading(true);

    // TODO: Replace with wagmi `writeContract` call — USDC approve + buyTickets
    await new Promise((r) => setTimeout(r, 800));

    deductBalance(cost);
    addToPool(raffle.id, cost);
    addEntry({ raffleId: raffle.id, ticketsBought: quantity, status: "active", outcome: "pending" });

    setSuccess(true);
    setLoading(false);
    await new Promise((r) => setTimeout(r, 1200));
    setSuccess(false);
    setQuantity(1);
    closeBuyModal();
  };

  return (
    <Dialog open={!!buyModalRaffleId} onOpenChange={(open) => !open && closeBuyModal()}>
      <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(0,229,255,.10)" }}
            >
              <Ticket size={16} style={{ color: "var(--color-accent)" }} />
            </div>
            <DialogTitle>Buy Entries</DialogTitle>
          </div>
          <DialogDescription>{raffle.title}</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {/* Stepper */}
          <div>
            <label
              className="block text-xs uppercase tracking-wider mb-2"
              style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
            >
              Number of tickets
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleChange(-1)}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-xl border flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 text-center">
                <span
                  className="text-3xl font-bold"
                  style={{ color: "var(--color-text-bright)", fontFamily: "var(--font-display)" }}
                >
                  {quantity}
                </span>
              </div>
              <button
                onClick={() => handleChange(1)}
                disabled={quantity >= 50}
                className="w-10 h-10 rounded-xl border flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Cost breakdown */}
          <div
            className="rounded-xl border p-4 space-y-3"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--color-muted)" }}>Ticket price</span>
              <span className="text-sm font-semibold" style={{ color: "var(--color-text-bright)", fontFamily: "var(--font-mono)" }}>
                {formatUSDC(raffle.ticketPrice)} USDC
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--color-muted)" }}>Quantity</span>
              <span className="text-sm font-semibold" style={{ color: "var(--color-text-bright)", fontFamily: "var(--font-mono)" }}>
                × {quantity}
              </span>
            </div>
            <div
              className="border-t pt-3 flex justify-between items-center"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Total cost</span>
              <span className="text-lg font-bold" style={{ color: "var(--color-accent)", fontFamily: "var(--font-display)" }}>
                {formatUSDC(cost)} USDC
              </span>
            </div>
          </div>

          {/* Balance preview */}
          <div
            className="rounded-xl p-3 border"
            style={{
              backgroundColor: canAfford ? "var(--color-surface)" : "rgba(239,68,68,.05)",
              borderColor: canAfford ? "var(--color-border)" : "rgba(239,68,68,.2)",
            }}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                Balance after purchase
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: canAfford ? "var(--color-text-bright)" : "#f87171", fontFamily: "var(--font-mono)" }}
              >
                {canAfford ? `${formatUSDC(remainingBalance)} USDC` : "Insufficient balance"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs" style={{ color: "var(--color-muted)" }}>
            <Clock size={12} className="mt-0.5 flex-shrink-0" style={{ color: "rgba(0,229,255,.6)" }} />
            <span>Profit distribution in 2 weeks after raffle finalizes.</span>
          </div>

          <div className="flex items-start gap-2 text-xs" style={{ color: "var(--color-muted)" }}>
            <TrendingUp size={12} className="mt-0.5 flex-shrink-0" style={{ color: "rgba(0,229,255,.6)" }} />
            <span>
              {/* TODO: Replace with actual Chainlink-powered yield protocol */}
              Pool invested via {raffle.yieldProtocol} (simulated). Smart contract integration coming soon.
            </span>
          </div>
        </DialogBody>

        <DialogFooter>
          {success ? (
            <div
              className="w-full py-3 rounded-xl border text-center text-sm font-semibold"
              style={{
                backgroundColor: "rgba(0,229,255,.10)",
                borderColor: "rgba(0,229,255,.20)",
                color: "var(--color-accent)",
                fontFamily: "var(--font-display)",
              }}
            >
              ✓ Tickets purchased!
            </div>
          ) : (
            <Button variant="primary" className="w-full" disabled={!canAfford} loading={loading} onClick={handleConfirm}>
              Confirm Purchase — {formatUSDC(cost)} USDC
            </Button>
          )}
          <Button variant="ghost" size="sm" className="w-full" onClick={closeBuyModal}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
