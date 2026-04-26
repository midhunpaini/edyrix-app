import { useState } from "react";
import { Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import { QuestionCard } from "../../components/tests/QuestionCard";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
import { Icons } from "../../lib/icons";
import type { TestDetail, TestResult } from "../../types";

type FilterKey = "all" | "correct" | "wrong" | "skipped";

interface ReviewState {
  testData: TestDetail;
  result: TestResult;
  answers: Record<string, number>;
  skipped: string[];
  elapsedSeconds: number;
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "correct", label: "Correct" },
  { key: "wrong", label: "Wrong" },
  { key: "skipped", label: "Skipped" },
];

export function AnswerReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ReviewState | null;
  const [filter, setFilter] = useState<FilterKey>("all");

  if (!state?.result) {
    return <Navigate to={`/app/tests/${id}`} replace />;
  }

  const { testData, result, answers, skipped, elapsedSeconds } = state;
  const questions = testData.questions;
  const skippedSet = new Set(skipped);

  const enriched = questions.map((q, i) => {
    const res = result.results.find((r) => r.question_id === q.id);
    const studentAnswer = res?.your_answer ?? answers[q.id] ?? -1;
    const correctAnswer = res?.correct_answer ?? -1;
    const isCorrect = res?.is_correct ?? false;
    const explanation = res?.explanation ?? "";

    let status: "correct" | "wrong" | "skipped";
    if (studentAnswer < 0 || skippedSet.has(q.id)) status = "skipped";
    else if (isCorrect) status = "correct";
    else status = "wrong";

    return { q, i, studentAnswer, correctAnswer, isCorrect, explanation, status };
  });

  const filtered = enriched.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  const counts = {
    correct: enriched.filter((e) => e.status === "correct").length,
    wrong: enriched.filter((e) => e.status === "wrong").length,
    skipped: enriched.filter((e) => e.status === "skipped").length,
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Fixed header */}
      <div className="sticky top-0 z-10 bg-white border-b border-ink/5">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3">
          <button
            onClick={() =>
              navigate(`/app/tests/${id}/results`, {
                state: { testData, result, answers, skipped, elapsedSeconds },
                replace: true,
              })
            }
            className="p-1.5 rounded-xl hover:bg-bg"
          >
            <Icon name={Icons.back} size={20} className="text-ink" aria-hidden />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-body font-semibold text-ink text-sm truncate">Answer Review</p>
            <p className="font-body text-xs text-ink-3">{testData.title}</p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {FILTERS.map(({ key, label }) => {
            const count = key === "all" ? questions.length : counts[key as keyof typeof counts];
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex-shrink-0 px-3 h-7 rounded-full font-body font-semibold text-xs transition-colors ${
                  active
                    ? "bg-teal text-white"
                    : "bg-ink/8 text-ink-3"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Question list */}
      <div
        className="px-4 py-4 space-y-3"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-body text-sm text-ink-3">No {filter} questions.</p>
          </div>
        ) : (
          filtered.map(({ q, i, studentAnswer, correctAnswer, isCorrect, explanation, status }) => (
            <QuestionCard
              key={q.id}
              question={q}
              questionNumber={i + 1}
              studentAnswer={studentAnswer}
              correctAnswer={correctAnswer}
              isCorrect={isCorrect}
              explanation={explanation}
              status={status}
            />
          ))
        )}
      </div>

      {/* Sticky back button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink/5 z-10">
        <div
          className="max-w-[430px] mx-auto px-4 pt-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <Button
            variant="secondary"
            fullWidth
            onClick={() =>
              navigate(`/app/tests/${id}/results`, {
                state: { testData, result, answers, skipped, elapsedSeconds },
                replace: true,
              })
            }
          >
            <Icon name={Icons.back} size={16} className="mr-1" aria-hidden />
            Back to Results
          </Button>
        </div>
      </div>
    </div>
  );
}
