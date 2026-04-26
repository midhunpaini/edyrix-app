import { OptionButton } from "./OptionButton";
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

export function QuestionCard({
  question,
  questionNumber,
  studentAnswer,
  correctAnswer,
  isCorrect,
  explanation,
  status,
}: QuestionCardProps) {
  const headerColor =
    status === "correct" ? "text-forest" : status === "wrong" ? "text-rose" : "text-amber-dark";
  const headerLabel =
    status === "correct" ? "✓ Correct" : status === "wrong" ? "✗ Wrong" : "— Skipped";

  return (
    <div className="bg-white rounded-2xl border border-ink/8 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink/5 bg-ink/2">
        <span className="font-body text-xs font-semibold text-ink-3">Q{questionNumber}</span>
        <span className={`font-body text-xs font-bold ${headerColor}`}>{headerLabel}</span>
      </div>

      <div className="p-4">
        <p className="font-body text-sm text-ink leading-relaxed mb-4">{question.text}</p>
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            let optState: OptionState;
            if (i === correctAnswer && i === studentAnswer) {
              optState = "correct";
            } else if (i === correctAnswer) {
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
          <p className="text-[11px] font-body font-bold text-teal uppercase tracking-wide mb-1.5">
            💡 Explanation
          </p>
          <p className="font-body text-sm text-ink leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
}
