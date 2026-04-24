import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  fullWidth,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-xl font-body font-semibold transition-all active:scale-95",
        {
          "bg-teal text-white hover:bg-teal-dark disabled:opacity-50": variant === "primary",
          "bg-white border border-teal text-teal hover:bg-teal/5": variant === "secondary",
          "bg-transparent text-ink hover:bg-ink/5": variant === "ghost",
          "bg-rose text-white hover:opacity-90": variant === "danger",
          "h-8 px-3 text-sm": size === "sm",
          "h-11 px-5 text-sm": size === "md",
          "h-13 px-6 text-base": size === "lg",
          "w-full": fullWidth,
          "opacity-60 cursor-not-allowed": disabled || loading,
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
}
