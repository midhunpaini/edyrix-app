import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "teal" | "amber" | "rose" | "forest" | "gray";
  className?: string;
}

export function Badge({ children, variant = "teal", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-body",
        {
          "bg-teal/10 text-teal-dark": variant === "teal",
          "bg-amber-pale text-amber-dark": variant === "amber",
          "bg-rose/10 text-rose": variant === "rose",
          "bg-forest/10 text-forest": variant === "forest",
          "bg-ink/10 text-ink-2": variant === "gray",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
