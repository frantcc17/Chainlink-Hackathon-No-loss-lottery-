"use client";

import { Ticket, TrendingUp, Users, Loader2, CheckCircle2, Wallet } from "lucide-react";
import { Raffle } from "@/stores/raffleStore";
import { Button } from "@/components/ui/Button";
import { Countdown } from "@/components/ui/Countdown";
import { formatPool, formatUSDC } from "@/utils";

// --- WEB3 HOOKS ---
import { 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useAccount, 
  useReadContract 
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { prizePoolAbi } from '@/utils/abis/prizePool'; 
import erc20Abi from '@/utils/abis/erc20.json'; 

interface FeaturedRaffleCardProps {
  raffle: Raffle;
}

export function FeaturedRaffleCard({ raffle }: FeaturedRaffleCardProps) {
  const { address, isConnected } = useAccount();

  // --- CONFIGURACIÓN DE DIRECCIONES ---
  const VAULT_ADDRESS = '0xd9145CCE52D386f254917e481eB44e9943F39138' as `0x${string}`; 
  const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as `0x${string}`; 

  // --- LECTURA DE DATOS REALES (BLOCKCHAIN) ---
  
  // 1. Leer el total de activos en el Vault (El Pool Real)
  const { data: totalAssets, refetch: refetchPool } = useReadContract({
    address: VAULT_ADDRESS,
    abi: prizePoolAbi,
    functionName: 'totalAssets',
  });

  // 2. Leer el balance de tickets del usuario
  const { data: userBalance, refetch: refetchBalance } = useReadContract({
    address: VAULT_ADDRESS,
    abi: prizePoolAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // --- ESCRITURA (TRANSACCIONES) ---
  const { 
    data: hash, 
    isPending: isSigning, 
    writeContractAsync, 
    error: writeError 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess 
  } = useWaitForTransactionReceipt({ 
    hash,
    // Actualizamos los datos de la pantalla automáticamente cuando la transacción tiene éxito
    onBlock: () => {
      refetchPool();
      refetchBalance();
    }
  });

  const handleAction = async () => {
    if (!isConnected || !address) {
      alert("Por favor, conecta tu wallet primero.");
      return;
    }

    try {
      const assetsToDeposit = parseUnits(raffle.ticketPrice.toString(), 6);
      
      console.log("Paso 1: Solicitando aprobación (Approve)...");
      await writeContractAsync({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'approve',
        args: [VAULT_ADDRESS, assetsToDeposit],
      });

      console.log("Paso 2: Iniciando depósito...");
      await writeContractAsync({
        address: VAULT_ADDRESS,
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

  // Formateamos el pool real (asumiendo 6 decimales de USDC)
  const realPoolDisplay = totalAssets 
    ? (Number(formatUnits(totalAssets as bigint, 6))).toLocaleString() 
    : "0.00";

  // Formateamos las entradas del usuario
  const realUserEntries = userBalance 
    ? formatUnits(userBalance as bigint, 6) 
    : "0";

  return (
    <div
      className="relative rounded-2xl overflow-hidden border accent-glow"
      style={{
        borderColor: isSuccess ? "rgb(34, 197, 94)" : "rgba(0,229,255,.2)",
        background: "linear-gradient(135deg, var(--color-card) 0%, rgba(0,229,255,.03) 100%)",
      }}
    >
      <div className="relative p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider" style={{ color: "rgba(0,229,255,.7)" }}>
                Featured Raffle
              </span>
            </div>
            <h2 className="text-xl font-bold">{raffle.title}</h2>
          </div>
          {/* Badge de Entradas Reales del Usuario */}
          {isConnected && (
            <div className="text-right">
              <p className="text-[10px] uppercase text-gray-500">Your Entries</p>
              <p className="text-sm font-mono text-cyan-400">{realUserEntries} pUSDC</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatItem icon={<Ticket size={14} />} label="Entry" value={`${formatUSDC(raffle.ticketPrice)} USDC`} />
          
          {/* POZO REAL DESDE EL CONTRATO */}
          <StatItem 
            icon={<TrendingUp size={14} />} 
            label="Real Pool" 
            value={`${realPoolDisplay} USDC`} 
          />
          
          {/* PROTOCOLO REAL */}
          <StatItem icon={<Users size={14} />} label="Protocol" value="Ondo Finance" />
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
