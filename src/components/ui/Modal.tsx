import { useEffect } from "react";
import { Icon } from "./Icon";
import { Icons } from "../../lib/icons";
import { clsx } from "clsx";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={clsx(
          "relative z-10 w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-ink">{title}</h3>
            <button
              onClick={onClose}
              className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full hover:bg-ink/5"
              aria-label="Close"
            >
              <Icon name={Icons.close} size={20} className="text-ink-3" aria-hidden />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
