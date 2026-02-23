"use client";

/**
 * Zustand v5 notes:
 * - `create` is now always curried: create<State>()((set, get) => ...)
 * - `persist` middleware API is unchanged but race condition in concurrent
 *   rehydrate was fixed in 5.0.11.
 * - No more deprecated `setState` on the store object directly — use
 *   `useUserStore.setState(...)` only from outside React.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EntryStatus = "active" | "finalized";
export type EntryOutcome = "won" | "lost" | "pending";

export interface UserEntry {
  raffleId: string;
  ticketsBought: number;
  status: EntryStatus;
  outcome: EntryOutcome;
  purchasedAt: string; // ISO date
}

interface UserState {
  email: string | null;
  balance: number;
  entries: UserEntry[];

  // Actions
  login: (email: string) => void;
  logout: () => void;
  deductBalance: (amount: number) => void;
  addEntry: (entry: Omit<UserEntry, "purchasedAt">) => void;
  finalizeEntry: (raffleId: string, outcome: "won" | "lost") => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      email: null,
      balance: 100, // 100 USDC demo on first login
      entries: [],

      login: (email) => set({ email }),

      logout: () => set({ email: null }),

      deductBalance: (amount) =>
        set((state) => ({ balance: Math.max(0, state.balance - amount) })),

      addEntry: (entry) =>
        set((state) => {
          // If already bought into this raffle, increment tickets
          const existing = state.entries.find((e) => e.raffleId === entry.raffleId);
          if (existing) {
            return {
              entries: state.entries.map((e) =>
                e.raffleId === entry.raffleId
                  ? { ...e, ticketsBought: e.ticketsBought + entry.ticketsBought }
                  : e
              ),
            };
          }
          return {
            entries: [
              ...state.entries,
              { ...entry, purchasedAt: new Date().toISOString() },
            ],
          };
        }),

      finalizeEntry: (raffleId, outcome) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.raffleId === raffleId
              ? { ...e, status: "finalized", outcome }
              : e
          ),
        })),
    }),
    {
      name: "luckyyield-user", // localStorage key
    }
  )
);
