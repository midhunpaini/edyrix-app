import { Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../../store/authStore";
import { ScoreCircle } from "../../components/tests/ScoreCircle";
import { WeakAreaCard } from "../../components/tests/WeakAreaCard";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
import { Icons } from "../../lib/icons";
import { useRecordShare } from "../../hooks/useShare";
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
  const recordShare = useRecordShare();

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

        {/* WhatsApp share */}
        <button
          type="button"
          onClick={() => {
            const pct = Math.round(result.percentage);
            const text = `I scored ${pct}% on '${testData.title}' on Edyrix! (${result.score}/${result.total_marks} marks) 🎯\nStudy smarter for your SSLC — try Edyrix!`;
            const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(url, "_blank", "noopener,noreferrer");
            recordShare.mutate(
              { event_type: "test_share", reference_id: result.attempt_id, platform: "whatsapp" },
              { onError: () => {} },
            );
            toast.success("Opening WhatsApp…");
          }}
          className="w-full flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform"
        >
          <span className="text-[#25D366] text-xl leading-none">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </span>
          <div className="flex-1 text-left">
            <p className="font-body font-semibold text-sm text-ink">Share your score</p>
            <p className="font-body text-xs text-ink-3">Tell your friends on WhatsApp</p>
          </div>
          <Icon name={Icons.forward} size={16} className="text-ink-3" aria-hidden />
        </button>

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
              style={{ width: `${Math.min(100, Math.max(0, result.percentage))}%` }}
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
