import { useNavigate, useParams } from "react-router-dom";
import type { AxiosError } from "axios";
import { useChapterTest, useTest } from "../../hooks/useTests";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
import { Icons } from "../../lib/icons";
import { PageHeader } from "../../components/layout/PageHeader";

const INSTRUCTIONS = [
  "Each question carries 1 mark",
  "No negative marking for wrong answers",
  "Use the palette to move between questions",
  "Timer starts when you tap Begin Test",
  "Test auto-submits when time is over",
];

function cleanTitle(title: string) {
  return title.replace(/\s*[-–—]\s*test$/i, "");
}

function formatAttemptDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PreTestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: test, isLoading, error } = useTest(id);
  const { data: chapterTest } = useChapterTest(test?.chapter_id);
  const lastAttempt = chapterTest?.last_attempt ?? null;

  const axiosError = error as AxiosError<{ detail?: { detail?: string; lesson_id?: string; lesson_title?: string } }> | null;
  if (axiosError?.response?.status === 403) {
    const detail = axiosError.response.data?.detail;
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <PageHeader variant="plain" title="Test locked" onBack={() => navigate(-1)} backLabel="Tests" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mb-4">
            <Icon name={Icons.lock} size={32} className="text-amber" aria-hidden />
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
              detail?.lesson_id ? navigate(`/app/lessons/${detail.lesson_id}`) : navigate(-1)
            }
          >
            Go to lesson
          </Button>
        </div>
      </div>
    );
  }

  function handleBegin() {
    navigate(`/app/tests/${id}/live`, { state: { testData: test } });
  }

  const lastPct = Math.round(lastAttempt?.percentage ?? 0);
  const targetScore = Math.min(100, Math.max(80, lastPct + 10));

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <PageHeader variant="plain" title="Chapter test" subtitle={test?.chapter_title ?? ""} onBack={() => navigate(-1)} backLabel="Tests" />

      <div className="bg-ink px-5 pt-4 pb-7">
        <p className="text-[10px] font-body font-bold text-amber uppercase tracking-widest mb-2">
          {test?.subject_name ? `${test.subject_name.toUpperCase()} · ` : ""}CHAPTER TEST
        </p>
        <h1 className="font-display font-bold text-white text-[22px] leading-tight">
          {test ? cleanTitle(test.title) : "Loading..."}
        </h1>
        {test ? (
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full mt-3">
            <span className="font-body text-xs text-white/80">
              Chapter {test.chapter_number} · {test.chapter_title}
            </span>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-2 mt-4">
          {isLoading ? (
            <>
              <div className="skeleton h-20 rounded-xl" />
              <div className="skeleton h-20 rounded-xl" />
              <div className="skeleton h-20 rounded-xl" />
            </>
          ) : test ? (
            <>
              <div className="rounded-xl border border-white/15 bg-white/8 p-4 text-center">
                <Icon name={Icons.quiz} size={20} className="mx-auto mb-1 text-white/60" aria-hidden />
                <p className="font-display text-2xl font-bold text-white">{test.questions.length}</p>
                <p className="font-body text-xs text-white/50">Questions</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/8 p-4 text-center">
                <Icon name={Icons.timer} size={20} className="mx-auto mb-1 text-white/60" aria-hidden />
                <p className="font-display text-2xl font-bold text-white">{test.duration_minutes}</p>
                <p className="font-body text-xs text-white/50">Minutes</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/8 p-4 text-center">
                <Icon name={Icons.star} size={20} className="mx-auto mb-1 text-white/60" aria-hidden />
                <p className="font-display text-2xl font-bold text-white">{test.total_marks}</p>
                <p className="font-body text-xs text-white/50">Marks</p>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex-1 px-5 py-4 overflow-y-auto">
        <div className="rounded-xl bg-white/50 border border-white/20 backdrop-blur-sm p-4">
          <h2 className="font-display font-bold text-sm text-ink mb-2">Before you begin</h2>
          {INSTRUCTIONS.map((rule) => (
            <div key={rule} className="flex items-start gap-[10px] py-2">
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#0D6E6E",
                  flexShrink: 0,
                  marginTop: 6,
                }}
              />
              <span className="font-body text-sm text-ink leading-[1.5]">{rule}</span>
            </div>
          ))}
        </div>

        {lastAttempt ? (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 ${
              lastPct >= 70 ? "bg-[#EAF3DE] border-[#CFE3B5]" : "bg-amber-pale border-amber/30"
            }`}
          >
            <p className="font-body text-sm font-semibold text-ink">Last attempt: {lastPct}%</p>
            <p className="font-body text-xs text-ink-3 mt-0.5">
              Attempt #{lastAttempt.attempt_number} · {formatAttemptDate(lastAttempt.completed_at)}
            </p>
            <p className="font-body text-xs text-ink-3 mt-1">You can do better — aim for {targetScore}%</p>
          </div>
        ) : null}
      </div>

      <div
        className="sticky bottom-0 px-5 pt-3 pb-4 bg-bg border-t border-white/40"
        style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={handleBegin}
          disabled={!test}
          className="w-full h-14 rounded-2xl bg-teal text-white font-display font-bold text-lg inline-flex items-center justify-center gap-2 hover:bg-teal-dark active:scale-[.98] transition"
        >
          Begin Test
          <Icon name="play_arrow" size={20} color="white" aria-hidden />
        </button>
      </div>
    </div>
  );
}
