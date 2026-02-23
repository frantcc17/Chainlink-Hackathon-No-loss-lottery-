// React 19: no need to import React explicitly for JSX
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

// Tailwind v4: custom colors are auto-available via CSS variables
// e.g. bg-[var(--color-accent)] or using the @theme tokens directly
export function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 select-none cursor-pointer";

  const variants: Record<string, string> = {
    primary:
      "bg-[var(--color-accent)] text-[var(--color-void)] hover:bg-[var(--color-accent-dim)]",
    ghost:
      "border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]",
    danger:
      "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
    gold:
      "bg-[var(--color-gold)] text-[var(--color-void)] hover:bg-[var(--color-gold-dim)]",
  };

  const sizes: Record<string, string> = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-5 py-3 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2",
  };

  return (
    <button
      style={{ fontFamily: "var(--font-display)" }}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-1 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
