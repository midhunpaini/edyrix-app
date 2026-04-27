import { OptionButton } from "./OptionButton";
import { Icon } from "../ui/Icon";
import { Icons } from "../../lib/icons";
import type { TestQuestion } from "../../types";
import type { OptionState } from "./OptionButton";

const LABELS = ["A", "B", "C", "D"];

interface QuestionCardProps {
  question: TestQuestion;
  questionNumber: number;
  studentAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
  status: "correct" | "wrong" | "skipped";
}

const STATUS_CONFIG = {
  correct: { icon: Icons.check,   color: "text-forest", label: "Correct" },
  wrong:   { icon: Icons.wrong,   color: "text-rose",   label: "Wrong" },
  skipped: { icon: Icons.skipped, color: "text-amber-dark", label: "Skipped" },
} as const;

export function QuestionCard({
  question,
  questionNumber,
  studentAnswer,
  correctAnswer,
  isCorrect,
  explanation,
  status,
}: QuestionCardProps) {
  const { icon, color, label } = STATUS_CONFIG[status];

  return (
    <div className="bg-white rounded-2xl border border-ink/8 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink/5 bg-ink/2">
        <span className="font-body text-xs font-semibold text-ink-3">Q{questionNumber}</span>
        <span className={`flex items-center gap-1 font-body text-xs font-bold ${color}`}>
          <Icon name={icon} size={16} aria-hidden />
          {label}
        </span>
      </div>

      <div className="p-4">
        <p className="font-body text-sm text-ink leading-relaxed mb-4">{question.text}</p>
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            let optState: OptionState;
            if (i === correctAnswer) {
              optState = "correct";
            } else if (i === studentAnswer && !isCorrect) {
              optState = "wrong";
            } else {
              optState = "muted";
            }

            return (
              <OptionButton
                key={i}
                label={LABELS[i]}
                text={opt}
                state={optState}
                disabled
              />
            );
          })}
        </div>
      </div>

      {explanation && (
        <div className="bg-teal/5 border-t border-teal/10 px-4 py-3">
          <p className="text-[11px] font-body font-bold text-teal uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Icon name={Icons.explanation} size={16} aria-hidden />
            Explanation
          </p>
          <p className="font-body text-sm text-ink leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
}
