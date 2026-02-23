"use client";

import { Trophy, Frown, ExternalLink } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogBody, DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useUIStore } from "@/stores/uiStore";
import { useRaffleStore } from "@/stores/raffleStore";

export function ResultModal() {
  const { resultModalData, closeResultModal } = useUIStore();
  const { raffles } = useRaffleStore();

  if (!resultModalData) return null;

  const { outcome } = resultModalData;
  const raffle = raffles.find((r) => r.id === resultModalData.raffleId);
  const won = outcome === "won";

  return (
    <Dialog open={!!resultModalData} onOpenChange={(open) => !open && closeResultModal()}>
      <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-sm">
        <DialogHeader>
          <DialogTitle className="sr-only">Raffle Result</DialogTitle>
          <DialogDescription className="sr-only">Result of the raffle</DialogDescription>
        </DialogHeader>

        <DialogBody className="py-8 text-center space-y-4">
          {/* Icon */}
          <div
            className="mx-auto w-20 h-20 rounded-full flex items-center justify-center text-4xl border-2"
            style={
              won
                ? { backgroundColor: "rgba(245,197,66,.10)", borderColor: "rgba(245,197,66,.30)" }
                : { backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }
            }
          >
            {won ? (
              <Trophy size={36} style={{ color: "var(--color-gold)" }} />
            ) : (
              <Frown size={36} style={{ color: "var(--color-muted)" }} />
            )}
          </div>

          {won ? (
            <>
              <div>
                <h2
                  className="text-2xl font-bold mb-1"
                  style={{ color: "var(--color-gold)", fontFamily: "var(--font-display)" }}
                >
                  🎉 You won!
                </h2>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  Congratulations! Your yield reward is ready to claim.
                </p>
              </div>

              <div
                className="rounded-xl border p-4 text-left space-y-2"
                style={{ backgroundColor: "rgba(245,197,66,.05)", borderColor: "rgba(245,197,66,.15)" }}
              >
                <p className="text-xs uppercase tracking-wider" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                  Raffle
                </p>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-bright)", fontFamily: "var(--font-display)" }}>
                  {raffle?.title}
                </p>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>{raffle?.payoutInfo}</p>
              </div>

              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                {/* TODO: Link to Chainlink VRF randomness proof on-chain */}
                In production, this win is provably fair via Chainlink VRF. On-chain verification available.
              </p>
            </>
          ) : (
            <>
              <div>
                <h2
                  className="text-xl font-bold mb-1"
                  style={{ color: "var(--color-text-bright)", fontFamily: "var(--font-display)" }}
                >
                  Better luck next time
                </h2>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  You didn&apos;t win this raffle. Your principal is safe — no loss of funds.
                </p>
              </div>

              <div
                className="rounded-xl border p-4 text-left"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                  No-loss guarantee
                </p>
                <p className="text-sm" style={{ color: "var(--color-text)" }}>
                  100% of your ticket cost is returned. Only the generated yield goes to the winner.
                </p>
              </div>
            </>
          )}
        </DialogBody>

        <DialogFooter>
          {won ? (
            <Button variant="gold" className="w-full gap-2" onClick={closeResultModal}>
              <ExternalLink size={14} />
              Claim Reward (demo)
            </Button>
          ) : (
            <Button variant="primary" className="w-full" onClick={closeResultModal}>
              Enter Next Raffle
            </Button>
          )}
          <Button variant="ghost" size="sm" className="w-full" onClick={closeResultModal}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
