import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useSubject } from "../hooks/useContent";
import { Icon } from "../components/ui/Icon";
import { Icons } from "../lib/icons";
import { getSubjectMeta } from "../lib/subjects";
import { PageHeader } from "../components/layout/PageHeader";

function chapterStatus(lessonsCompleted: number, lessonsTotal: number) {
  if (lessonsTotal > 0 && lessonsCompleted === lessonsTotal) {
    return { text: "Complete ✓", tone: "text-forest" };
  }
  if (lessonsCompleted > 0) {
    return { text: `${lessonsCompleted} of ${lessonsTotal} done`, tone: "text-amber-dark" };
  }
  return { text: "Not started", tone: "text-ink-3" };
}

export function ChapterListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: subject, isLoading } = useSubject(id);

  const meta = getSubjectMeta(subject?.slug ?? "");
  const hasSubjectStarted = (subject?.completed_lessons ?? 0) > 0 || (subject?.subject_progress_pct ?? 0) > 0;
  const subjectPct = Math.round(subject?.subject_progress_pct ?? 0);

  return (
    <div className="pb-4">
      <PageHeader
        title={subject?.name ?? "Subject"}
        subtitle={`Class ${user?.current_class ?? 10} · ${subject?.total_chapters ?? 0} chapters · ~${Math.round(subject?.estimated_hours ?? 0)} hours`}
        onBack={() => navigate("/app/subjects")}
        backLabel="Subjects"
        leadingElement={
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            {meta.emoji}
          </div>
        }
      >
        {hasSubjectStarted ? (
          <div className="mt-4">
            <p className="text-xs text-white/70 font-body mb-1">Your progress: {subjectPct}%</p>
            <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-white/90" style={{ width: `${subjectPct}%` }} />
            </div>
          </div>
        ) : null}
      </PageHeader>

      <div className="px-4 py-4 space-y-2">
        {isLoading ? (
          <>
            {[0, 1, 2, 3, 4].map((item) => (
              <div key={item} className="skeleton h-20 rounded-xl" />
            ))}
          </>
        ) : (subject?.chapters ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Icon name={Icons.book} size={40} className="text-ink/20 mb-3 block" aria-hidden />
            <p className="font-body font-semibold text-ink-3">No chapters yet</p>
          </div>
        ) : (
          (subject?.chapters ?? []).map((chapter) => {
            const pct = Math.round(chapter.progress_pct ?? 0);
            const status = chapterStatus(chapter.lessons_completed, chapter.lessons_total);
            const complete = pct >= 100;
            const inProgress = pct > 0 && pct < 100;

            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() =>
                  navigate(`/app/chapters/${chapter.id}`, {
                    state: {
                      subjectId: id,
                      subjectName: subject?.name,
                      subjectSlug: subject?.slug,
                    },
                  })
                }
                className="w-full bg-white rounded-2xl border border-ink/5 p-4 text-left active:scale-[.98] transition-transform duration-100"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0"
                    style={
                      complete
                        ? { backgroundColor: "#0D6E6E", borderColor: "#0D6E6E", color: "white" }
                        : inProgress
                        ? { backgroundColor: "#E1F5EE", borderColor: "#0D6E6E66", color: "#0D6E6E" }
                        : { backgroundColor: "#F1EFE8", borderColor: "#DCD8CF", color: "#7C7C9A" }
                    }
                  >
                    {complete ? <Icon name={Icons.check} size={16} aria-hidden /> : <span className="font-display font-bold text-sm">{chapter.chapter_number}</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm text-ink">{chapter.title}</p>
                    <p className={`font-body text-xs mt-1 ${status.tone}`}>
                      {chapter.lessons_total} lessons · {chapter.estimated_minutes} min · {status.text}
                    </p>

                    {chapter.has_test ? (
                      <div className="mt-2">
                        {chapter.lessons_total > 0 && chapter.lessons_completed === chapter.lessons_total ? (
                          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-body font-semibold border border-teal text-teal">
                            Take test →
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-body font-semibold bg-ink/5 text-ink-3">
                            🔒 Test locked
                          </span>
                        )}
                      </div>
                    ) : null}

                    {pct > 0 ? (
                      <div className="mt-2">
                        <div className="w-full h-1 bg-ink/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${complete ? "bg-forest" : "bg-amber"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {complete ? <p className="font-body text-[11px] text-forest mt-1">Complete</p> : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
