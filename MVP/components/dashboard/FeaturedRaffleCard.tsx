"use client";

import { Ticket, TrendingUp, Users, Loader2, CheckCircle2 } from "lucide-react";
import { Raffle } from "@/stores/raffleStore";
import { useUIStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/Button";
import { Countdown } from "@/components/ui/Countdown";
import { formatPool, formatUSDC } from "@/utils";

// --- WEB3 HOOKS ---
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { prizePoolAbi } from '@/utils/abis/prizePool'; 

interface FeaturedRaffleCardProps {
  raffle: Raffle;
}

export function FeaturedRaffleCard({ raffle }: FeaturedRaffleCardProps) {
  const { isConnected } = useAccount();

  const { 
    data: hash, 
    isPending: isSigning, 
    writeContract,
    error: writeError 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess 
  } = useWaitForTransactionReceipt({ hash });

 // Ubicación: components/dashboard/FeaturedRaffleCard.tsx

const handleAction = () => {
  // 1. Limpiamos el ID: si es "raffle-001", se convierte en "001"
  const numericId = raffle.id.replace(/\D/g, ""); 

  // 2. Ejecutamos la transacción
  writeContract({
    address: '0xTU_DIRECCION_DEL_CONTRATO', // Asegúrate de tener la dirección aquí
    abi: prizePoolAbi,
    functionName: 'enterRaffle',
    args: [BigInt(numericId)], // Ahora pasamos el número limpio como BigInt
    value: parseUnits(raffle.ticketPrice.toString(), 6), 
  });
};

  const isBusy = isSigning || isConfirming;

  return (
    <div
      className="relative rounded-2xl overflow-hidden border accent-glow"
      style={{
        borderColor: isSuccess ? "rgb(34, 197, 94)" : "rgba(0,229,255,.2)",
        background: "linear-gradient(135deg, var(--color-card) 0%, rgba(0,229,255,.03) 100%)",
      }}
    >
      <div className="relative p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider" style={{ color: "rgba(0,229,255,.7)" }}>
                Featured Raffle
              </span>
            </div>
            <h2 className="text-xl font-bold">{raffle.title}</h2>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatItem icon={<Ticket size={14} />} label="Entry" value={`${formatUSDC(raffle.ticketPrice)} USDC`} />
          <StatItem icon={<TrendingUp size={14} />} label="Pool" value={`${formatPool(raffle.pool)} USDC`} />
          <StatItem icon={<Users size={14} />} label="Protocol" value={raffle.yieldProtocol} />
        </div>

        {/* Countdown */}
        <div className="rounded-xl p-3 border" style={{ backgroundColor: "rgba(8,11,18,.4)" }}>
          <Countdown endsAt={raffle.endsAt} />
        </div>

        {/* Botón */}
        <Button 
          variant={isSuccess ? "outline" : "primary"} 
          className="w-full flex items-center justify-center gap-2" 
          onClick={handleAction}
          disabled={isBusy}
        >
          {isBusy && <Loader2 className="animate-spin" size={16} />}
          {isSuccess ? <CheckCircle2 size={16} /> : <Ticket size={16} />}
          {isSigning ? "Confirm in Wallet..." : isConfirming ? "Verifying..." : isSuccess ? "Success!" : "Buy Entries"}
        </Button>

        {/* Error Feedback */}
        {writeError && (
          <p className="text-[10px] text-red-400 text-center mt-2 font-mono">
            Error: {writeError.name === 'UserRejectedRequestError' ? 'Rejected' : 'Failed'}
          </p>
        )}
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl p-2.5 border bg-white/5">
      <div className="flex items-center gap-1 mb-1">{icon}</div>
      <p className="text-[10px] uppercase text-gray-400">{label}</p>
      <p className="text-sm font-semibold truncate">{value}</p>
    </div>
  );
}
