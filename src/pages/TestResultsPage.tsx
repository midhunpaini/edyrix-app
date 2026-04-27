import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAvailableTests, useTest, useTestHistory } from "../hooks/useTests";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { Icon } from "../components/ui/Icon";
import { Icons } from "../lib/icons";
import type { AvailableTest, TestResult } from "../types";
import { useUIStore } from "../store/uiStore";

const OPTION_LABELS = ["A", "B", "C", "D"];

interface ResultState {
  result: TestResult;
  testTitle?: string;
  lessonId?: string;
  chapterId?: string;
  chapterTitle?: string;
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
      <p className="font-body text-xs text-ink-3 mt-1">Review your answers and explanations below</p>
    </div>
  );
}

export function TestResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResultState | null;
  const [tab, setTab] = useState<"available" | "history">("available");
  const { data: test, isLoading: testLoading } = useTest(id);
  const { data: history, isLoading: historyLoading } = useTestHistory();
  const { data: availableTests, isLoading: availableLoading } = useAvailableTests();
  const openPricing = useUIStore((s) => s.openPricing);

  function handleAvailableTestClick(item: AvailableTest) {
    if (item.is_unlocked) {
      navigate(`/app/tests/${item.id}`);
      return;
    }

    if (item.unlock_reason === "subscription_required") {
      toast.info("Subscribe to unlock this lesson test");
      openPricing(item.subject_id);
      return;
    }

    toast.info("Complete the lesson to unlock its test");
    navigate(`/app/lessons/${item.lesson_id}`, {
      state: { chapterId: item.chapter_id, chapterTitle: item.chapter_title },
    });
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-bg pb-24">
        <div className="px-4 pt-12 pb-4 bg-white border-b border-ink/5">
          <h1 className="font-display font-bold text-xl text-ink">Tests</h1>
          <p className="font-body text-xs text-ink-3 mt-0.5">Practice after each lesson</p>
          <div className="flex gap-1 bg-ink/5 rounded-xl p-1 mt-4">
            {(["available", "history"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`flex-1 h-9 rounded-lg font-body text-xs font-semibold transition-colors ${
                  tab === value ? "bg-white text-teal shadow-sm" : "text-ink-3"
                }`}
              >
                {value === "available" ? "Available" : "History"}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 py-4 space-y-3">
          {tab === "available" ? (
            availableLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))
            ) : !availableTests?.length ? (
              <div className="text-center py-16">
                <Icon name={Icons.quiz} size={34} className="mx-auto text-ink/20 mb-3 block" aria-hidden />
                <p className="font-body text-ink-3 text-sm">No tests available yet.</p>
                <p className="font-body text-ink-3 text-xs mt-1">
                  Open a subject and complete a lesson to unlock tests.
                </p>
              </div>
            ) : (
              availableTests.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAvailableTestClick(item)}
                  className="w-full bg-white rounded-2xl border border-ink/5 p-4 text-left shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        item.is_unlocked ? "bg-amber/10 text-amber" : "bg-ink/5 text-ink-3"
                      }`}
                    >
                      {item.is_unlocked ? (
                        <Icon name={Icons.quiz} size={18} aria-hidden />
                      ) : (
                        <Icon name={Icons.lock} size={16} aria-hidden />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-ink text-sm truncate">
                        {item.title}
                      </p>
                      <p className="font-body text-xs text-ink-3 mt-0.5 truncate">
                        {item.subject_name} - Ch {item.chapter_number}: {item.lesson_title}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-[11px] text-ink-3 font-body">
                          <Icon name={Icons.timer} size={11} aria-hidden />
                          {item.duration_minutes} min
                        </span>
                        <span className="text-[11px] text-ink-3 font-body">
                          {item.question_count} questions
                        </span>
                        {item.last_attempt && (
                          <span className="text-[11px] text-teal font-body font-semibold">
                            Last {Math.round(item.last_attempt.percentage)}%
                          </span>
                        )}
                      </div>
                      {!item.is_unlocked && (
                        <p className="font-body text-[11px] text-amber mt-2">
                          {item.unlock_reason === "subscription_required"
                            ? "Subscribe to access this lesson test"
                            : "Complete this lesson to unlock"}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )
          ) : historyLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))
          ) : !history?.length ? (
            <div className="text-center py-16">
              <p className="font-body text-ink-3 text-sm">No tests taken yet.</p>
              <p className="font-body text-ink-3 text-xs mt-1">
                Complete a lesson to unlock its test.
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

  const result = state?.result;
  const testTitle = state?.testTitle ?? test?.title ?? "Test";
  const lessonId = state?.lessonId ?? test?.lesson_id;
  const chapterId = state?.chapterId ?? test?.chapter_id;
  const chapterTitle = state?.chapterTitle ?? test?.chapter_title;

  function goBackToLesson() {
    if (lessonId) {
      navigate(`/app/lessons/${lessonId}`, {
        state: { chapterId, chapterTitle },
      });
      return;
    }
    navigate("/app/subjects");
  }

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
    <div className="min-h-screen bg-bg pb-28">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-ink/5">
        <button
          type="button"
          onClick={() => navigate("/app/tests")}
          className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl hover:bg-bg transition-colors"
          aria-label="Back to tests"
        >
          <Icon name={Icons.back} size={20} className="text-ink" aria-hidden />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-ink text-sm truncate">{testTitle}</p>
          <p className="text-xs text-ink-3 font-body">
            {result.score}/{result.total_marks} marks
          </p>
        </div>
      </div>

      <ScoreCircle percentage={percentage} />

      <div className="px-4 py-4 space-y-4">
        <h2 className="font-display font-bold text-sm text-ink">Answer Review</h2>
        {testLoading ? (
          Array.from({ length: result.results.length || 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-2xl" />
          ))
        ) : (
          result.results.map((item, index) => {
            const question = test?.questions.find((q) => q.id === item.question_id);
            const wasAnswered = item.your_answer >= 0;
            return (
              <div
                key={item.question_id}
                className={`bg-white rounded-2xl p-4 border shadow-sm ${
                  item.is_correct ? "border-teal/20" : "border-red-100"
                }`}
              >
                <div className="flex items-start gap-2 mb-3">
                  {item.is_correct ? (
                    <Icon name={Icons.check} size={16} className="text-teal flex-shrink-0 mt-0.5" aria-hidden />
                  ) : wasAnswered ? (
                    <Icon name={Icons.wrong} size={16} className="text-red-500 flex-shrink-0 mt-0.5" aria-hidden />
                  ) : (
                    <Icon name={Icons.warning} size={16} className="text-amber flex-shrink-0 mt-0.5" aria-hidden />
                  )}
                  <p className="font-body text-sm text-ink leading-snug">
                    <span className="font-semibold">{index + 1}. </span>
                    {question?.text ?? `Question ${index + 1}`}
                  </p>
                </div>

                {!wasAnswered && (
                  <div className="mb-3 rounded-xl bg-amber/10 px-3 py-2">
                    <p className="font-body text-xs text-amber font-semibold">Unanswered</p>
                  </div>
                )}

                {question && (
                  <div className="space-y-1.5 mb-3">
                    {question.options.map((option, oi) => {
                      const isYours = wasAnswered && item.your_answer === oi;
                      const isCorrect = item.correct_answer === oi;
                      return (
                        <div
                          key={oi}
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs font-body ${
                            isCorrect
                              ? "bg-teal/10 text-teal font-semibold"
                              : isYours
                                ? "bg-red-50 text-red-600 font-semibold"
                                : "text-ink-3"
                          }`}
                        >
                          <span className="w-4 text-center font-display font-bold flex-shrink-0">
                            {OPTION_LABELS[oi]}
                          </span>
                          <span className="flex-1">{option}</span>
                          {isCorrect && <span className="text-teal font-semibold">Correct</span>}
                          {isYours && !isCorrect && (
                            <span className="text-red-500 font-semibold">Your answer</span>
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
          })
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-ink/5 z-10">
        <div className="max-w-[430px] mx-auto flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => navigate(`/app/tests/${id}`)}
          >
            <Icon name={Icons.refresh} size={16} className="mr-2" aria-hidden />
            Retry Test
          </Button>
          <Button type="button" className="flex-1" onClick={goBackToLesson}>
            <Icon name={Icons.book} size={16} className="mr-2" aria-hidden />
            {lessonId ? "Back to Lesson" : "Back to Subjects"}
          </Button>
        </div>
      </div>
    </div>
  );
}
