import type { TestQuestion } from "../../types";

type BubbleState = "current" | "answered" | "skipped" | "unanswered" | "unanswered-warn";

interface QuestionPaletteProps {
  questions: TestQuestion[];
  answers: Record<string, number>;
  skipped: Set<string>;
  currentIndex: number;
  onJump: (index: number) => void;
  layout?: "row" | "grid";
  mode?: "live" | "review";
}

function getState(
  i: number,
  q: TestQuestion,
  answers: Record<string, number>,
  skipped: Set<string>,
  current: number,
  mode: "live" | "review",
): BubbleState {
  if (i === current) return "current";
  if (answers[q.id] !== undefined) return "answered";
  if (skipped.has(q.id)) return "skipped";
  return mode === "review" ? "unanswered-warn" : "unanswered";
}

const STYLES: Record<BubbleState, string> = {
  current:        "bg-amber text-white font-bold shadow-sm",
  answered:       "bg-teal text-white font-bold",
  skipped:        "bg-amber-pale border-2 border-amber text-amber font-semibold",
  unanswered:     "bg-white border border-ink/20 text-ink-3",
  "unanswered-warn": "bg-white border-2 border-rose text-rose font-semibold",
};

export function QuestionPalette({
  questions,
  answers,
  skipped,
  currentIndex,
  onJump,
  layout = "row",
  mode = "live",
}: QuestionPaletteProps) {
  const bubbles = questions.map((q, i) => {
    const state = getState(i, q, answers, skipped, currentIndex, mode);
    return (
      <button
        key={q.id}
        onClick={() => onJump(i)}
        className={`w-7 h-7 rounded-full text-[11px] flex-shrink-0 flex items-center justify-center transition-all active:scale-90 ${STYLES[state]}`}
      >
        {i + 1}
      </button>
    );
  });

  if (layout === "grid") {
    return (
      <div className="flex flex-wrap gap-2 py-1">
        {bubbles}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-1.5 px-4 py-2" style={{ minWidth: "max-content" }}>
        {bubbles}
      </div>
    </div>
  );
}
