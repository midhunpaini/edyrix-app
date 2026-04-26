import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { AxiosError } from "axios";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Lock,
  PenLine,
  PlayCircle,
} from "lucide-react";
import { useTest, useSubmitTest } from "../hooks/useTests";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";

const OPTION_LABELS = ["A", "B", "C", "D"];
const AUTO_ADVANCE_MS = 250;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function TestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: test, isLoading, error } = useTest(id);
  const submitMutation = useSubmitTest();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvanceLockedRef = useRef(false);

  const answeredCount = test?.questions.reduce(
    (count, question) => (answers[question.id] !== undefined ? count + 1 : count),
    0
  ) ?? 0;
  const totalQuestions = test?.questions.length ?? 0;
  const allQuestionsAnswered = totalQuestions > 0 && answeredCount === totalQuestions;
  const isTimeCritical = timeLeft !== null && timeLeft < 60;

  const currentQuestion = test?.questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isCurrentAnswered = currentAnswer !== undefined;
  const isLastQuestion = totalQuestions > 0 && currentQuestionIndex === totalQuestions - 1;

  const clearAutoAdvance = useCallback((updateState = true) => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    autoAdvanceLockedRef.current = false;
    if (updateState) {
      setIsAdvancing(false);
    }
  }, []);

  useEffect(() => () => clearAutoAdvance(false), [clearAutoAdvance]);

  useEffect(() => {
    setAnswers({});
    setTimeLeft(null);
    setStarted(false);
    setSubmitted(false);
    setCurrentQuestionIndex(0);
    startTimeRef.current = Date.now();
    clearAutoAdvance();
  }, [id, clearAutoAdvance]);

  useEffect(() => {
    if (test && started && timeLeft === null) {
      setTimeLeft(test.duration_minutes * 60);
      startTimeRef.current = Date.now();
    }
  }, [test, started, timeLeft]);

  const handleSubmit = useCallback(
    (force = false) => {
      if (!id || submitted || submitMutation.isPending || !started) return;
      if (!force && !allQuestionsAnswered) return;

      clearAutoAdvance();
      setSubmitted(true);
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);

      submitMutation.mutate(
        { testId: id, answers, time_taken_seconds: elapsed },
        {
          onSuccess: (result) => {
            navigate(`/app/tests/${id}/results`, {
              state: {
                result,
                testTitle: test?.title,
                lessonId: test?.lesson_id,
                chapterId: test?.chapter_id,
                chapterTitle: test?.chapter_title,
              },
            });
          },
          onError: () => {
            setSubmitted(false);
          },
        }
      );
    },
    [
      id,
      submitted,
      submitMutation,
      started,
      allQuestionsAnswered,
      clearAutoAdvance,
      answers,
      navigate,
      test,
    ]
  );

  useEffect(() => {
    if (!started || timeLeft === null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, submitted, started, handleSubmit]);

  function handleAnswerAndAdvance(questionId: string, optionIndex: number) {
    if (submitted || submitMutation.isPending || autoAdvanceLockedRef.current) return;

    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));

    if (isLastQuestion) return;

    clearAutoAdvance();
    autoAdvanceLockedRef.current = true;
    setIsAdvancing(true);
    autoAdvanceTimerRef.current = setTimeout(() => {
      setCurrentQuestionIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
      autoAdvanceTimerRef.current = null;
      autoAdvanceLockedRef.current = false;
      setIsAdvancing(false);
    }, AUTO_ADVANCE_MS);
  }

  function handleNext() {
    if (!isCurrentAnswered || isLastQuestion || isAdvancing) return;
    clearAutoAdvance();
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
  }

  function handlePrevious() {
    clearAutoAdvance();
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  }

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

  const axiosError = error as AxiosError<{
    detail?: {
      detail?: string;
      unlock_reason?: string;
      lesson_id?: string;
      lesson_title?: string;
      chapter_id?: string;
      chapter_title?: string;
    };
  }> | null;
  const lockDetail = axiosError?.response?.data?.detail;
  if (axiosError?.response?.status === 403 && lockDetail?.detail === "test_locked") {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-ink/5">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-bg">
            <ArrowLeft size={20} className="text-ink" />
          </button>
          <p className="font-body font-semibold text-ink text-sm">Test Locked</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mb-4">
            <Lock size={28} className="text-amber" />
          </div>
          <h1 className="font-display font-bold text-xl text-ink mb-2">Complete the lesson first</h1>
          <p className="font-body text-sm text-ink-3 max-w-[280px] mb-6">
            {lockDetail.lesson_title
              ? `Finish ${lockDetail.lesson_title} to unlock this test.`
              : "Finish the allocated lesson to unlock this test."}
          </p>
          <Button
            fullWidth
            className="max-w-[260px]"
            onClick={() =>
              lockDetail.lesson_id
                ? navigate(`/app/lessons/${lockDetail.lesson_id}`, {
                    state: {
                      chapterId: lockDetail.chapter_id,
                      chapterTitle: lockDetail.chapter_title,
                    },
                  })
                : navigate(-1)
            }
          >
            Go to Lesson
          </Button>
        </div>
      </div>
    );
  }

  if (!test) return null;

  if (!started) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-ink/5">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-bg">
            <ArrowLeft size={20} className="text-ink" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-body font-semibold text-ink text-sm truncate">{test.title}</p>
            <p className="text-xs text-ink-3 font-body truncate">{test.lesson_title}</p>
          </div>
        </div>

        <div className="px-4 py-5">
          <div className="bg-white rounded-2xl border border-ink/5 p-5 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber/10 flex items-center justify-center mb-4">
              <PenLine size={24} className="text-amber" />
            </div>
            <h1 className="font-display font-bold text-xl text-ink mb-1">{test.title}</h1>
            <p className="font-body text-sm text-ink-3 mb-4">
              {test.subject_name} - Chapter {test.chapter_number}: {test.lesson_title}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="bg-bg rounded-xl p-3 text-center">
                <p className="font-display font-bold text-ink">{test.duration_minutes}</p>
                <p className="font-body text-[11px] text-ink-3">Minutes</p>
              </div>
              <div className="bg-bg rounded-xl p-3 text-center">
                <p className="font-display font-bold text-ink">{test.questions.length}</p>
                <p className="font-body text-[11px] text-ink-3">Questions</p>
              </div>
              <div className="bg-bg rounded-xl p-3 text-center">
                <p className="font-display font-bold text-ink">{test.total_marks}</p>
                <p className="font-body text-[11px] text-ink-3">Marks</p>
              </div>
            </div>
            <Button fullWidth size="lg" onClick={() => setStarted(true)}>
              <PlayCircle size={17} className="mr-2" />
              Start Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
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
              Question {currentQuestionIndex + 1} of {totalQuestions} - {answeredCount}/{totalQuestions} answered
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
        <div className="mt-3 h-1.5 bg-ink/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal rounded-full transition-all duration-300"
            style={{
              width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      <div className="px-4 py-4" style={{ paddingBottom: 'calc(10rem + env(safe-area-inset-bottom))' }}>
        {currentQuestion && (
          <div key={currentQuestion.id} className="bg-white rounded-2xl p-4 border border-ink/5 shadow-sm">
            <div className="flex gap-2 mb-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal text-white text-xs font-display font-bold flex items-center justify-center">
                {currentQuestionIndex + 1}
              </span>
              <p className="font-body text-sm text-ink leading-snug">{currentQuestion.text}</p>
            </div>
            <div className="space-y-2">
              {currentQuestion.options.map((option, oi) => {
                const selected = currentAnswer === oi;
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={isAdvancing || submitted || submitMutation.isPending}
                    onClick={() => handleAnswerAndAdvance(currentQuestion.id, oi)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      selected
                        ? "border-teal bg-teal/10"
                        : "border-ink/10 bg-bg hover:border-teal/30"
                    } ${isAdvancing || submitted || submitMutation.isPending ? "cursor-not-allowed" : ""}`}
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
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink/5 z-10">
        <div
          className="max-w-[430px] mx-auto space-y-3 px-4 pt-4"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          {!isCurrentAnswered && (
            <p className="text-xs text-amber font-body text-center flex items-center justify-center gap-1">
              <AlertTriangle size={12} />
              Choose an answer to continue
            </p>
          )}
          {isAdvancing && (
            <p className="text-xs text-teal font-body text-center">Moving to next question...</p>
          )}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-[116px]"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || submitted || submitMutation.isPending}
            >
              Previous
            </Button>

            {!isLastQuestion ? (
              <Button
                type="button"
                fullWidth
                size="lg"
                onClick={handleNext}
                disabled={!isCurrentAnswered || isAdvancing || submitted || submitMutation.isPending}
              >
                Next
                <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : allQuestionsAnswered ? (
              <Button
                type="button"
                fullWidth
                size="lg"
                onClick={() => handleSubmit(false)}
                disabled={submitted || submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    Submit Test
                  </span>
                )}
              </Button>
            ) : (
              <Button type="button" fullWidth size="lg" disabled>
                Complete all questions
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
