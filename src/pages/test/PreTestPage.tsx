import { useNavigate, useParams, useLocation } from "react-router-dom";
import type { AxiosError } from "axios";
import { useTest } from "../../hooks/useTests";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { Icon } from "../../components/ui/Icon";
import { Icons } from "../../lib/icons";
import type { LastAttempt, TestDetail } from "../../types";

const INSTRUCTIONS = [
  "Each question carries 1 mark",
  "No negative marking for wrong answers",
  "Use the question palette to navigate between questions",
  "Timer starts when you tap Begin Test",
  "Test auto-submits when the timer reaches zero",
];

interface PreTestState {
  lastAttempt?: LastAttempt | null;
}

function daysSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

const STATS = [
  { key: "questions", label: "Questions", iconName: Icons.quiz },
  { key: "duration",  label: "Duration",  iconName: Icons.timer },
  { key: "marks",     label: "Marks",     iconName: Icons.star },
] as const;

export function PreTestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = location.state as PreTestState | null;
  const lastAttempt = fromState?.lastAttempt ?? null;

  const { data: test, isLoading, error } = useTest(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="bg-ink px-4 pt-12 pb-8">
          <Skeleton className="h-4 w-32 mb-3 bg-white/10" />
          <Skeleton className="h-7 w-48 mb-2 bg-white/10" />
          <Skeleton className="h-5 w-28 bg-white/10" />
        </div>
        <div className="px-4 -mt-4 space-y-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  const axiosError = error as AxiosError<{ detail?: { detail?: string; lesson_id?: string; lesson_title?: string } }> | null;
  if (axiosError?.response?.status === 403) {
    const detail = axiosError.response?.data?.detail;
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-ink/5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full hover:bg-bg active:scale-95 transition-all"
            aria-label="Go back"
          >
            <Icon name={Icons.back} size={24} />
          </button>
          <p className="font-body font-semibold text-ink text-sm">Test Locked</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mb-4">
            <Icon name={Icons.lock} size={32} label="Content locked" className="text-amber" />
          </div>
          <h1 className="font-display font-bold text-xl text-ink mb-2">Complete the lesson first</h1>
          <p className="font-body text-sm text-ink-3 max-w-[280px] mb-6">
            {detail?.lesson_title
              ? `Finish "${detail.lesson_title}" to unlock this test.`
              : "Finish the lesson to unlock this test."}
          </p>
          <Button
            fullWidth
            className="max-w-[280px]"
            onClick={() =>
              detail?.lesson_id
                ? navigate(`/app/lessons/${detail.lesson_id}`)
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

  function handleBegin() {
    navigate(`/app/tests/${id}/live`, { state: { testData: test as TestDetail } });
  }

  const statValues = [
    test.questions.length,
    `${test.duration_minutes} min`,
    test.total_marks,
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Hero */}
      <div className="bg-ink px-4 pt-12 pb-10 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full hover:bg-white/10 active:scale-95 transition-all"
          aria-label="Go back"
        >
          <Icon name={Icons.back} size={24} className="text-white" />
        </button>

        <div className="mt-8">
          <p className="text-[10px] font-body font-bold text-amber uppercase tracking-widest mb-2">
            {test.subject_name ? `${test.subject_name.toUpperCase()} · ` : ""}CHAPTER TEST
          </p>
          <h1 className="font-display font-bold text-white leading-tight mb-3" style={{ fontSize: 22 }}>
            {test.title}
          </h1>
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
            <span className="font-body text-xs text-white/80">
              Chapter {test.chapter_number} · {test.chapter_title}
            </span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="px-4 -mt-5 z-10">
        <div className="grid grid-cols-3 gap-2">
          {STATS.map(({ key, label, iconName }, i) => (
            <div key={key} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-ink/5">
              <Icon name={iconName} size={16} className="text-teal mx-auto mb-1" aria-hidden />
              <p className="font-display font-bold text-ink text-base leading-none">{statValues[i]}</p>
              <p className="font-body text-[10px] text-ink-3 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 overflow-y-auto">
        {/* Last attempt */}
        {lastAttempt && (
          <div className="bg-white rounded-2xl border border-ink/5 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center flex-shrink-0">
              <Icon name={Icons.trophy} size={18} className="text-amber" aria-hidden />
            </div>
            <div className="flex-1">
              <p className="font-body text-xs text-ink-3 mb-0.5">Last attempt</p>
              <p className="font-display font-bold text-ink text-sm">
                {lastAttempt.score}/{lastAttempt.total_marks ?? test.total_marks} — {Math.round(lastAttempt.percentage)}%
              </p>
            </div>
            <span className="font-body text-xs text-ink-3 flex-shrink-0">
              {daysSince(lastAttempt.completed_at)}
            </span>
          </div>
        )}

        <div className="h-px bg-ink/8" />

        {/* Instructions */}
        <div>
          <h2 className="font-display font-bold text-sm text-ink mb-3">Before you begin</h2>
          <ul className="space-y-2">
            {INSTRUCTIONS.map((inst) => (
              <li key={inst} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0 mt-1.5" />
                <span className="font-body text-sm text-ink-2 leading-snug">{inst}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sticky CTA */}
      <div
        className="px-4 pt-3 bg-white border-t border-ink/5"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <Button fullWidth size="lg" onClick={handleBegin}>
          Begin Test
          <Icon name={Icons.play} size={20} className="ml-2" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
