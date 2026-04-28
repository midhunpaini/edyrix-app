import { useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { useLessonPlay, useChapter, useChapterNotes } from "../hooks/useContent";
import { VideoPlayer } from "../components/content/VideoPlayer";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { Icons } from "../lib/icons";
import { useUIStore } from "../store/uiStore";
import { getSubjectMeta } from "../lib/subjects";
import { PageHeader } from "../components/layout/PageHeader";

interface LocationState {
  chapterId?: string;
  chapterTitle?: string;
  subjectName?: string;
  subjectSlug?: string;
}

type Tab = "chapters" | "notes";

function SubscriptionRequired({
  subjectId,
  chapterTitle,
  onBackToLessons,
}: {
  subjectId?: string;
  chapterTitle?: string;
  onBackToLessons: () => void;
}) {
  const openPricing = useUIStore((s) => s.openPricing);
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mb-4">
        <Icon name={Icons.lock} size={28} className="text-teal" aria-hidden />
      </div>
      <h2 className="font-display font-bold text-xl text-ink mb-2">Premium lesson</h2>
      <p className="font-body text-ink-3 text-sm mb-6 max-w-[260px]">
        Subscribe to unlock this lesson{chapterTitle ? ` in ${chapterTitle}` : ""}, notes, and tests.
      </p>
      <div className="w-full max-w-[260px] space-y-2">
        <Button size="lg" fullWidth onClick={() => openPricing(subjectId)}>
          View plans
        </Button>
        <Button variant="secondary" fullWidth onClick={onBackToLessons}>
          Back to lessons
        </Button>
      </div>
    </div>
  );
}

