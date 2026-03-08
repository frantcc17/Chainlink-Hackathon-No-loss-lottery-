"use client";

import { Ticket, TrendingUp, Users, Loader2, CheckCircle2 } from "lucide-react";
import { Raffle } from "@/stores/raffleStore";
import { Button } from "@/components/ui/Button";
import { Countdown } from "@/components/ui/Countdown";
import { formatPool, formatUSDC } from "@/utils";

// --- WEB3 HOOKS ---
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { prizePoolAbi } from '@/utils/abis/prizePool'; 
import erc20Abi from '@/utils/abis/erc20.json'; 

interface FeaturedRaffleCardProps {
  raffle: Raffle;
}

export function FeaturedRaffleCard({ raffle }: FeaturedRaffleCardProps) {
  const { address, isConnected } = useAccount();

  const { 
    data: hash, 
    isPending: isSigning, 
    writeContractAsync, 
    error: writeError 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess 
  } = useWaitForTransactionReceipt({ hash });

  const handleAction = async () => {
    if (!isConnected || !address) {
      alert("Por favor, conecta tu wallet primero.");
      return;
    }

    // --- CONFIGURACIÓN DE DIRECCIONES ---
    const VAULT_ADDRESS = '0xTU_DIRECCION_DEL_VAULT_AQUI'; 
    const USDC_ADDRESS = '0xTU_DIRECCION_DEL_USDC_AQUI'; 

    try {
      const assetsToDeposit = parseUnits(raffle.ticketPrice.toString(), 6);
      
      console.log("Paso 1: Solicitando aprobación (Approve)...");
      await writeContractAsync({
        address: USDC_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [VAULT_ADDRESS, assetsToDeposit],
      });

      console.log("Paso 2: Iniciando depósito...");
      await writeContractAsync({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: prizePoolAbi,
        functionName: 'deposit', 
        args: [assetsToDeposit, address],
      });

    } catch (error: any) {
      console.error("Error detallado:", error);
      if (error.message?.includes("user rejected")) {
        alert("Transacción cancelada.");
      } else {
        alert("Error: " + (error.shortMessage || "Error en la blockchain"));
      }
    }
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
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider" style={{ color: "rgba(0,229,255,.7)" }}>
              Featured Raffle
            </span>
          </div>
          <h2 className="text-xl font-bold">{raffle.title}</h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatItem icon={<Ticket size={14} />} label="Entry" value={`${formatUSDC(raffle.ticketPrice)} USDC`} />
          <StatItem icon={<TrendingUp size={14} />} label="Pool" value={`${formatPool(raffle.pool)} USDC`} />
          <StatItem icon={<Users size={14} />} label="Protocol" value={raffle.yieldProtocol} />
        </div>

        <div className="rounded-xl p-3 border" style={{ backgroundColor: "rgba(8,11,18,.4)" }}>
          <Countdown endsAt={raffle.endsAt} />
        </div>

        <Button 
          variant={isSuccess ? "outline" : "primary"} 
          className="w-full flex items-center justify-center gap-2" 
          onClick={handleAction}
          disabled={isBusy}
        >
          {isBusy && <Loader2 className="animate-spin" size={16} />}
          {isSuccess ? <CheckCircle2 size={16} /> : <Ticket size={16} />}
          {isSigning ? "Sign in Wallet..." : isConfirming ? "Verifying..." : isSuccess ? "Success!" : "Buy Entries"}
        </Button>

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
