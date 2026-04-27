import { Icon } from "../ui/Icon";
import { Icons } from "../../lib/icons";

interface ExplanationCardProps {
  text: string;
  visible: boolean;
}

export function ExplanationCard({ text, visible }: ExplanationCardProps) {
  if (!visible || !text) return null;

  return (
    <div className="animate-slide-up mt-4 rounded-xl overflow-hidden border border-teal/20">
      <div className="bg-teal/8 px-4 py-2.5 border-b border-teal/15 flex items-center gap-1.5">
        <Icon name={Icons.explanation} size={16} className="text-teal" aria-hidden />
        <p className="text-[11px] font-body font-bold text-teal uppercase tracking-wider">
          Explanation
        </p>
      </div>
      <div className="bg-teal/5 px-4 py-3">
        <p className="font-body text-sm text-ink leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
