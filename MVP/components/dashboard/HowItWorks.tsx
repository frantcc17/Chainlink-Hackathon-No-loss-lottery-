import { ShoppingCart, TrendingUp, Trophy } from "lucide-react";

const steps = [
  {
    icon: ShoppingCart,
    label: "Step 1",
    title: "Buy Entries",
    desc: "Purchase raffle tickets with USDC (demo). Each ticket gives you one chance to win.",
  },
  {
    icon: TrendingUp,
    label: "Step 2",
    title: "Yield Generated",
    desc: "Pool funds invested via smart contract (simulated Aave/Compound). Chainlink oracles track yield.",
  },
  {
    icon: Trophy,
    label: "Step 3",
    title: "Win or Return",
    desc: "Chainlink VRF picks a fair winner who gets the yield. All principals returned — no-loss guarantee.",
  },
];

export function HowItWorks() {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 rounded-full" style={{ backgroundColor: "var(--color-accent)" }} />
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--color-text-bright)", fontFamily: "var(--font-display)" }}
        >
          How it works
        </h3>
        <span
          className="text-[10px] rounded-full px-2 py-0.5 ml-auto border"
          style={{
            color: "var(--color-muted)",
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Powered by Chainlink
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "rgba(0,229,255,.10)",
                  borderColor: "rgba(0,229,255,.20)",
                }}
              >
                <step.icon size={14} style={{ color: "var(--color-accent)" }} />
              </div>
              {i < steps.length - 1 && (
                <div
                  className="w-px flex-1 mt-1"
                  style={{ backgroundColor: "var(--color-border)", minHeight: "16px" }}
                />
              )}
            </div>
            <div className="pb-3">
              <p
                className="text-[10px] uppercase tracking-wider"
                style={{ color: "rgba(0,229,255,.6)", fontFamily: "var(--font-mono)" }}
              >
                {step.label}
              </p>
              <p
                className="text-sm font-semibold mb-0.5"
                style={{ color: "var(--color-text-bright)", fontFamily: "var(--font-display)" }}
              >
                {step.title}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
