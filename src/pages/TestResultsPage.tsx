import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useTest, useTestHistory } from "../hooks/useTests";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import type { TestResult } from "../types";

interface ResultState {
  result: TestResult;
  testTitle?: string;
}

function ScoreCircle({ percentage }: { percentage: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const passed = percentage >= 60;

  return (
    <div className="flex flex-col items-center py-6 bg-white border-b border-ink/5">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#E8ECF0" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={passed ? "#0D6E6E" : "#EF4444"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-display font-bold text-2xl ${
              passed ? "text-teal" : "text-red-500"
            }`}
          >
            {percentage}%
          </span>
        </div>
      </div>
      <p
        className={`font-display font-bold text-lg mt-3 ${
          passed ? "text-teal" : "text-red-500"
        }`}
      >
        {passed ? "Well done!" : "Keep practising"}
      </p>
    </div>
  );
}

export function TestResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResultState | null;
  const { data: test } = useTest(id);
  const { data: history, isLoading: historyLoading } = useTestHistory();

  // /app/tests (no id) — show test history list
  if (!id) {
    return (
      <div className="min-h-screen bg-bg pb-24">
        <div className="px-4 pt-12 pb-4 bg-white border-b border-ink/5">
          <h1 className="font-display font-bold text-xl text-ink">My Tests</h1>
          <p className="font-body text-xs text-ink-3 mt-0.5">All past attempts</p>
        </div>
        <div className="px-4 py-4 space-y-3">
          {historyLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))
          ) : !history?.length ? (
            <div className="text-center py-16">
              <p className="font-body text-ink-3 text-sm">No tests taken yet.</p>
              <p className="font-body text-ink-3 text-xs mt-1">
                Complete a chapter to unlock its test.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.attempt_id}
                className="bg-white rounded-2xl border border-ink/5 p-4 shadow-sm"
              >
                <p className="font-body font-semibold text-ink text-sm truncate">
                  {item.test_title}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`font-display font-bold text-sm ${
                      item.percentage >= 60 ? "text-teal" : "text-red-500"
                    }`}
                  >
                    {item.percentage}%
                  </span>
                  <span className="text-ink-3 font-body text-xs">
                    {item.score}/{item.total_marks} marks
                  </span>
                  <span className="text-ink-3 font-body text-xs ml-auto">
                    {new Date(item.completed_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // /app/tests/:id/results — show specific result
  const result = state?.result;
  const testTitle = state?.testTitle ?? test?.title ?? "Test";

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="font-body text-ink-3 mb-4">No result data found.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const percentage = Math.round(result.percentage);

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-ink/5">
        <button
          onClick={() => navigate("/app/subjects")}
          className="p-1.5 rounded-xl hover:bg-bg transition-colors"
        >
          <ArrowLeft size={20} className="text-ink" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-ink text-sm truncate">{testTitle}</p>
          <p className="text-xs text-ink-3 font-body">
            {result.score}/{result.total_marks} marks
          </p>
        </div>
      </div>

      <ScoreCircle percentage={percentage} />

      {/* Answer review */}
      <div className="px-4 py-4 space-y-4">
        <h2 className="font-display font-bold text-sm text-ink">Answer Review</h2>
        {result.results.map((item, index) => {
          const question = test?.questions.find((q) => q.id === item.question_id);
          return (
            <div
              key={item.question_id}
              className={`bg-white rounded-2xl p-4 border shadow-sm ${
                item.is_correct ? "border-teal/20" : "border-red-100"
              }`}
            >
              <div className="flex items-start gap-2 mb-3">
                {item.is_correct ? (
                  <CheckCircle size={16} className="text-teal flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <p className="font-body text-sm text-ink leading-snug">
                  <span className="font-semibold">{index + 1}. </span>
                  {question?.text ?? `Question ${index + 1}`}
                </p>
              </div>

              {question && (
                <div className="space-y-1.5 mb-3">
                  {question.options.map((option, oi) => {
                    const isYours = item.your_answer === oi;
                    const isCorrect = item.correct_answer === oi;
                    return (
                      <div
                        key={oi}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-body ${
                          isCorrect
                            ? "bg-teal/10 text-teal font-semibold"
                            : isYours && !isCorrect
                            ? "bg-red-50 text-red-600 font-semibold"
                            : "text-ink-3"
                        }`}
                      >
                        <span className="w-4 text-center font-display font-bold flex-shrink-0">
                          {["A", "B", "C", "D"][oi]}
                        </span>
                        <span className="flex-1">{option}</span>
                        {isCorrect && (
                          <span className="text-teal font-semibold">✓ Correct</span>
                        )}
                        {isYours && !isCorrect && (
                          <span className="text-red-500 font-semibold">✗ Yours</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {item.explanation && (
                <div className="bg-amber/10 rounded-xl p-3">
                  <p className="font-body text-xs text-ink leading-relaxed">
                    <span className="font-semibold text-amber">Explanation: </span>
                    {item.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-ink/5 z-10">
        <div className="max-w-[430px] mx-auto">
          <Button fullWidth onClick={() => navigate("/app/subjects")}>
            Back to Subjects
          </Button>
        </div>
      </div>
    </div>
  );
}
