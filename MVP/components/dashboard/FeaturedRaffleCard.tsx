"use client";

import { Ticket, TrendingUp, Users, Loader2, CheckCircle2, LogOut, Dices, Gift } from "lucide-react";
import { Raffle } from "@/stores/raffleStore";
import { Button } from "@/components/ui/Button";
import { Countdown } from "@/components/ui/Countdown";
import { formatUnits, parseUnits } from 'viem';

// --- WEB3 HOOKS ---
import { 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useAccount, 
  useReadContract 
} from 'wagmi';
import { prizePoolAbi } from '@/utils/abis/prizePool'; 
import erc20Abi from '@/utils/abis/erc20.json'; 

export function FeaturedRaffleCard({ raffle }: { raffle: Raffle }) {
  const { address, isConnected } = useAccount();

  // --- CONFIGURACIÓN DE DIRECCIONES ---
  const VAULT_ADDRESS = '0xd9145CCE52D386f254917e481eB44e9943F39138' as `0x${string}`; 
  const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as `0x${string}`; 

  // --- LECTURAS (READS) ---
  const { data: totalAssets, refetch: refetchPool } = useReadContract({
    address: VAULT_ADDRESS, abi: prizePoolAbi, functionName: 'totalAssets',
  });
  const { data: userBalance, refetch: refetchBalance } = useReadContract({
    address: VAULT_ADDRESS, abi: prizePoolAbi, functionName: 'balanceOf', args: address ? [address] : undefined,
  });
  const { data: userWinnings, refetch: refetchWinnings } = useReadContract({
    address: VAULT_ADDRESS, abi: prizePoolAbi, functionName: 'winnings', args: address ? [address] : undefined,
  });
  const { data: lastWinner } = useReadContract({
    address: VAULT_ADDRESS, abi: prizePoolAbi, functionName: 'lastWinner',
  });
  const { data: ownerAddress } = useReadContract({
    address: VAULT_ADDRESS, abi: prizePoolAbi, functionName: 'owner',
  });

  // --- ESCRITURA (WRITES) ---
  const { data: hash, isPending: isSigning, writeContractAsync, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash, 
    onBlock: () => { refetchPool(); refetchBalance(); refetchWinnings(); } 
  });

  // 1. COMPRAR ENTRADAS (Deposit)
  const handleDeposit = async () => {
    if (!address) return;
    try {
      const amount = parseUnits(raffle.ticketPrice.toString(), 6);
      
      // Primero Approve
      await writeContractAsync({ 
        address: USDC_ADDRESS, 
        abi: erc20Abi, 
        functionName: 'approve', 
        args: [VAULT_ADDRESS, amount] 
      });

      // Luego Deposit
      await writeContractAsync({ 
        address: VAULT_ADDRESS, 
        abi: prizePoolAbi, 
        functionName: 'deposit', 
        args: [amount, address] 
      });
    } catch (e) { console.error(e); }
  };

  // 2. RETIRAR CAPITAL (Redeem)
  const handleWithdraw = async () => {
    if (!userBalance || !address) return;
    await writeContractAsync({ 
      address: VAULT_ADDRESS, 
      abi: prizePoolAbi, 
      functionName: 'redeem', 
      args: [userBalance, address, address] 
    });
  };

  // 3. RECLAMAR PREMIO (Claim) ✅ CORREGIDO: args: []
  const handleClaim = async () => {
    await writeContractAsync({ 
      address: VAULT_ADDRESS, 
      abi: prizePoolAbi, 
      functionName: 'claimPrize',
      args: []
    });
  };

  // 4. LANZAR SORTEO (Admin) ✅ CORREGIDO: args: []
  const handleRequestWinner = async () => {
    await writeContractAsync({ 
      address: VAULT_ADDRESS, 
      abi: prizePoolAbi, 
      functionName: 'requestRandomWinner',
      args: []
    });
  };

  const isBusy = isSigning || isConfirming;
  const isOwner = address?.toLowerCase() === (ownerAddress as string)?.toLowerCase();

  return (
    <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 bg-slate-900/50 p-6 space-y-6 backdrop-blur-sm">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">Featured Raffle</span>
          <h2 className="text-2xl font-black text-white mt-1 italic uppercase tracking-tighter">Ondo Yield Sweep</h2>
        </div>
        {isConnected && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2 text-right">
            <p className="text-[9px] text-gray-400 uppercase">My Tickets</p>
            <p className="text-sm font-mono font-bold text-cyan-400">
              {userBalance ? Number(formatUnits(userBalance as bigint, 6)).toFixed(2) : "0.00"}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatItem icon={<Ticket size={16} />} label="Ticket" value={`${raffle.ticketPrice} USDC`} />
        <StatItem icon={<TrendingUp size={16} />} label="Total Pool" value={totalAssets ? `${Number(formatUnits(totalAssets as bigint, 6)).toLocaleString()} USDC` : "0.00"} />
        <StatItem icon={<Users size={16} />} label="Protocol" value="Ondo Finance" />
      </div>

      {userWinnings && BigInt(userWinnings as string) > 0n && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <Gift className="text-green-400" />
            <div>
              <p className="text-xs text-green-200">¡Has Ganado!</p>
              <p className="text-sm font-bold text-white">{formatUnits(userWinnings as bigint, 6)} USDC</p>
            </div>
          </div>
          <Button onClick={handleClaim} size="sm" className="bg-green-500 hover:bg-green-600 text-white border-none h-8">Claim</Button>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex gap-2">
          <Button onClick={handleDeposit} disabled={isBusy} className="flex-1 h-12 bg-cyan-500 hover:bg-cyan-400 text-black font-bold">
            {isBusy ? <Loader2 className="animate-spin" /> : <Ticket size={18} />}
            Buy Entries
          </Button>

          {userBalance && BigInt(userBalance as string) > 0n && (
            <Button onClick={handleWithdraw} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-12" title="Withdraw Capital">
              <LogOut size={18} />
            </Button>
          )}
        </div>

        {isOwner && (
          <Button onClick={handleRequestWinner} variant="outline" className="w-full border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 gap-2 border-dashed">
            <Dices size={16} />
            Request Chainlink Winner
          </Button>
        )}
      </div>

      {lastWinner && lastWinner !== '0x0000000000000000000000000000000000000000' && (
        <p className="text-[10px] text-center text-gray-500 font-mono italic">
          Last Winner: <span className="text-gray-300">{(lastWinner as string).slice(0, 6)}...{(lastWinner as string).slice(-4)}</span>
        </p>
      )}
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="rounded-xl p-3 border border-white/5 bg-white/5 flex flex-col items-center text-center">
      <div className="text-cyan-400 mb-1 opacity-80">{icon}</div>
      <p className="text-[9px] text-gray-500 uppercase tracking-tighter">{label}</p>
      <p className="text-[13px] font-bold text-white truncate w-full">{value}</p>
    </div>
  );
}
