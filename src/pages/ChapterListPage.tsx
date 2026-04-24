import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, BookOpen, PenLine } from "lucide-react";
import { useSubject } from "../hooks/useContent";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Skeleton } from "../components/ui/Skeleton";

export function ChapterListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: subject, isLoading } = useSubject(id);

  return (
    <div>
      {/* Header */}
      <div
        className="px-4 pt-12 pb-6"
        style={{
          background: subject?.color
            ? `linear-gradient(135deg, ${subject.color} 0%, ${subject.color}CC 100%)`
            : "linear-gradient(135deg, #0D6E6E 0%, #094F4F 100%)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white/80 text-sm font-body mb-4 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Subjects
        </button>
        <div className="flex items-center gap-3">
          {subject && (
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              {subject.icon}
            </div>
          )}
          <div>
            {isLoading ? (
              <div>
                <div className="h-6 w-32 bg-white/20 rounded animate-pulse mb-1" />
                <div className="h-4 w-24 bg-white/15 rounded animate-pulse" />
              </div>
            ) : (
              <div>
                <h1 className="font-display font-bold text-xl text-white leading-tight">
                  {subject?.name}
                </h1>
                <p className="text-white/70 text-sm font-body">{subject?.name_ml}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chapter list */}
      <div className="px-4 py-4 space-y-2">
        {isLoading ? (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </>
        ) : (subject?.chapters ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen size={40} className="text-ink/20 mb-3" />
            <p className="font-body font-semibold text-ink-3">No chapters yet</p>
            <p className="font-body text-sm text-ink-3 mt-1">Content is being added soon</p>
          </div>
        ) : (
          (subject?.chapters ?? []).map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => navigate(`/app/chapters/${chapter.id}`, {
                state: { subjectId: id, subjectName: subject?.name },
              })}
              className="w-full bg-white rounded-2xl border border-ink/5 p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              {/* Chapter number badge */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
                style={{
                  backgroundColor: chapter.is_completed
                    ? "#22B57320"
                    : (subject?.color ?? "#0D6E6E") + "15",
                  color: chapter.is_completed ? "#22B573" : (subject?.color ?? "#0D6E6E"),
                }}
              >
                {chapter.is_completed ? (
                  <CheckCircle2 size={20} />
                ) : (
                  chapter.chapter_number
                )}
              </div>

              {/* Title + meta */}
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-ink text-sm leading-tight truncate">
                  {chapter.title}
                </p>
                <p className="text-ink-3 text-[11px] font-body mt-0.5 truncate">
                  {chapter.title_ml}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[11px] text-ink-3 font-body">
                    {chapter.lesson_count} lessons
                  </span>
                  {chapter.has_test && (
                    <span className="flex items-center gap-0.5 text-[11px] text-amber font-body font-semibold">
                      <PenLine size={11} />
                      Test
                    </span>
                  )}
                </div>
                {chapter.watch_percentage > 0 && (
                  <ProgressBar
                    value={chapter.watch_percentage}
                    className="mt-2"
                  />
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
