"use client";

import { Ticket, TrendingUp, Users, Loader2, CheckCircle2, LogOut, Dices } from "lucide-react";
import { Raffle } from "@/stores/raffleStore";
import { Button } from "@/components/ui/Button";
import { Countdown } from "@/components/ui/Countdown";
import { formatUnits, parseUnits } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { prizePoolAbi } from '@/utils/abis/prizePool'; 
import erc20Abi from '@/utils/abis/erc20.json'; 

export function FeaturedRaffleCard({ raffle }: { raffle: Raffle }) {
  const { address, isConnected } = useAccount();
  const VAULT_ADDRESS = '0xd9145CCE52D386f254917e481eB44e9943F39138' as `0x${string}`;
  const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as `0x${string}`;

  // LECTURAS
  const { data: totalAssets, refetch: refetchPool } = useReadContract({
    address: VAULT_ADDRESS, abi: prizePoolAbi, functionName: 'totalAssets',
  });
  const { data: userBalance, refetch: refetchBalance } = useReadContract({
    address: VAULT_ADDRESS, abi: prizePoolAbi, functionName: 'balanceOf', args: address ? [address] : undefined,
  });

  // ESCRITURA
  const { data: hash, isPending: isSigning, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash, onBlock: () => { refetchPool(); refetchBalance(); } 
  });

  // 1. ACCIÓN: DEPOSITAR
  const handleDeposit = async () => {
    const amount = parseUnits(raffle.ticketPrice.toString(), 6);
    await writeContractAsync({ address: USDC_ADDRESS, abi: erc20Abi, functionName: 'approve', args: [VAULT_ADDRESS, amount] });
    await writeContractAsync({ address: VAULT_ADDRESS, abi: prizePoolAbi, functionName: 'deposit', args: [amount, address] });
  };

  // 2. ACCIÓN: RETIRAR TODO
  const handleWithdraw = async () => {
    await writeContractAsync({ address: VAULT_ADDRESS, abi: prizePoolAbi, functionName: 'withdrawAll' });
  };

  // 3. ACCIÓN: SORTEAR (Solo Owner)
  const handleDraw = async () => {
    await writeContractAsync({ address: VAULT_ADDRESS, abi: prizePoolAbi, functionName: 'drawWinner' });
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 bg-slate-900 p-5 space-y-4">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold text-white">{raffle.title}</h2>
        {isConnected && (
          <div className="text-right">
            <p className="text-[10px] text-gray-400">YOUR TICKETS</p>
            <p className="text-sm font-mono text-cyan-400">{userBalance ? formatUnits(userBalance as bigint, 6) : "0"} pUSDC</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatItem icon={<Ticket size={14} />} label="Entry" value={`${raffle.ticketPrice} USDC`} />
        <StatItem icon={<TrendingUp size={14} />} label="Real Pool" value={`${totalAssets ? formatUnits(totalAssets as bigint, 6) : "0"} USDC`} />
        <StatItem icon={<Users size={14} />} label="Protocol" value="Ondo Finance" />
      </div>

      <div className="flex gap-2">
        {/* BOTÓN PRINCIPAL COMPRAR */}
        <Button onClick={handleDeposit} disabled={isSigning || isConfirming} className="flex-1 gap-2">
          {(isSigning || isConfirming) ? <Loader2 className="animate-spin" size={16}/> : <Ticket size={16}/>}
          Buy Entries
        </Button>

        {/* BOTÓN RETIRAR (Solo si tiene balance) */}
        {Number(userBalance) > 0 && (
          <Button onClick={handleWithdraw} variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
            <LogOut size={16}/>
          </Button>
        )}

        {/* BOTÓN SORTEO (Admin) */}
        <Button onClick={handleDraw} variant="outline" className="border-yellow-500/50 text-yellow-400">
          <Dices size={16}/>
        </Button>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="rounded-xl p-2 border border-white/5 bg-white/5">
      <div className="text-cyan-400 mb-1">{icon}</div>
      <p className="text-[10px] text-gray-400 uppercase">{label}</p>
      <p className="text-xs font-bold text-white">{value}</p>
    </div>
  );
}
