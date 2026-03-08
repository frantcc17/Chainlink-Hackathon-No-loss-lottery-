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
import erc20Abi from '@/utils/abis/erc20.json'; // Asegúrate de tener este archivo

interface FeaturedRaffleCardProps {
  raffle: Raffle;
}

export function FeaturedRaffleCard({ raffle }: FeaturedRaffleCardProps) {
  const { address, isConnected } = useAccount();

  // Hook para las transacciones
  const { 
    data: hash, 
    isPending: isSigning, 
    writeContractAsync, // Usamos la versión Async para encadenar Approve + Deposit
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
    // SUSTITUYE ESTAS DIRECCIONES POR LAS DE TU REMIX
    const VAULT_ADDRESS = '0xTU_DIRECCION_DEL_VAULT_AQUI'; 
    const USDC_ADDRESS = '0xTU_DIRECCION_DEL_USDC_AQUI'; 

    try {
      const assetsToDeposit = parseUnits(raffle.ticketPrice.toString(), 6);
      
      console.log("Paso 1: Solicitando aprobación (Approve) de USDC...");
      
      // 1. PRIMERO HACEMOS EL APPROVE
      // Esto permite que el Vault tome los USDC de tu billetera
      const approveTx = await writeContractAsync({
        address: USDC_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [VAULT_ADDRESS, assetsToDeposit],
      });

      console.log("Approve enviado, esperando confirmación...", approveTx);

      // 2. DESPUÉS HACEMOS EL DEPOSIT
      // Llamamos a la función pública 'deposit' de tu contrato ERC4626
      console.log("Paso 2: Iniciando depósito en el Vault...");
      await writeContractAsync({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: prizePoolAbi,
        functionName: 'deposit', 
        args: [
          assetsToDeposit, // monto
          address          // receptor de los shares (tú)
        ],
      });

      console.log("¡Proceso completado con éxito!");

    } catch (error: any) {
      console.error("Error detallado:", error);
      
      if (error.message?.includes("user rejected")) {
        alert("Transacción cancelada en Metamask.");
      } else {
        alert("Error: " + (error.shortMessage || "Consulta la consola para más detalles"));
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
          {isSigning ? "Sign in Wallet..." :
