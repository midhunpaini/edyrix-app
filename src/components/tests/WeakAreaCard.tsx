import { Icon } from "../ui/Icon";
import { Icons } from "../../lib/icons";

interface WeakAreaCardProps {
  chapterTitle: string;
  accuracy: number;
  chapterId: string;
  onRevise: () => void;
}

export function WeakAreaCard({ chapterTitle, accuracy, onRevise }: WeakAreaCardProps) {
  return (
    <div className="bg-amber-pale border-l-4 border-amber rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon name={Icons.warning} size={16} className="text-amber-dark flex-shrink-0" aria-hidden />
        <p className="font-body font-bold text-xs text-amber-dark uppercase tracking-wide">
          Needs Revision
        </p>
      </div>
      <p className="font-body text-sm text-ink leading-snug">
        You got only{" "}
        <span className="font-semibold text-rose">{Math.round(accuracy)}%</span> in{" "}
        <span className="font-semibold">{chapterTitle}</span>.
      </p>
      <button
        onClick={onRevise}
        className="mt-2 inline-flex items-center gap-1 text-xs font-body font-semibold text-teal underline underline-offset-2 active:opacity-70"
      >
        Revise this chapter
        <Icon name={Icons.forward} size={16} aria-hidden />
      </button>
    </div>
  );
}
