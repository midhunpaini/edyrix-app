import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: "none" | "sm" | "md";
}

export function Card({ children, className, onClick, padding = "md" }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-white rounded-2xl shadow-sm border border-ink/5",
        { "p-0": padding === "none", "p-3": padding === "sm", "p-4": padding === "md" },
        onClick && "cursor-pointer active:scale-[0.98] transition-transform",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
