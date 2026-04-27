import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useChapter } from "../hooks/useContent";
import { Skeleton } from "../components/ui/Skeleton";
import { Icon } from "../components/ui/Icon";
import { Icons } from "../lib/icons";
import { useUIStore } from "../store/uiStore";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function LessonListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { subjectName?: string } | null;
  const openPricing = useUIStore((s) => s.openPricing);

  const { data: chapter, isLoading } = useChapter(id);

  function handleLessonClick(lessonId: string, isLocked: boolean) {
    if (isLocked) {
      toast.info("Subscribe to unlock this lesson");
      openPricing(chapter?.subject_id);
      return;
    }

    navigate(`/app/lessons/${lessonId}`, {
      state: { chapterId: id, chapterTitle: chapter?.title },
    });
  }

  function handleTestClick(lesson: NonNullable<typeof chapter>["lessons"][number]) {
    if (lesson.is_locked) {
      toast.info("Subscribe to unlock this lesson");
      openPricing(chapter?.subject_id);
      return;
    }
    if (!lesson.test) return;
    if (!lesson.test.is_unlocked) {
      toast.info("Complete this lesson to unlock its test");
      return;
    }
    navigate(`/app/tests/${lesson.test.id}`, {
      state: {
        chapterId: id,
        chapterTitle: chapter?.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
      },
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-teal to-teal-dark px-4 pt-12 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white/80 text-sm font-body mb-4 hover:text-white transition-colors"
        >
          <Icon name={Icons.back} size={16} aria-hidden />
          {state?.subjectName ?? "Chapters"}
        </button>
        {isLoading ? (
          <div className="h-6 w-40 bg-white/20 rounded animate-pulse" />
        ) : (
          <h1 className="font-display font-bold text-xl text-white leading-tight">
            {chapter?.title}
          </h1>
        )}
      </div>

      {/* Lesson list */}
      <div className="px-4 py-4 space-y-2">
        {isLoading ? (
          <>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </>
        ) : (
          (chapter?.lessons ?? []).map((lesson, index) => (
            <div
              key={lesson.id}
              className="w-full bg-white rounded-2xl border border-ink/5 p-4 shadow-sm"
            >
              <button
                onClick={() => handleLessonClick(lesson.id, lesson.is_locked)}
                className="w-full flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
              >
                {/* Thumbnail or index */}
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-ink/5 flex items-center justify-center">
                  {lesson.thumbnail_url ? (
                    <img
                      src={lesson.thumbnail_url}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <span className="font-display font-bold text-ink-3 text-lg">
                      {index + 1}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-body font-semibold text-ink text-sm leading-tight flex-1">
                      {lesson.title}
                    </p>
                    {lesson.is_completed ? (
                      <Icon name={Icons.complete} size={16} className="text-forest flex-shrink-0 mt-0.5" aria-hidden />
                    ) : lesson.is_locked ? (
                      <Icon name={Icons.lock} size={16} className="text-ink-3 flex-shrink-0 mt-0.5" aria-hidden />
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {lesson.duration_seconds && (
                      <span className="flex items-center gap-1 text-[11px] text-ink-3 font-body">
                        <Icon name={Icons.clock} size={11} aria-hidden />
                        {formatDuration(lesson.duration_seconds)}
                      </span>
                    )}
                    {lesson.is_free && (
                      <span className="text-[10px] font-body font-bold text-forest bg-forest/10 px-1.5 py-0.5 rounded-full">
                        FREE
                      </span>
                    )}
                    {lesson.is_locked && (
                      <span className="text-[10px] font-body font-bold text-ink-3 bg-ink/5 px-1.5 py-0.5 rounded-full">
                        PREMIUM
                      </span>
                    )}
                    {lesson.watch_percentage > 0 && !lesson.is_completed && (
                      <span className="text-[11px] text-ink-3 font-body">
                        {lesson.watch_percentage}% watched
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {lesson.test && (
                <button
                  onClick={() => handleTestClick(lesson)}
                  className={`mt-3 w-full h-10 rounded-xl border font-body font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                    lesson.test.is_unlocked
                      ? "border-amber/40 bg-amber/10 text-amber"
                      : "border-ink/8 bg-bg text-ink-3"
                  }`}
                >
                  {lesson.test.is_unlocked ? (
                    <>
                      <Icon name={Icons.quiz} size={14} aria-hidden />
                      {lesson.test.last_attempt ? "Retake Test" : "Take Test"}
                    </>
                  ) : (
                    <>
                      <Icon name={Icons.lock} size={14} aria-hidden />
                      Complete lesson to unlock test
                    </>
                  )}
                </button>
              )}
            </div>
          ))
        )}

        {!isLoading && chapter?.lessons.length === 0 && (
          <p className="text-center text-ink-3 font-body text-sm py-12">
            No lessons in this chapter yet
          </p>
        )}
      </div>
    </div>
  );
}
