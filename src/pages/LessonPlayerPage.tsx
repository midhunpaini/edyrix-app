import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Download, FileText, List, Lock } from "lucide-react";
import type { AxiosError } from "axios";
import { useLessonPlay, useChapter, useChapterNotes } from "../hooks/useContent";
import { VideoPlayer } from "../components/content/VideoPlayer";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { useUIStore } from "../store/uiStore";

interface LocationState {
  chapterId?: string;
  chapterTitle?: string;
}

type Tab = "lessons" | "notes";

function SubscriptionRequired({ subjectSlug }: { subjectSlug?: string }) {
  const openPricing = useUIStore((s) => s.openPricing);
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mb-4">
        <Lock size={28} className="text-teal" />
      </div>
      <h2 className="font-display font-bold text-xl text-ink mb-2">Premium Lesson</h2>
      <p className="font-body text-ink-3 text-sm mb-6 max-w-[260px]">
        Subscribe to unlock all lessons, PDF notes, and practice tests.
      </p>
      <Button size="lg" onClick={() => openPricing(subjectSlug)}>
        View Plans
      </Button>
    </div>
  );
}

export function LessonPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const chapterId = state?.chapterId;
  const chapterTitle = state?.chapterTitle;

  const [tab, setTab] = useState<Tab>("lessons");
  const [notesRequested, setNotesRequested] = useState(false);

  const { data: lesson, isLoading, error } = useLessonPlay(id);
  const { data: chapter } = useChapter(chapterId);
  const {
    data: notes,
    isLoading: notesLoading,
    error: notesError,
  } = useChapterNotes(notesRequested ? chapterId : undefined);

  const axiosError = error as AxiosError<{ detail?: { detail?: string } }> | null;
  const isSubscriptionRequired =
    axiosError?.response?.status === 403 &&
    axiosError?.response?.data?.detail?.detail === "subscription_required";

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-ink/5">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-xl hover:bg-bg transition-colors"
        >
          <ArrowLeft size={20} className="text-ink" />
        </button>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="h-4 w-40 bg-ink/10 rounded animate-pulse" />
          ) : (
            <p className="font-body font-semibold text-ink text-sm truncate">
              {lesson?.title ?? chapterTitle ?? "Lesson"}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <Skeleton className="w-full aspect-video rounded-none" />
      ) : isSubscriptionRequired ? (
        <SubscriptionRequired />
      ) : lesson ? (
        <VideoPlayer
          lessonId={id!}
          youtubeVideoId={lesson.youtube_video_id}
          resumeAtSeconds={lesson.resume_at_seconds}
        />
      ) : null}

      {/* Tabs */}
      {!isSubscriptionRequired && (
        <>
          <div className="flex border-b border-ink/5 bg-white">
            {(["lessons", "notes"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-body font-semibold transition-colors border-b-2 ${
                  tab === t
                    ? "border-teal text-teal"
                    : "border-transparent text-ink-3"
                }`}
              >
                {t === "lessons" ? (
                  <>
                    <List size={15} />
                    Lessons
                  </>
                ) : (
                  <>
                    <FileText size={15} />
                    Notes
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-4 py-3">
            {tab === "lessons" ? (
              <div className="space-y-1">
                {(chapter?.lessons ?? []).map((lessonItem) => (
                  <button
                    key={lessonItem.id}
                    onClick={() =>
                      lessonItem.id !== id &&
                      navigate(`/app/lessons/${lessonItem.id}`, {
                        state: { chapterId, chapterTitle },
                      })
                    }
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                      lessonItem.id === id
                        ? "bg-teal/10"
                        : "hover:bg-bg"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        lessonItem.id === id
                          ? "bg-teal text-white"
                          : "bg-ink/5 text-ink-3"
                      }`}
                    >
                      {lessonItem.watch_percentage >= 90 ? (
                        <span className="text-forest text-xs font-bold">✓</span>
                      ) : (
                        <span className="text-xs font-display font-bold">
                          {(chapter?.lessons ?? []).indexOf(lessonItem) + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-body text-sm font-medium truncate ${
                          lessonItem.id === id ? "text-teal font-semibold" : "text-ink"
                        }`}
                      >
                        {lessonItem.title}
                      </p>
                    </div>
                    {!lessonItem.is_free && lessonItem.id !== id && (
                      <Lock size={12} className="text-ink-3 flex-shrink-0" />
                    )}
                  </button>
                ))}
                {!chapter && chapterId && (
                  <p className="text-center text-ink-3 font-body text-sm py-4">
                    Loading lesson list…
                  </p>
                )}
              </div>
            ) : (
              <div className="py-2">
                {!notesRequested ? (
                  <div className="text-center py-6">
                    <FileText size={36} className="text-ink/20 mx-auto mb-3" />
                    <p className="font-body font-semibold text-ink-3 mb-4 text-sm">
                      Chapter PDF notes available
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setNotesRequested(true);
                        setTab("notes");
                      }}
                    >
                      Load Notes
                    </Button>
                  </div>
                ) : notesLoading ? (
                  <div className="flex flex-col items-center py-6">
                    <div className="w-8 h-8 rounded-full border-2 border-teal border-t-transparent animate-spin mb-3" />
                    <p className="text-ink-3 font-body text-sm">Loading notes…</p>
                  </div>
                ) : notesError ? (
                  <div className="text-center py-6">
                    <Lock size={32} className="text-ink/20 mx-auto mb-3" />
                    <p className="font-body text-ink-3 text-sm">Notes are premium content</p>
                  </div>
                ) : notes ? (
                  <div className="flex flex-col items-center py-4">
                    <div className="w-full bg-bg rounded-2xl p-4 border border-ink/5 mb-4">
                      <p className="font-body font-semibold text-ink text-sm">{notes.title}</p>
                      {notes.file_size_bytes && (
                        <p className="text-ink-3 text-xs font-body mt-0.5">
                          {(notes.file_size_bytes / 1024 / 1024).toFixed(1)} MB · PDF
                        </p>
                      )}
                    </div>
                    <a
                      href={notes.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button fullWidth variant="secondary">
                        <Download size={15} className="mr-2" />
                        Download PDF
                      </Button>
                    </a>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
