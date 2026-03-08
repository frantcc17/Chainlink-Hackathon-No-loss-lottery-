"use client";

import { Ticket, TrendingUp, Users, Loader2, Dices, Gift } from "lucide-react";
import { Raffle } from "@/stores/raffleStore";
import { Button } from "@/components/ui/Button";
import { formatUnits, parseUnits } from 'viem';

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

  const PRIZE_POOL_ADDRESS = '0x9A84568a5EAAEa0363527E9dBB5AeE7d8324df59' as `0x${string}`; 
  const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as `0x${string}`; 

  // --- LECTURAS ---
  const { data: currentPrizePool, refetch: refetchPool } = useReadContract({
    address: PRIZE_POOL_ADDRESS, abi: prizePoolAbi, functionName: 'currentPrizePool',
  });
  const { data: userWinnings, refetch: refetchWinnings } = useReadContract({
    address: PRIZE_POOL_ADDRESS, abi: prizePoolAbi, functionName: 'winnings', 
    args: address ? [address] : undefined,
  });
  const { data: lastWinner } = useReadContract({
    address: PRIZE_POOL_ADDRESS, abi: prizePoolAbi, functionName: 'lastWinner',
  });
  const { data: ownerAddress } = useReadContract({
    address: PRIZE_POOL_ADDRESS, abi: prizePoolAbi, functionName: 'owner',
  });
  const { data: isPlayerData } = useReadContract({
    address: PRIZE_POOL_ADDRESS, abi: prizePoolAbi, functionName: 'isPlayer',
    args: address ? [address] : undefined,
  });

  // --- ESCRITURA ---
  const { data: hash, isPending: isSigning, writeContractAsync } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ 
    hash, 
    onBlock: () => { refetchPool(); refetchWinnings(); } 
  });

  // 1. UNIRSE AL SORTEO (Approve USDC + addPlayer)
  const handleDeposit = async () => {
    if (!address) return;
    try {
      const amount = parseUnits(raffle.ticketPrice.toString(), 6);
      
      // Approve USDC
      await writeContractAsync({ 
        address: USDC_ADDRESS, 
        abi: erc20Abi, 
        functionName: 'approve', 
        args: [PRIZE_POOL_ADDRESS, amount] 
      });

      // Añadirse como jugador
      await writeContractAsync({ 
        address: PRIZE_POOL_ADDRESS, 
        abi: prizePoolAbi, 
        functionName: 'addPlayer', 
        args: [address] 
      });
    } catch (e) { console.error(e); }
  };

  // 2. RECLAMAR PREMIO
  const handleClaim = async () => {
    await writeContractAsync({ 
      address: PRIZE_POOL_ADDRESS, 
      abi: prizePoolAbi, 
      functionName: 'claimPrize',
      args: []
    });
  };

  // 3. LANZAR SORTEO (Admin)
  const handleRequestWinner = async () => {
    await writeContractAsync({ 
      address: PRIZE_POOL_ADDRESS, 
      abi: prizePoolAbi, 
      functionName: 'startDraw',
      args: []
    });
  };

  const isBusy = isSigning || isConfirming;
  const isOwner = address?.toLowerCase() === (ownerAddress as string)?.toLowerCase();
  const isAlreadyPlayer = isPlayerData as boolean;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 bg-slate-900/50 p-6 space-y-6 backdrop-blur-sm">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">Featured Raffle</span>
          <h2 className="text-2xl font-black text-white mt-1 italic uppercase tracking-tighter">Ondo Yield Sweep</h2>
        </div>
        {isConnected && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2 text-right">
            <p className="text-[9px] text-gray-400 uppercase">Status</p>
            <p className="text-sm font-mono font-bold text-cyan-400">
              {isAlreadyPlayer ? "✓ Entered" : "Not entered"}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatItem icon={<Ticket size={16} />} label="Ticket" value={`${raffle.ticketPrice} USDC`} />
        <StatItem 
          icon={<TrendingUp size={16} />} 
          label="Prize Pool" 
          value={currentPrizePool ? `${Number(formatUnits(currentPrizePool as bigint, 6)).toLocaleString()} USDC` : "0.00 USDC"} 
        />
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
        <Button 
          onClick={handleDeposit} 
          disabled={isBusy || isAlreadyPlayer} 
          className="w-full h-12 bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
        >
          {isBusy ? <Loader2 className="animate-spin" /> : <Ticket size={18} />}
          {isAlreadyPlayer ? "Already Entered" : "Buy Entries"}
        </Button>

        {isOwner && (
          <Button 
            onClick={handleRequestWinner} 
            variant="outline" 
            className="w-full border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 gap-2 border-dashed"
          >
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
