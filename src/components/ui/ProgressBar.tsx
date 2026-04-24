import { clsx } from "clsx";

interface ProgressBarProps {
  value: number;
  className?: string;
  color?: "teal" | "amber" | "forest";
  size?: "sm" | "md";
}

export function ProgressBar({ value, className, color = "teal", size = "sm" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={clsx("w-full bg-ink/10 rounded-full overflow-hidden", { "h-1.5": size === "sm", "h-2.5": size === "md" }, className)}>
      <div
        className={clsx("h-full rounded-full transition-all duration-500", {
          "bg-teal": color === "teal",
          "bg-amber": color === "amber",
          "bg-forest": color === "forest",
        })}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
