"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { useRaffleStore } from "@/stores/raffleStore";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FeaturedRaffleCard } from "@/components/dashboard/FeaturedRaffleCard";
import { RafflesList } from "@/components/dashboard/RafflesList";
import { MyRaffles } from "@/components/dashboard/MyRaffles";
import { HowItWorks } from "@/components/dashboard/HowItWorks";
import { BuyEntriesModal } from "@/components/modals/BuyEntriesModal";
import { ResultModal } from "@/components/modals/ResultModal";
import { DebugPanel } from "@/components/dashboard/DebugPanel";
import { isDebugMode } from "@/utils";

export default function DashboardPage() {
  const { email } = useUserStore();
  const { raffles } = useRaffleStore();
  const router = useRouter();

  // Auth guard
  useEffect(() => {
    if (!email) router.replace("/");
  }, [email, router]);

  if (!email) return null;

  const activeRaffles = raffles.filter((r) => r.status === "active");
  const featuredRaffle = activeRaffles[0]; // First active raffle is featured
  const allRaffles = [...raffles].sort((a, b) => {
    // Active first, then by end date
    if (a.status !== b.status) return a.status === "active" ? -1 : 1;
    return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime();
  });

  const debugMode = isDebugMode();

  return (
    <>
      <DashboardHeader />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Featured raffle */}
        {featuredRaffle && <FeaturedRaffleCard raffle={featuredRaffle} />}

        {/* All raffles list */}
        <RafflesList raffles={allRaffles} />

        {/* My Raffles */}
        <MyRaffles />

        {/* How It Works */}
        <HowItWorks />

        {/* Footer spacer */}
        <div className="h-4" />
      </main>

      {/* Modals */}
      <BuyEntriesModal />
      <ResultModal />

      {/* Debug panel — only visible with ?debug=1 or DEBUG_MODE=true */}
      {debugMode && (
        <DebugPanel activeRaffleId={featuredRaffle?.id} />
      )}
    </>
  );
}
