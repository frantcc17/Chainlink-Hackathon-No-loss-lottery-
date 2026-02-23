// ==========================================
// Countdown / Date utilities
// ==========================================

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number; // ms remaining
}

export function getTimeLeft(endsAt: string): TimeLeft {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, total: diff };
}

export function formatCountdown(endsAt: string): string {
  const t = getTimeLeft(endsAt);
  if (t.total <= 0) return "Ended";
  const parts = [];
  if (t.days > 0) parts.push(`${t.days}d`);
  if (t.hours > 0 || t.days > 0) parts.push(`${pad(t.hours)}h`);
  parts.push(`${pad(t.minutes)}m`);
  parts.push(`${pad(t.seconds)}s`);
  return parts.join(" ");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ==========================================
// Number formatting
// ==========================================

export function formatUSDC(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPool(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return String(amount);
}

// ==========================================
// Debug mode
// ==========================================

export const DEBUG_MODE = false; // Set to true to always show debug panel

export function isDebugMode(): boolean {
  if (DEBUG_MODE) return true;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debug") === "1";
}

// ==========================================
// Class name utility
// ==========================================

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
