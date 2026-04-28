import type { ReactNode } from "react";
import { Icon } from "../ui/Icon";
import { Icons } from "../../lib/icons";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backLabel?: string;
  onBack: () => void;
  rightElement?: ReactNode;
  leadingElement?: ReactNode;
  variant?: "teal" | "plain";
  children?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  backLabel,
  onBack,
  rightElement,
  leadingElement,
  variant = "teal",
  children,
}: PageHeaderProps) {
  if (variant === "plain") {
    return (
      <header
        className="bg-white border-b border-ink/8 px-5 py-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 8px)" }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="touch rounded-xl text-ink hover:bg-bg"
            aria-label={backLabel ? `Back to ${backLabel}` : "Go back"}
          >
            <Icon name={Icons.back} size={20} aria-hidden />
          </button>

          <div className="flex-1 min-w-0">
            {subtitle && (
              <p className="text-[11px] leading-4 font-body text-ink-3 truncate">{subtitle}</p>
            )}
            <h1 className="text-sm leading-5 font-body font-semibold text-ink truncate">{title}</h1>
          </div>

          <div className="touch justify-end">{rightElement ?? null}</div>
        </div>
        {children}
      </header>
    );
  }

  return (
    <header
      className="pt-12 px-5 pb-5"
      style={{ background: "linear-gradient(160deg, #094F4F 0%, #0D6E6E 100%)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="touch rounded-xl text-white/80 hover:text-white hover:bg-white/10"
            aria-label={backLabel ? `Back to ${backLabel}` : "Go back"}
          >
            <Icon name={Icons.back} size={20} aria-hidden />
          </button>
          {backLabel ? <span className="text-xs text-white/60 font-body">{backLabel}</span> : null}
        </div>
        <div className="touch justify-end text-white/80">{rightElement ?? null}</div>
      </div>

      <div className="flex items-center gap-3">
        {leadingElement ? <div className="flex-shrink-0">{leadingElement}</div> : null}
        <div className="min-w-0">
          <h1 className="font-display font-bold text-2xl text-white leading-tight">{title}</h1>
          {subtitle ? <p className="text-xs text-white/70 font-body mt-1">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </header>
  );
}
