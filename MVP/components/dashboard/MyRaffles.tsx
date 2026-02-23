"use client";

import { Ticket, ExternalLink } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useUserStore, UserEntry } from "@/stores/userStore";
import { useRaffleStore } from "@/stores/raffleStore";
import { useUIStore } from "@/stores/uiStore";
import { formatDate, formatUSDC } from "@/utils";

export function MyRaffles() {
  const { entries } = useUserStore();
  const { raffles } = useRaffleStore();
  const { openResultModal, openBuyModal } = useUIStore();

  const active   = entries.filter((e) => e.status === "active");
  const finalized = entries.filter((e) => e.status === "finalized");
  const getRaffle = (id: string) => raffles.find((r) => r.id === id);

  return (
    <div>
      <h3
        className="text-xs uppercase tracking-wider mb-3"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
      >
        My Raffles
      </h3>

      <Tabs defaultValue="active">
        <TabsList className="w-full">
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="finalized">Finalized ({finalized.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {active.length === 0 ? (
            <EmptyState message="No active entries. Buy tickets to get started!" />
          ) : (
            <div className="space-y-2">
              {active.map((entry) => {
                const raffle = getRaffle(entry.raffleId);
                return (
                  <EntryCard
                    key={entry.raffleId}
                    entry={entry}
                    raffleName={raffle?.title ?? entry.raffleId}
                    endDate={raffle?.endsAt}
                    ticketPrice={raffle?.ticketPrice ?? 0}
                    onBuyMore={() => openBuyModal(entry.raffleId)}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="finalized">
          {finalized.length === 0 ? (
            <EmptyState message="No finalized raffles yet." />
          ) : (
            <div className="space-y-2">
              {finalized.map((entry) => {
                const raffle = getRaffle(entry.raffleId);
                return (
                  <FinalizedEntryCard
                    key={entry.raffleId}
                    entry={entry}
                    raffleName={raffle?.title ?? entry.raffleId}
                    onViewResult={() =>
                      openResultModal(entry.raffleId, entry.outcome === "won" ? "won" : "lost")
                    }
                  />
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EntryCard({
  entry, raffleName, endDate, ticketPrice, onBuyMore,
}: {
  entry: UserEntry; raffleName: string; endDate?: string;
  ticketPrice: number; onBuyMore: () => void;
}) {
  return (
    <div
      className="rounded-xl p-4 flex items-center justify-between gap-3 border"
      style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "rgba(0,229,255,.10)" }}
        >
          <Ticket size={16} style={{ color: "var(--color-accent)" }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-bright)", fontFamily: "var(--font-display)" }}>
            {raffleName}
          </p>
          <p className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
            {entry.ticketsBought} ticket{entry.ticketsBought !== 1 ? "s" : ""}
            {" · "}{formatUSDC(entry.ticketsBought * ticketPrice)} USDC
            {endDate && ` · ends ${formatDate(endDate)}`}
          </p>
        </div>
      </div>
      <button
        onClick={onBuyMore}
        className="text-xs flex-shrink-0 transition-colors"
        style={{ color: "var(--color-accent)", fontFamily: "var(--font-mono)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent-dim)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
      >
        + More
      </button>
    </div>
  );
}

function FinalizedEntryCard({
  entry, raffleName, onViewResult,
}: { entry: UserEntry; raffleName: string; onViewResult: () => void }) {
  const outcome = entry.outcome as "won" | "lost" | "pending";
  return (
    <div
      className="rounded-xl p-4 flex items-center justify-between gap-3 border"
      style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <Ticket size={16} style={{ color: "var(--color-muted)" }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-bright)", fontFamily: "var(--font-display)" }}>
            {raffleName}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant={outcome === "won" ? "won" : outcome === "lost" ? "lost" : "pending"}>
              {outcome === "won" ? "Won 🎉" : outcome === "lost" ? "Lost" : "Pending"}
            </Badge>
            <span className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
              {entry.ticketsBought} ticket{entry.ticketsBought !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onViewResult} className="flex-shrink-0 gap-1.5">
        <ExternalLink size={12} />
        Result
      </Button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-xl border-2 border-dashed p-8 text-center"
      style={{ borderColor: "var(--color-border)", backgroundColor: "rgba(19,25,35,.5)" }}
    >
      <Ticket size={28} className="mx-auto mb-2" style={{ color: "var(--color-muted)" }} />
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>{message}</p>
    </div>
  );
}
