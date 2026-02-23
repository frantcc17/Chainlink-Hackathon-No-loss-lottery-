"use client";

/**
 * Zustand v5 — curried create<T>()((set) => ...) pattern required.
 * The persist middleware `merge` option is still available but the
 * generic type signature was tightened in v5.
 */
import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

export type RaffleStatus = "active" | "finalized";

export interface Raffle {
  id: string;
  title: string;
  status: RaffleStatus;
  endsAt: string; // ISO date
  ticketPrice: number; // USDC
  pool: number; // total USDC in pool
  payoutInfo: string;
  description: string;
  yieldProtocol: string; // e.g. "Aave v3" (simulated)
}

// --- Mock Data ---
// TODO: Replace with on-chain contract reads via Chainlink + wagmi/viem
const INITIAL_RAFFLES: Raffle[] = [
  {
    id: "raffle-001",
    title: "Weekly Yield Raffle",
    status: "active",
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000 + 12 * 60 * 1000).toISOString(),
    ticketPrice: 5,
    pool: 12450,
    payoutInfo: "Winner takes 80% of yield. Remaining 20% re-invested.",
    description: "Entry funds deposited into Aave v3 for yield. Chainlink VRF selects winner.",
    yieldProtocol: "Aave v3",
  },
  {
    id: "raffle-002",
    title: "Mega Monthly Draw",
    status: "active",
    endsAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    ticketPrice: 20,
    pool: 87320,
    payoutInfo: "Winner receives full yield. No-loss principal returned to all.",
    description: "Larger pool, higher stakes. Chainlink Automation triggers finalization.",
    yieldProtocol: "Compound v3",
  },
  {
    id: "raffle-003",
    title: "Flash Friday Raffle",
    status: "finalized",
    endsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ticketPrice: 2,
    pool: 3200,
    payoutInfo: "Quick 48h raffle, winner gets yield.",
    description: "Short raffle finalized via Chainlink Automation.",
    yieldProtocol: "Aave v3",
  },
  {
    id: "raffle-004",
    title: "Crypto Winter Survivor",
    status: "finalized",
    endsAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    ticketPrice: 10,
    pool: 45000,
    payoutInfo: "Top 3 winners split yield proportionally.",
    description: "Multi-winner raffle with Chainlink Price Feeds.",
    yieldProtocol: "Yearn Finance",
  },
];

interface RaffleState {
  raffles: Raffle[];
  finalizeRaffle: (id: string) => void;
  addToPool: (id: string, amount: number) => void;
}

// Zustand v5: persist generic must match state type exactly
type RafflePersist = Pick<RaffleState, "raffles">;

const persistOptions: PersistOptions<RaffleState, RafflePersist> = {
  name: "luckyyield-raffles",
  partialize: (state) => ({ raffles: state.raffles }),
  merge: (persisted, current) => ({
    ...current,
    raffles: persisted?.raffles?.length ? persisted.raffles : INITIAL_RAFFLES,
  }),
};

export const useRaffleStore = create<RaffleState>()(
  persist(
    (set) => ({
      raffles: INITIAL_RAFFLES,

      finalizeRaffle: (id) =>
        set((state) => ({
          raffles: state.raffles.map((r) =>
            r.id === id ? { ...r, status: "finalized" } : r
          ),
        })),

      addToPool: (id, amount) =>
        set((state) => ({
          raffles: state.raffles.map((r) =>
            r.id === id ? { ...r, pool: r.pool + amount } : r
          ),
        })),
    }),
    persistOptions
  )
);
