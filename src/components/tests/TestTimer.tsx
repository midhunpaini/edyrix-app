import { Icon } from "../ui/Icon";
import { Icons } from "../../lib/icons";

interface TestTimerProps {
  timeLeft: number;
  mode?: "countdown" | "elapsed";
  className?: string;
}

export function formatTime(seconds: number): string {
  const abs = Math.max(0, seconds);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TestTimer({ timeLeft, mode = "countdown", className = "" }: TestTimerProps) {
  const isWarning = mode === "countdown" && timeLeft < 120 && timeLeft > 0;
  const isExpired = mode === "countdown" && timeLeft <= 0;

  const containerClass = isExpired || isWarning
    ? "bg-rose/10 text-rose animate-pulse"
    : mode === "elapsed"
    ? "bg-ink/8 text-ink-2"
    : "bg-amber/15 text-amber-dark";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-bold text-sm ${containerClass} ${className}`}
    >
      <Icon name={isExpired ? Icons.timerOff : Icons.timer} size={16} aria-hidden />
      {formatTime(timeLeft)}
    </div>
  );
}
