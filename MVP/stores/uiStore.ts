"use client";

import { create } from "zustand";

interface UIState {
  buyModalRaffleId: string | null;
  resultModalData: { raffleId: string; outcome: "won" | "lost" } | null;

  openBuyModal: (raffleId: string) => void;
  closeBuyModal: () => void;
  openResultModal: (raffleId: string, outcome: "won" | "lost") => void;
  closeResultModal: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  buyModalRaffleId: null,
  resultModalData: null,

  openBuyModal: (raffleId) => set({ buyModalRaffleId: raffleId }),
  closeBuyModal: () => set({ buyModalRaffleId: null }),
  openResultModal: (raffleId, outcome) =>
    set({ resultModalData: { raffleId, outcome } }),
  closeResultModal: () => set({ resultModalData: null }),
}));
