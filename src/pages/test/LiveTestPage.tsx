import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Send, SkipForward } from "lucide-react";
import { TestTimer } from "../../components/tests/TestTimer";
import { QuestionPalette } from "../../components/tests/QuestionPalette";
import { OptionButton } from "../../components/tests/OptionButton";
import type { TestDetail } from "../../types";
import type { OptionState } from "../../components/tests/OptionButton";

const LABELS = ["A", "B", "C", "D"];

interface LiveTestState {
  testData: TestDetail;
  restoredAnswers?: Record<string, number>;
  restoredSkipped?: string[];
  restoredIndex?: number;
  restoredTimeLeft?: number;
}

export function LiveTestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LiveTestState | null;

  const testData = state?.testData;

  const [answers, setAnswers] = useState<Record<string, number>>(state?.restoredAnswers ?? {});
  const [skipped, setSkipped] = useState<Set<string>>(new Set(state?.restoredSkipped ?? []));
  const [currentIndex, setCurrentIndex] = useState(state?.restoredIndex ?? 0);
  const [timeLeft, setTimeLeft] = useState(
    state?.restoredTimeLeft ?? (testData ? testData.duration_minutes * 60 : 0),
  );
  const submittingRef = useRef(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const handleNavigateToSubmit = useCallback(
    (isAuto = false) => {
      if (submittingRef.current || !testData) return;
      submittingRef.current = true;
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      navigate(`/app/tests/${id}/submit`, {
        state: {
          testData,
          answers,
          skipped: [...skipped],
          elapsedSeconds: elapsed,
          timeLeft,
          isAutoSubmit: isAuto,
        },
      });
    },
    [testData, id, navigate, answers, skipped, timeLeft],
  );

  useEffect(() => {
    if (!testData || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleNavigateToSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testData, handleNavigateToSubmit]);

  if (!testData) {
    return <Navigate to={`/app/tests/${id}`} replace />;
  }

  const questions = testData.questions;
  const currentQ = questions[currentIndex];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;
  const isAnswered = currentAnswer !== undefined;
  const isLast = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  function handleSelectOption(optionIndex: number) {
    if (!currentQ) return;
    setSkipped((prev) => {
      const next = new Set(prev);
      next.delete(currentQ.id);
      return next;
    });
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionIndex }));
  }

  function handleSkip() {
    if (!currentQ) return;
    setSkipped((prev) => new Set([...prev, currentQ.id]));
    if (!isLast) setCurrentIndex((i) => i + 1);
  }

  function handleNext() {
    if (!isLast) setCurrentIndex((i) => i + 1);
  }

  function handlePrev() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  function handleJump(index: number) {
    setCurrentIndex(index);
  }

  const optionState = (i: number): OptionState => {
    if (i === currentAnswer) return "selected";
    return "default";
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white border-b border-ink/5">
        {/* Row 1: timer + progress + submit */}
        <div className="flex items-center justify-between gap-2 px-4 pt-12 pb-2">
          <TestTimer timeLeft={timeLeft} mode="countdown" />
          <span className="font-body text-xs text-ink-3 flex-1 text-center">
            Q {currentIndex + 1} of {questions.length} · {answeredCount} answered
          </span>
          <button
            onClick={() => handleNavigateToSubmit(false)}
            className="flex items-center gap-1 bg-rose/10 text-rose px-3 py-1.5 rounded-xl font-body font-semibold text-xs active:bg-rose/20 transition-colors"
          >
            <Send size={12} />
            Submit
          </button>
        </div>

        {/* Row 2: question palette */}
        <QuestionPalette
          questions={questions}
          answers={answers}
          skipped={skipped}
          currentIndex={currentIndex}
          onJump={handleJump}
          layout="row"
          mode="live"
        />
      </div>

      {/* Question body */}
      <div
        className="px-4 py-4"
        style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom))" }}
      >
        {currentQ && (
          <div className="bg-white rounded-2xl border border-ink/5 p-4 shadow-sm">
            <div className="flex items-start gap-2 mb-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal text-white text-xs font-display font-bold flex items-center justify-center mt-0.5">
                {currentIndex + 1}
              </span>
              <div>
                <p className="font-body text-xs text-ink-3 mb-0.5">
                  {testData.subject_name} · {testData.chapter_title}
                </p>
                <p className="font-body text-sm text-ink leading-relaxed font-medium">
                  {currentQ.text}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {currentQ.options.map((opt, i) => (
                <OptionButton
                  key={i}
                  label={LABELS[i]}
                  text={opt}
                  state={optionState(i)}
                  onClick={() => handleSelectOption(i)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink/5 z-10">
        <div
          className="max-w-[430px] mx-auto px-4 pt-3 flex items-center gap-2"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-4 h-11 rounded-xl font-body font-semibold text-sm text-ink-3 bg-bg disabled:opacity-40 active:bg-ink/10 transition-colors flex-shrink-0"
          >
            <ChevronLeft size={16} />
            Prev
          </button>

          <button
            onClick={handleSkip}
            className="flex items-center gap-1 px-4 h-11 rounded-xl font-body font-semibold text-sm text-amber border border-amber/30 bg-amber-pale active:bg-amber/20 transition-colors flex-shrink-0"
          >
            <SkipForward size={14} />
            Skip
          </button>

          {isLast ? (
            <button
              onClick={() => handleNavigateToSubmit(false)}
              className="flex-1 h-11 rounded-xl bg-teal text-white font-body font-semibold text-sm flex items-center justify-center gap-2 active:bg-teal-dark transition-colors"
            >
              Review & Submit
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className="flex-1 h-11 rounded-xl bg-teal text-white font-body font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:bg-teal-dark transition-colors"
            >
              Save & Next
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
