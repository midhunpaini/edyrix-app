import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Lock, Clock } from "lucide-react";
import { useChapter } from "../hooks/useContent";
import { Skeleton } from "../components/ui/Skeleton";

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

  const { data: chapter, isLoading } = useChapter(id);

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-teal to-teal-dark px-4 pt-12 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white/80 text-sm font-body mb-4 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
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
            <button
              key={lesson.id}
              onClick={() =>
                navigate(`/app/lessons/${lesson.id}`, {
                  state: { chapterId: id, chapterTitle: chapter?.title },
                })
              }
              className="w-full bg-white rounded-2xl border border-ink/5 p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
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
                    <CheckCircle2 size={16} className="text-forest flex-shrink-0 mt-0.5" />
                  ) : !lesson.is_free ? (
                    <Lock size={14} className="text-ink-3 flex-shrink-0 mt-0.5" />
                  ) : null}
                </div>

                <div className="flex items-center gap-2 mt-1.5">
                  {lesson.duration_seconds && (
                    <span className="flex items-center gap-1 text-[11px] text-ink-3 font-body">
                      <Clock size={11} />
                      {formatDuration(lesson.duration_seconds)}
                    </span>
                  )}
                  {lesson.is_free && (
                    <span className="text-[10px] font-body font-bold text-forest bg-forest/10 px-1.5 py-0.5 rounded-full">
                      FREE
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
