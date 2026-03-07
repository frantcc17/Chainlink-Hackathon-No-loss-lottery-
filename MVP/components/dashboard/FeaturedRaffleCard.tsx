"use client";

import { Ticket, TrendingUp, Users, Loader2, CheckCircle2 } from "lucide-react";
import { Raffle } from "@/stores/raffleStore";
import { useUIStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/Button";
import { Countdown } from "@/components/ui/Countdown";
import { formatPool, formatUSDC } from "@/utils";

// --- NUEVAS IMPORTACIONES WEB3 ---
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { prizePoolAbi } from '@/utils/abis/prizePool'; // Asegúrate de tener este archivo
// ---------------------------------

interface FeaturedRaffleCardProps {
  raffle: Raffle;
}

export function FeaturedRaffleCard({ raffle }: FeaturedRaffleCardProps) {
  const { openBuyModal } = useUIStore();
  const { isConnected } = useAccount();

  // 1. Hook para ejecutar la función del contrato
  const { 
    data: hash, 
    isPending: isSigning, 
    writeContract,
    error: writeError 
  } = useWriteContract();

  // 2. Hook para esperar la confirmación en la blockchain
  const { 
    isLoading: isConfirming, 
    isSuccess 
  } = useWaitForTransactionReceipt({ hash });

  const handleAction = () => {
    if (!isConnected) {
      // Si no está conectado, podrías disparar un modal de conexión
      alert("Please connect your wallet");
      return;
    }

    // Ejecución del contrato
    writeContract({
      address: '0xTU_CONTRATO_ADDRESS' as `0x${string}`, // Reemplazar por tu address real
      abi: prizePoolAbi,
      functionName: 'enterRaffle', // Nombre de la función en Solidity
      args: [BigInt(raffle.id)],
      // Asumiendo que el ticket se paga en USDC o el token nativo
      // Si es nativo usa value: parseEther(...)
      // Si es USDC, recuerda que usualmente son 6 decimales
      value: parseUnits(raffle.ticketPrice.toString(), 6), 
    });
  };

  // Estado visual del botón
  const isBusy = isSigning || isConfirming;

  return (
    <div
      className="relative rounded-2xl overflow-hidden border accent-glow"
      style={{
        borderColor: isSuccess ? "var(--color-success)" : "rgba(0,229,255,.2)",
        background: "linear-gradient(135deg, var(--color-card) 0%, rgba(0,229,255,.03) 100%)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: isSuccess ? "rgba(34,197,94,.1)" : "rgba(0,229,255,.05)", filter: "blur(48px)" }} />

      <div className="relative p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: "rgba(0,229,255,.7)", fontFamily: "var(--font-mono)" }}
              >
                Featured Raffle
              </span>
              <span
                className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 border"
                style={{
                  color: "var(--color-accent)",
                  backgroundColor: "rgba(0,229,255,.10)",
                  borderColor: "rgba(0,229,255,.15)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]"
                  style={{ animation: "var(--animate-pulse-slow)" }} />
                LIVE
              </span>
            </div>
            <h2 className="text-xl font-bold" style={{ color: "var(--color-text-bright)", fontFamily: "var(--font-display)" }}>
              {raffle.title}
            </h2>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatItem icon={<Ticket size={14} style={{ color: "var(--color-accent)" }} />}
            label="Entry" value={`${formatUSDC(raffle.ticketPrice)} USDC`} />
          <StatItem icon={<TrendingUp size={14} style={{ color: "var(--color-gold)" }} />}
            label="Pool" value={`${formatPool(raffle.pool)} USDC`} />
          <StatItem icon={<Users size={14} style={{ color: "var(--color-accent)" }} />}
            label="Protocol" value={raffle.yieldProtocol} />
        </div>

        {/* Countdown */}
        <div className="rounded-xl p-3 border" style={{ backgroundColor: "rgba(8,11,18,.4)", borderColor: "var(--color-border)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
            Ends in
          </p>
          <Countdown endsAt={raffle.endsAt} />
        </div>

        {/* Payout Info */}
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
          {isSuccess ? "🎉 You are officially in this raffle!" : raffle.payoutInfo}
        </p>

        {/* Botón con Lógica de Blockchain */}
        <Button 
          variant={isSuccess ? "outline" : "primary"} 
          size="lg" 
          className="w-full flex items-center justify-center gap-2" 
          onClick={handleAction}
          disabled={isBusy}
        >
          {isSigning && <Loader2 className="animate-spin" size={16} />}
          {isConfirming && <Loader2 className="animate-spin" size={16} />}
          {isSuccess ? <CheckCircle2 size={16} /> : <Ticket size={16} />}
          
          {isSigning ? "Sign in Wallet..." : 
           isConfirming ? "Verifying..." : 
           isSuccess ? "Purchased!" : "Buy Entries"}
        </Button>

        {/* Error Feedback */}
        {writeError && (
          <p className="text-[10px] text-red-400 text-center mt-2 font-mono">
            {writeError.name === 'UserRejectedRequestError'
