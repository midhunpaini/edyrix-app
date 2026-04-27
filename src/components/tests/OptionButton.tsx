import { Icon } from "../ui/Icon";
import { Icons } from "../../lib/icons";

export type OptionState = "default" | "selected" | "correct" | "wrong" | "muted";

interface OptionButtonProps {
  label: string;
  text: string;
  state: OptionState;
  onClick?: () => void;
  disabled?: boolean;
}

const BUTTON_STYLES: Record<OptionState, string> = {
  default:  "bg-white border border-ink/15 text-ink active:bg-teal/5",
  selected: "bg-teal/8 border-2 border-teal text-ink",
  correct:  "bg-forest/10 border-2 border-forest text-ink",
  wrong:    "bg-rose/10 border-2 border-rose text-ink",
  muted:    "bg-ink/5 border border-ink/10 text-ink-3 opacity-60",
};

const LABEL_STYLES: Record<OptionState, string> = {
  default:  "bg-ink/8 text-ink-2",
  selected: "bg-teal text-white",
  correct:  "bg-forest text-white",
  wrong:    "bg-rose text-white",
  muted:    "bg-ink/15 text-ink-3",
};

export function OptionButton({ label, text, state, onClick, disabled }: OptionButtonProps) {
  const isInteractive = !disabled && state !== "muted" && state !== "correct" && state !== "wrong";

  return (
    <button
      onClick={onClick}
      disabled={disabled || state === "muted"}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${BUTTON_STYLES[state]} ${isInteractive ? "cursor-pointer" : "cursor-default"}`}
    >
      <span
        className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-display font-bold ${LABEL_STYLES[state]}`}
      >
        {label}
      </span>
      <span className="font-body text-sm leading-snug flex-1">{text}</span>
      {state === "correct" && (
        <Icon name={Icons.check} size={16} className="text-forest flex-shrink-0" aria-hidden />
      )}
      {state === "wrong" && (
        <Icon name={Icons.wrong} size={16} className="text-rose flex-shrink-0" aria-hidden />
      )}
    </button>
  );
}
