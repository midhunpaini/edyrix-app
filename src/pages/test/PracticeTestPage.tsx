import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useChapterTest, useTest, useSubmitTest } from "../../hooks/useTests";
import { TestTimer, formatTime } from "../../components/tests/TestTimer";
import { OptionButton } from "../../components/tests/OptionButton";
import { ExplanationCard } from "../../components/tests/ExplanationCard";
import { ScoreCircle } from "../../components/tests/ScoreCircle";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import type { OptionState } from "../../components/tests/OptionButton";
import type { TestResult } from "../../types";

const LABELS = ["A", "B", "C", "D"];

export function PracticeTestPage() {
  const { id: chapterId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: summary, isLoading: summaryLoading, error: summaryError } = useChapterTest(chapterId);
  const { data: test, isLoading: testLoading } = useTest(summary?.id);
  const submitMutation = useSubmitTest();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!hasStarted) return;
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted]);

  const questions = test?.questions ?? [];
  const currentQ = questions[currentIndex];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;
  const isAnswered = currentAnswer !== undefined;
  const isLast = currentIndex === questions.length - 1;

  const resultForCurrent = result?.results.find((r) => r.question_id === currentQ?.id);
  const showFeedback = result !== null;

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (result || !currentQ) return;
      setAnswers((prev) => ({ ...prev, [currentQ.id]: optionIndex }));
    },
    [currentQ, result],
  );

  function handleNext() {
    if (!isAnswered || isLast) return;
    setCurrentIndex((i) => i + 1);
  }

  function handleFinish() {
    if (!test || submitMutation.isPending) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);

    submitMutation.mutate(
      { testId: test.id, answers, time_taken_seconds: elapsed },
      {
        onSuccess: (res) => setResult(res),
        onError: () => toast.error("Could not save results. Please try again."),
      },
    );
  }

  function handleRetry() {
    setAnswers({});
    setCurrentIndex(0);
    setElapsed(0);
    setResult(null);
    setHasStarted(false);
    startTimeRef.current = Date.now();
  }

  const isLoading = summaryLoading || testLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg p-4 pt-14 space-y-4">
        <Skeleton className="h-10 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (summaryError || !summary?.id) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center">
        <p className="font-body text-ink-3 text-sm mb-4">No practice test found for this chapter.</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  if (!test) return null;

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-ink/5">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-bg">
            <ArrowLeft size={20} className="text-ink" />
          </button>
          <p className="font-body font-semibold text-ink text-sm">Practice Mode</p>
        </div>
        <div className="px-4 py-6">
          <div className="bg-white rounded-2xl border border-ink/5 p-5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-teal/10 flex items-center justify-center mb-4">
              <span className="text-2xl">✏️</span>
            </div>
            <h1 className="font-display font-bold text-xl text-ink mb-1">{test.title}</h1>
            <p className="font-body text-sm text-ink-3 mb-4">{test.chapter_title}</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              <div className="bg-bg rounded-xl p-3 text-center">
                <p className="font-display font-bold text-ink text-lg">{questions.length}</p>
                <p className="font-body text-[11px] text-ink-3">Questions</p>
              </div>
              <div className="bg-bg rounded-xl p-3 text-center">
                <p className="font-display font-bold text-ink text-lg">Untimed</p>
                <p className="font-body text-[11px] text-ink-3">Practice</p>
              </div>
            </div>
            <Button fullWidth size="lg" onClick={() => { setHasStarted(true); startTimeRef.current = Date.now(); }}>
              Start Practice
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    const correctCount = result.results.filter((r) => r.is_correct).length;
    const msg =
      result.percentage >= 90
        ? "Outstanding work! 🎉"
        : result.percentage >= 70
        ? "Great effort! Keep it up 💪"
        : result.percentage >= 40
        ? "Good try! Review the explanations."
        : "Keep practising, you'll get there!";

    return (
      <div className="min-h-screen bg-bg">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-ink/5">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-bg">
            <ArrowLeft size={20} className="text-ink" />
          </button>
          <p className="font-body font-semibold text-ink text-sm">Practice Complete</p>
        </div>

        <div className="px-4 py-6 space-y-4">
          <div className="bg-white rounded-2xl border border-ink/5 p-6 flex flex-col items-center shadow-sm animate-pop">
            <ScoreCircle percentage={result.percentage} size="lg" />
            <p className="font-display font-bold text-ink text-lg mt-4">{msg}</p>
            <div className="flex gap-4 mt-4">
              <div className="text-center">
                <p className="font-display font-bold text-forest text-xl">{correctCount}</p>
                <p className="font-body text-[11px] text-ink-3">Correct</p>
              </div>
              <div className="text-center">
                <p className="font-display font-bold text-rose text-xl">{questions.length - correctCount}</p>
                <p className="font-body text-[11px] text-ink-3">Wrong</p>
              </div>
              <div className="text-center">
                <p className="font-display font-bold text-ink-2 text-xl">{formatTime(elapsed)}</p>
                <p className="font-body text-[11px] text-ink-3">Time</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {questions.map((q, i) => {
              const r = result.results.find((x) => x.question_id === q.id);
              if (!r) return null;
              const status = r.your_answer < 0 ? "skipped" : r.is_correct ? "correct" : "wrong";
              return (
                <div key={q.id} className="bg-white rounded-2xl border border-ink/8 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink/5 bg-ink/2">
                    <span className="font-body text-xs font-semibold text-ink-3">Q{i + 1}</span>
                    <span className={`font-body text-xs font-bold ${status === "correct" ? "text-forest" : status === "wrong" ? "text-rose" : "text-amber-dark"}`}>
                      {status === "correct" ? "✓ Correct" : status === "wrong" ? "✗ Wrong" : "— Skipped"}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="font-body text-sm text-ink leading-relaxed mb-3">{q.text}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        let optState: OptionState;
                        if (oi === r.correct_answer && oi === r.your_answer) optState = "correct";
                        else if (oi === r.correct_answer) optState = "correct";
                        else if (oi === r.your_answer && !r.is_correct) optState = "wrong";
                        else optState = "muted";
                        return <OptionButton key={oi} label={LABELS[oi]} text={opt} state={optState} disabled />;
                      })}
                    </div>
                    {r.explanation && (
                      <ExplanationCard text={r.explanation} visible />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="flex gap-3 pb-6"
            style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
          >
            <Button variant="secondary" fullWidth onClick={handleRetry}>
              <RotateCcw size={15} className="mr-2" />
              Retry
            </Button>
            <Button fullWidth onClick={() => navigate(-1)}>Back to Chapter</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="sticky top-0 z-10 bg-white border-b border-ink/5">
        <div className="flex items-center justify-between px-4 pt-12 pb-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-bg">
            <ArrowLeft size={20} className="text-ink" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-body text-xs text-ink-3">
              {Object.keys(answers).length}/{questions.length} answered
            </span>
            <TestTimer timeLeft={elapsed} mode="elapsed" />
          </div>
        </div>
      </div>

      <div
        className="px-4 py-4"
        style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}
      >
        {currentQ && (
          <div className="bg-white rounded-2xl border border-ink/5 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-teal text-white text-xs font-display font-bold flex items-center justify-center flex-shrink-0">
                {currentIndex + 1}
              </span>
              <span className="font-body text-xs text-ink-3">
                of {questions.length}
              </span>
            </div>
            <p className="font-body text-sm text-ink leading-relaxed mb-4">{currentQ.text}</p>
            <div className="space-y-2">
              {currentQ.options.map((opt, i) => {
                let optState: OptionState = "default";
                if (isAnswered && resultForCurrent) {
                  if (i === resultForCurrent.correct_answer && i === currentAnswer) optState = "correct";
                  else if (i === resultForCurrent.correct_answer) optState = "correct";
                  else if (i === currentAnswer && !resultForCurrent.is_correct) optState = "wrong";
                  else optState = "muted";
                } else if (isAnswered) {
                  optState = i === currentAnswer ? "selected" : "muted";
                }

                return (
                  <OptionButton
                    key={i}
                    label={LABELS[i]}
                    text={opt}
                    state={optState}
                    onClick={() => handleAnswer(i)}
                    disabled={isAnswered}
                  />
                );
              })}
            </div>

            {isAnswered && !showFeedback && (
              <div className="animate-slide-up mt-4 bg-ink/5 rounded-xl p-3 text-center">
                <p className="font-body text-xs text-ink-3">
                  Results will show after you finish all questions
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink/5 z-10">
        <div
          className="max-w-[430px] mx-auto px-4 pt-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          {isLast && isAnswered ? (
            <Button
              fullWidth
              size="lg"
              loading={submitMutation.isPending}
              onClick={handleFinish}
            >
              Finish & See Results
            </Button>
          ) : (
            <Button
              fullWidth
              size="lg"
              disabled={!isAnswered}
              onClick={handleNext}
            >
              Next Question
              <ChevronRight size={16} className="ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
