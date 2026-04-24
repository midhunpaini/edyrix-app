import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import { useTest, useSubmitTest } from "../hooks/useTests";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";

const OPTION_LABELS = ["A", "B", "C", "D"];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function TestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: test, isLoading } = useTest(id);
  const submitMutation = useSubmitTest();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (test && timeLeft === null) {
      setTimeLeft(test.duration_minutes * 60);
      startTimeRef.current = Date.now();
    }
  }, [test, timeLeft]);

  const handleSubmit = useCallback(() => {
    if (!id || submitted) return;
    setSubmitted(true);
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    submitMutation.mutate(
      { testId: id, answers, time_taken_seconds: elapsed },
      {
        onSuccess: (result) => {
          navigate(`/app/tests/${id}/results`, {
            state: { result, testTitle: test?.title },
          });
        },
        onError: () => {
          setSubmitted(false);
        },
      }
    );
  }, [id, submitted, answers, submitMutation, navigate, test]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, submitted, handleSubmit]);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = test?.questions.length ?? 0;
  const isTimeCritical = timeLeft !== null && timeLeft < 60;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 pt-14">
        <Skeleton className="h-10 w-full rounded-2xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!test) return null;

  return (
    <div className="min-h-screen bg-bg">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-ink/5 px-4 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-xl hover:bg-bg transition-colors"
          >
            <ArrowLeft size={20} className="text-ink" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-ink text-sm truncate">{test.title}</p>
            <p className="text-xs text-ink-3 font-body">
              {answeredCount}/{totalQuestions} answered
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-bold text-sm ${
              isTimeCritical ? "bg-red-50 text-red-600" : "bg-teal/10 text-teal"
            }`}
          >
            <Clock size={14} />
            {timeLeft !== null ? formatTime(timeLeft) : `${test.duration_minutes}:00`}
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-ink/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal rounded-full transition-all duration-300"
            style={{
              width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="px-4 py-4 space-y-4 pb-36">
        {test.questions.map((question, qi) => (
          <div
            key={question.id}
            className="bg-white rounded-2xl p-4 border border-ink/5 shadow-sm"
          >
            <div className="flex gap-2 mb-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal text-white text-xs font-display font-bold flex items-center justify-center">
                {qi + 1}
              </span>
              <p className="font-body text-sm text-ink leading-snug">{question.text}</p>
            </div>
            <div className="space-y-2">
              {question.options.map((option, oi) => {
                const selected = answers[question.id] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [question.id]: oi }))
                    }
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      selected
                        ? "border-teal bg-teal/10"
                        : "border-ink/10 bg-bg hover:border-teal/30"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-display font-bold ${
                        selected
                          ? "border-teal bg-teal text-white"
                          : "border-ink/20 text-ink-3"
                      }`}
                    >
                      {OPTION_LABELS[oi]}
                    </span>
                    <span className="font-body text-sm text-ink">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Fixed bottom submit */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-ink/5 z-10">
        <div className="max-w-[430px] mx-auto">
          {answeredCount < totalQuestions && (
            <p className="text-xs text-amber font-body text-center mb-2 flex items-center justify-center gap-1">
              <AlertTriangle size={12} />
              {totalQuestions - answeredCount} question
              {totalQuestions - answeredCount > 1 ? "s" : ""} unanswered
            </p>
          )}
          <Button
            fullWidth
            size="lg"
            onClick={handleSubmit}
            disabled={submitted || submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Submitting…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle size={16} />
                Submit Test
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