export function LessonPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};
  const chapterId = state.chapterId;

  const [tab, setTab] = useState<Tab>("chapters");
  const [videoReady, setVideoReady] = useState(false);
  const { data: lesson, isLoading, error } = useLessonPlay(id);
  const { data: chapter } = useChapter(chapterId);
  const { data: notes, isLoading: notesLoading, error: notesError } = useChapterNotes(tab === "notes" ? chapterId : undefined);

  const axiosError = error as AxiosError<{ detail?: { detail?: string } }> | null;
  const isSubscriptionRequired =
    axiosError?.response?.status === 403 &&
    axiosError?.response?.data?.detail?.detail === "subscription_required";
  const openPricing = useUIStore((s) => s.openPricing);

  const lessons = chapter?.lessons ?? [];
  const currentLessonIndex = lessons.findIndex((item) => item.id === id);
  const currentLesson = currentLessonIndex >= 0 ? lessons[currentLessonIndex] : undefined;
  const currentNumber = currentLessonIndex >= 0 ? currentLessonIndex + 1 : 1;
  const totalLessons = lessons.length > 0 ? lessons.length : 1;
  const chapterTitle = state.chapterTitle ?? chapter?.title ?? "Chapter";
  const meta = getSubjectMeta(state.subjectSlug ?? "");

  const notesEmpty = useMemo(() => {
    if (!tab || tab !== "notes") return false;
    if (notesLoading) return false;
    if (notes) return false;
    return true;
  }, [notes, notesLoading, tab]);

  function handleLessonClick(lessonId: string, isUnlocked: boolean) {
    if (lessonId === id) return;
    if (!isUnlocked) {
      toast.info("Subscribe to unlock this lesson");
      openPricing(chapter?.subject_id);
      return;
    }
    setVideoReady(false);
    navigate(`/app/lessons/${lessonId}`, {
      state: {
        chapterId,
        chapterTitle,
        subjectName: state.subjectName,
        subjectSlug: state.subjectSlug,
      },
    });
  }

  return (
    <div className="pb-4">
      <PageHeader
        variant="plain"
        title={lesson?.title ?? "Lesson"}
        subtitle={chapterTitle}
        onBack={() => navigate(-1)}
        backLabel={state.subjectName ?? "Lessons"}
        rightElement={
          <button type="button" className="touch text-ink-3 rounded-xl hover:bg-bg" aria-label="Share lesson">
            <Icon name={Icons.share} size={20} aria-hidden />
          </button>
        }
      />

      {isSubscriptionRequired ? (
        <SubscriptionRequired
          subjectId={chapter?.subject_id}
          chapterTitle={chapterTitle}
          onBackToLessons={() => (chapterId ? navigate(`/app/chapters/${chapterId}`) : navigate(-1))}
        />
      ) : (
        <>
          <div className="relative border-b border-ink/8 bg-white">
            {!videoReady || isLoading ? (
              <div className="skeleton w-full aspect-video rounded-none" />
            ) : null}

            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none transition-opacity ${videoReady ? "opacity-0" : "opacity-100"}`}>
              <span className="text-5xl">{meta.emoji}</span>
              <span className="font-body text-sm text-ink-3">Loading video…</span>
            </div>

            {lesson ? (
              <VideoPlayer
                lessonId={id!}
                youtubeVideoId={lesson.youtube_video_id}
                resumeAtSeconds={lesson.resume_at_seconds}
                onReady={() => setVideoReady(true)}
                className={`transition-opacity duration-300 ${videoReady ? "opacity-100" : "opacity-0"}`}
              />
            ) : null}

            <div className="absolute top-2 left-2 rounded-md px-2 py-1 bg-black/60 text-white text-xs font-body">
              Lesson {currentNumber} of {totalLessons}
            </div>
          </div>

          <div className="px-5 py-3 border-b border-ink/8 bg-white">
            <div className="flex items-center justify-between gap-3">
              <p className="font-body text-sm font-semibold text-ink truncate">{lesson?.title ?? "Lesson"}</p>
              <p className="font-body text-xs text-ink-3">
                {currentLesson?.duration_seconds ? `${Math.max(1, Math.round(currentLesson.duration_seconds / 60))} min` : ""}
              </p>
            </div>
            <div className="w-full h-[3px] bg-ink/10 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-teal rounded-full" style={{ width: `${Math.min(100, currentLesson?.watch_percentage ?? lesson?.watch_percentage ?? 0)}%` }} />
            </div>
            <p className="font-body text-[10px] text-ink-3 text-right mt-1">{currentLesson?.watch_percentage ?? lesson?.watch_percentage ?? 0}% watched</p>
          </div>

          <div className="flex border-b border-ink/8 bg-white">
            {(["chapters", "notes"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`flex-1 h-11 flex items-center justify-center gap-2 border-b-2 text-sm font-body font-medium ${
                  tab === item ? "border-teal text-teal" : "border-transparent text-ink-3"
                }`}
              >
                <Icon name={item === "chapters" ? Icons.chapter : Icons.note} size={20} aria-hidden />
                {item === "chapters" ? "Chapters" : "Notes"}
              </button>
            ))}
          </div>

          <div className="px-4 py-3">
            {tab === "chapters" ? (
              <div className="space-y-1">
                {lessons.map((entry, index) => {
                  const active = entry.id === id;
                  const complete = entry.is_completed;
                  const inProgress = entry.watch_percentage > 0 && entry.watch_percentage < 100;
                  const locked = !entry.is_unlocked;

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => handleLessonClick(entry.id, entry.is_unlocked)}
                      className={`w-full min-h-[48px] px-4 py-2 rounded-lg text-left flex items-center gap-3 ${
                        active ? "bg-[#E1F5EE]" : "hover:bg-white"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          active || complete ? "bg-teal text-white" : "bg-[#F1EFE8] text-[#7C7C9A]"
                        }`}
                      >
                        {active ? (
                          <Icon name={Icons.play} size={14} aria-hidden />
                        ) : complete ? (
                          <Icon name={Icons.check} size={14} aria-hidden />
                        ) : (
                          <span className="font-display text-xs font-bold">{index + 1}</span>
                        )}
                      </div>

                      <div className={`flex-1 min-w-0 ${locked ? "opacity-50" : ""}`}>
                        <p className={`font-body text-sm truncate ${active ? "text-teal font-semibold" : "text-ink"}`}>
                          {entry.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-body text-[11px] text-ink-3">
                            {entry.duration_seconds ? `${Math.max(1, Math.round(entry.duration_seconds / 60))} min` : ""}
                          </span>
                          {inProgress ? (
                            <span className="font-body text-[10px] text-amber-dark">{entry.watch_percentage}% watched</span>
                          ) : null}
                        </div>
                        {inProgress ? (
                          <div className="w-full h-[2px] bg-ink/10 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-amber rounded-full" style={{ width: `${Math.min(100, entry.watch_percentage)}%` }} />
                          </div>
                        ) : null}
                      </div>

                      {complete && !active ? <span className="font-body text-[10px] text-forest">✓</span> : null}
                      {locked ? <Icon name={Icons.lock} size={12} className="text-ink-3" aria-hidden /> : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>
                {notesLoading ? (
                  <div className="skeleton h-20 rounded-xl" />
                ) : notes ? (
                  <div className="bg-white rounded-2xl border border-ink/5 p-4">
                    <p className="font-body font-semibold text-sm text-ink">{notes.title}</p>
                    {notes.file_size_bytes ? (
                      <p className="font-body text-xs text-ink-3 mt-1">
                        {(notes.file_size_bytes / 1024 / 1024).toFixed(1)} MB · PDF
                      </p>
                    ) : null}
                    <a href={notes.url} target="_blank" rel="noopener noreferrer" className="block mt-3">
                      <Button fullWidth variant="secondary">
                        <Icon name={Icons.download} size={16} className="mr-2" aria-hidden />
                        Download PDF
                      </Button>
                    </a>
                  </div>
                ) : notesEmpty ? (
                  <p className="font-body text-xs text-ink-3 text-center py-8">No notes for this lesson yet</p>
                ) : notesError ? (
                  <p className="font-body text-xs text-ink-3 text-center py-8">No notes for this lesson yet</p>
                ) : null}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
