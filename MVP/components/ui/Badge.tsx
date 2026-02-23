import { cn } from "@/utils";

type BadgeVariant = "active" | "finalized" | "won" | "lost" | "pending";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

// Tailwind v4: arbitrary CSS variable values work inline
const variantStyles: Record<BadgeVariant, string> = {
  active:    "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20",
  finalized: "bg-[var(--color-muted)]/20 text-[var(--color-muted)] border border-[var(--color-muted)]/20",
  won:       "bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/20",
  lost:      "bg-red-500/10 text-red-400 border border-red-500/20",
  pending:   "bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-border)]",
};

const dots: Record<BadgeVariant, string> = {
  active:    "bg-[var(--color-accent)] animate-[var(--animate-pulse-slow)]",
  finalized: "bg-[var(--color-muted)]",
  won:       "bg-[var(--color-gold)]",
  lost:      "bg-red-400",
  pending:   "bg-[var(--color-muted)]",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dots[variant])} />
      {children}
    </span>
  );
}
