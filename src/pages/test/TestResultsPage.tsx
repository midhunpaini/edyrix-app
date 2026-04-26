import { Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { ScoreCircle } from "../../components/tests/ScoreCircle";
import { WeakAreaCard } from "../../components/tests/WeakAreaCard";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
import { Icons } from "../../lib/icons";
import type { TestDetail, TestResult } from "../../types";

interface ResultsState {
  testData: TestDetail;
  result: TestResult;
  answers: Record<string, number>;
  skipped: string[];
  elapsedSeconds: number;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} sec`;
  return `${m} min ${s} sec`;
}

function getMessage(percentage: number, firstName: string): string {
  if (percentage >= 90) return `Outstanding, ${firstName}! Full marks in sight.`;
  if (percentage >= 70) return `Great work, ${firstName}! Almost there.`;
  if (percentage >= 40) return `Good effort, ${firstName}! Keep practising.`;
  return "Keep going, you'll get there!";
}

export function TestResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResultsState | null;
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0] ?? "Student";

  if (!state?.result) {
    return <Navigate to={`/app/tests/${id}`} replace />;
  }

  const { testData, result, answers, skipped, elapsedSeconds } = state;
  const correctCount = result.results.filter((r) => r.is_correct).length;
  const wrongCount = result.results.filter((r) => !r.is_correct && r.your_answer >= 0).length;
  const skippedCount = result.results.filter((r) => r.your_answer < 0).length;
  const avgPerQ = testData.questions.length > 0
    ? Math.round(elapsedSeconds / testData.questions.length)
    : 0;

  const showWeakArea = result.percentage < 70;

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal to-teal-dark px-4 pt-12 pb-16 relative">
        <button
          onClick={() => navigate("/app/tests")}
          className="absolute top-12 left-4 p-1.5 rounded-xl hover:bg-white/10"
        >
          <Icon name={Icons.back} size={20} className="text-white" aria-hidden />
        </button>
        <div className="flex flex-col items-center mt-4">
          <p className="text-[10px] font-body font-bold text-white/60 uppercase tracking-widest mb-4">
            Test Completed
          </p>
          <div className="bg-white rounded-full p-2 shadow-lg animate-pop">
            <ScoreCircle percentage={result.percentage} size="lg" />
          </div>
          <p className="font-display font-bold text-white text-center text-base mt-4 max-w-[260px] leading-snug">
            {getMessage(result.percentage, firstName)}
          </p>
        </div>
      </div>

      {/* Stat cards pulled over hero */}
      <div className="px-4 -mt-7 z-10 relative">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl p-3 text-center shadow border border-ink/5">
            <p className="font-display font-bold text-forest text-2xl">{correctCount}</p>
            <p className="font-body text-[11px] text-ink-3 mt-0.5">Correct</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow border border-ink/5">
            <p className="font-display font-bold text-rose text-2xl">{wrongCount}</p>
            <p className="font-body text-[11px] text-ink-3 mt-0.5">Wrong</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow border border-ink/5">
            <p className="font-display font-bold text-amber text-2xl">{skippedCount}</p>
            <p className="font-body text-[11px] text-ink-3 mt-0.5">Skipped</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 pb-6 space-y-4">
        {/* Time stats */}
        <div className="bg-white rounded-2xl border border-ink/5 px-4 py-3 flex items-center gap-4">
          <Icon name={Icons.clock} size={18} className="text-teal flex-shrink-0" aria-hidden />
          <div className="flex-1">
            <p className="font-body text-sm text-ink">
              Time taken: <span className="font-semibold">{formatDuration(elapsedSeconds)}</span>
            </p>
            <p className="font-body text-xs text-ink-3 mt-0.5">
              Avg per question: {formatDuration(avgPerQ)}
            </p>
          </div>
        </div>

        {/* Weak area */}
        {showWeakArea && (
          <WeakAreaCard
            chapterTitle={testData.chapter_title}
            accuracy={result.percentage}
            chapterId={testData.chapter_id}
            onRevise={() => navigate(`/app/chapters/${testData.chapter_id}`)}
          />
        )}

        {/* Score detail */}
        <div className="bg-white rounded-2xl border border-ink/5 px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm text-ink-3">Score</p>
            <p className="font-display font-bold text-ink text-lg">
              {result.score} / {result.total_marks}
            </p>
          </div>
          <div className="mt-2 h-2 bg-ink/8 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-teal transition-all duration-700"
              style={{ width: `${result.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sticky action buttons */}
      <div className="bg-white border-t border-ink/5">
        <div
          className="max-w-[430px] mx-auto px-4 pt-3 space-y-2"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <Button
            fullWidth
            size="lg"
            onClick={() =>
              navigate(`/app/tests/${id}/review`, {
                state: { testData, result, answers, skipped, elapsedSeconds },
              })
            }
          >
            Review Answers
            <Icon name={Icons.forward} size={16} className="ml-2" aria-hidden />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() =>
                navigate(`/app/tests/${id}`, {
                  state: { lastAttempt: { score: result.score, total_marks: result.total_marks, percentage: result.percentage, completed_at: new Date().toISOString() } },
                })
              }
            >
              <Icon name={Icons.replay} size={14} className="mr-1.5" aria-hidden />
              Retake
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate(`/app/chapters/${testData.chapter_id}`)}
            >
              Back to Chapter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
