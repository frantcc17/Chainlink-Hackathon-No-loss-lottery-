"use client";

import { useState } from "react";
import { Bug, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRaffleStore } from "@/stores/raffleStore";
import { useUserStore } from "@/stores/userStore";
import { useUIStore } from "@/stores/uiStore";

interface DebugPanelProps { activeRaffleId?: string }

export function DebugPanel({ activeRaffleId }: DebugPanelProps) {
  const [open, setOpen] = useState(false);
  const { finalizeRaffle } = useRaffleStore();
  const { finalizeEntry, addEntry, entries } = useUserStore();
  const { openResultModal } = useUIStore();

  const handleFinalizeRaffle = () => {
    if (!activeRaffleId) return;

    const outcome: "won" | "lost" = Math.random() > 0.5 ? "won" : "lost";
    finalizeRaffle(activeRaffleId);

    const hasEntry = entries.find((e) => e.raffleId === activeRaffleId);
    if (!hasEntry) {
      addEntry({ raffleId: activeRaffleId, ticketsBought: 1, status: "active", outcome: "pending" });
    }

    finalizeEntry(activeRaffleId, outcome);
    openResultModal(activeRaffleId, outcome);
  };

  const handleAddBalance = () => {
    // Zustand v5: setState signature unchanged for external calls
    useUserStore.setState((s) => ({ balance: s.balance + 50 }));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div
          className="rounded-2xl border p-4 shadow-2xl w-64"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "rgba(239,68,68,.3)",
            animation: "var(--animate-slide-up)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bug size={14} className="text-red-400" />
              <span
                className="text-xs font-semibold text-red-400 uppercase tracking-wider"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Debug Mode
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-xs"
              style={{ color: "var(--color-muted)" }}
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <Button
              variant="danger"
              size="sm"
              className="w-full gap-2"
              onClick={handleFinalizeRaffle}
              disabled={!activeRaffleId}
            >
              <Zap size={13} />
              Finalize raffle (demo)
            </Button>

            <Button variant="ghost" size="sm" className="w-full gap-2" onClick={handleAddBalance}>
              <RefreshCw size={13} />
              +50 USDC (demo)
            </Button>

            <p
              className="text-[10px] text-center mt-2"
              style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
            >
              Only visible with ?debug=1
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-lg"
          style={{
            backgroundColor: "rgba(239,68,68,.10)",
            border: "1px solid rgba(239,68,68,.30)",
            color: "#f87171",
          }}
          title="Debug panel"
        >
          <Bug size={16} />
        </button>
      )}
    </div>
  );
}
