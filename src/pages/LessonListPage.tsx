import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useChapter } from "../hooks/useContent";
import { useChapterTest } from "../hooks/useTests";
import { Icon } from "../components/ui/Icon";
import { Icons } from "../lib/icons";
import { PageHeader } from "../components/layout/PageHeader";

function durationLabel(seconds: number | null) {
  if (!seconds) return "0 min";
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}

export function LessonListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { subjectName?: string; subjectSlug?: string } | null;
  const { data: chapter, isLoading } = useChapter(id);
  const { data: chapterTest } = useChapterTest(id);

  const lessons = chapter?.lessons ?? [];
  const completed = lessons.filter((lesson) => lesson.is_completed).length;
  const total = lessons.length;
  const chapterPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allComplete = total > 0 && completed === total;
  const showTestCard = chapter?.has_test || !!chapter?.test_id || !!chapterTest;

  function handleLessonClick(lessonId: string, isUnlocked: boolean) {
    if (!isUnlocked) {
      navigate("/app/pricing");
      return;
    }
    navigate(`/app/lessons/${lessonId}`, {
      state: {
        chapterId: id,
        chapterTitle: chapter?.title,
        subjectName: state?.subjectName,
        subjectSlug: state?.subjectSlug,
      },
    });
  }

  function handleChapterTestClick() {
    if (!chapterTest || !allComplete) return;
    navigate(`/app/tests/${chapterTest.id}`, {
      state: {
        chapterId: id,
        chapterTitle: chapter?.title,
        lastAttempt: chapterTest.last_attempt,
      },
    });
  }

  return (
    <div className="pb-4">
      <PageHeader
        title={chapter?.title ?? "Chapter"}
        subtitle={state?.subjectName ?? "Lessons"}
        onBack={() => navigate(-1)}
        backLabel={state?.subjectName ?? "Chapters"}
      />

      <div className="px-5 py-3 border-b border-ink/8 bg-white">
        <div className="flex items-center justify-between gap-3 mb-1">
          <p className="font-body text-xs text-ink-3">
            {completed} of {Math.max(total, 0)} lessons complete
          </p>
          {showTestCard && allComplete ? (
            <button type="button" onClick={handleChapterTestClick} className="touch text-xs font-body font-semibold text-teal">
              Test available →
            </button>
          ) : null}
        </div>
        <div className="w-full h-[3px] bg-ink/10 rounded-full overflow-hidden">
          <div className="h-full bg-teal rounded-full" style={{ width: `${chapterPct}%` }} />
        </div>
      </div>

      <div className="px-4 py-4 space-y-2">
        {isLoading ? (
          <>
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="skeleton h-16 rounded-xl" />
            ))}
          </>
        ) : lessons.length === 0 ? (
          <p className="text-center text-ink-3 font-body text-sm py-12">No lessons in this chapter yet</p>
        ) : (
          lessons.map((lesson) => {
            const inProgress = lesson.watch_percentage > 0 && lesson.watch_percentage < 100;
            const complete = lesson.is_completed;
            const locked = !lesson.is_unlocked;
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => handleLessonClick(lesson.id, lesson.is_unlocked)}
                className="w-full bg-white rounded-2xl border border-ink/5 p-3 text-left active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0"
                    style={
                      complete
                        ? { backgroundColor: "#0D6E6E", borderColor: "#0D6E6E", color: "white" }
                        : inProgress
                        ? { backgroundColor: "#E1F5EE", borderColor: "#0D6E6E66", color: "#0D6E6E" }
                        : { backgroundColor: "white", borderColor: "#DCD8CF", color: "#7C7C9A" }
                    }
                  >
                    {complete ? <Icon name={Icons.check} size={16} aria-hidden /> : <span className="font-display font-bold text-sm">{lesson.lesson_number}</span>}
                  </div>

                  <div className={`flex-1 min-w-0 ${locked ? "opacity-50" : ""}`}>
                    <div className="flex items-center gap-1">
                      <p className="font-body font-semibold text-sm text-ink truncate">{lesson.title}</p>
                      {locked ? <Icon name={Icons.lock} size={12} className="text-ink-3" aria-hidden /> : null}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {lesson.is_free ? (
                        <span className="text-[10px] font-body font-bold text-[#27500A] bg-[#EAF3DE] rounded-full px-1.5 py-0.5">
                          FREE
                        </span>
                      ) : null}
                      <span className="text-xs font-body text-ink-3">{durationLabel(lesson.duration_seconds)}</span>
                    </div>

                    {inProgress ? (
                      <div className="mt-1">
                        <div className="w-full h-[2px] bg-ink/10 rounded-full overflow-hidden">
                          <div className="h-full bg-amber rounded-full" style={{ width: `${Math.min(100, lesson.watch_percentage)}%` }} />
                        </div>
                        <p className="font-body text-[10px] text-ink-3 text-right mt-0.5">{lesson.watch_percentage}% watched</p>
                      </div>
                    ) : complete ? (
                      <p className="font-body text-[10px] text-forest mt-1">✓ Complete</p>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {showTestCard ? (
        <div className="mx-5 mt-1 mb-2 rounded-xl border-[1.5px] border-teal px-4 py-3 flex items-center justify-between gap-3 bg-white">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Icon name="assignment" size={20} style={{ color: "#0D6E6E" }} aria-hidden />
              <p className="font-body font-semibold text-sm text-teal">Chapter Test</p>
            </div>
            <p className="font-body text-xs text-ink-3 mt-1">
              {chapterTest?.last_attempt ? `${Math.round(chapterTest.last_attempt.percentage)}% last attempt` : "Test your knowledge"}
            </p>
          </div>
          {allComplete ? (
            chapterTest?.last_attempt ? (
              <button
                type="button"
                onClick={handleChapterTestClick}
                className="h-10 px-3 rounded-lg border border-teal text-teal text-sm font-body font-semibold"
              >
                Retake →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleChapterTestClick}
                className="h-10 px-3 rounded-lg bg-teal text-white text-sm font-body font-semibold"
              >
                Take Test →
              </button>
            )
          ) : (
            <p className="font-body text-xs text-ink-3">🔒 Locked</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
