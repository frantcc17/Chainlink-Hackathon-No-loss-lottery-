"use client";

// React 19: no explicit React import needed
import { useState, useEffect } from "react";
import { getTimeLeft, TimeLeft } from "@/utils";

interface CountdownProps {
  endsAt: string;
  compact?: boolean;
}

export function Countdown({ endsAt, compact }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(endsAt));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(endsAt)), 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (timeLeft.total <= 0) {
    return (
      <span style={{ fontFamily: "var(--font-mono)" }} className="text-[var(--color-muted)] text-sm">
        Ended
      </span>
    );
  }

  if (compact) {
    const parts: string[] = [];
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
    parts.push(`${String(timeLeft.hours).padStart(2, "0")}h`);
    parts.push(`${String(timeLeft.minutes).padStart(2, "0")}m`);
    if (timeLeft.days === 0) parts.push(`${String(timeLeft.seconds).padStart(2, "0")}s`);
    return (
      <span
        className="text-[var(--color-accent)] text-sm font-medium"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {parts.join(" ")}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <CountdownSegment value={timeLeft.days} label="days" />
      <Separator />
      <CountdownSegment value={timeLeft.hours} label="hrs" />
      <Separator />
      <CountdownSegment value={timeLeft.minutes} label="min" />
      <Separator />
      <CountdownSegment value={timeLeft.seconds} label="sec" />
    </div>
  );
}

function CountdownSegment({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="countdown-digit">{String(value).padStart(2, "0")}</div>
      <span
        className="text-[var(--color-muted)] text-[10px] uppercase tracking-wider"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span
      className="text-[var(--color-muted)] text-lg leading-none mb-3"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      :
    </span>
  );
}
