import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useSubjects } from "../hooks/useContent";
import { useProgressSummary } from "../hooks/useProgress";
import { useSubscription } from "../hooks/useSubscription";
import { PremiumLock } from "../components/content/PremiumLock";
import { Icon } from "../components/ui/Icon";
import { Icons } from "../lib/icons";
import { getSubjectMeta } from "../lib/subjects";
import { PageHeader } from "../components/layout/PageHeader";

export function SubjectListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const classNum = user?.current_class ?? null;

  const { data: subjects, isLoading } = useSubjects(classNum);
  const { data: progress } = useProgressSummary();
  const { data: subscription } = useSubscription();
  const [filter, setFilter] = useState<string>("all");

  const hasAnyAccess = subscription?.free_trial.active || subscription?.subscription?.status === "active";
  const hasLockedSubjects = (subjects ?? []).some((s) => !s.has_access);
  const showTrialBanner = !hasAnyAccess && hasLockedSubjects;

  const filters = [
    { key: "all", label: "All" },
    ...(subjects ?? []).map((subject) => ({ key: subject.slug, label: subject.name })),
  ];

  const filtered = filter === "all" ? subjects ?? [] : (subjects ?? []).filter((subject) => subject.slug === filter);

  return (
    <div className="pb-5">
      <PageHeader
        title="Subjects"
        subtitle={classNum ? `Class ${classNum}` : "All classes"}
        onBack={() => navigate("/app/dashboard")}
        backLabel="Home"
      />

      {showTrialBanner && (
        <button
          type="button"
          onClick={() => navigate("/app/pricing")}
          className="mx-4 mt-3 w-[calc(100%-2rem)] rounded-2xl bg-amber-pale border border-amber/30 px-4 py-3 text-left active:scale-[0.99] transition-transform"
        >
          <p className="font-body text-sm font-semibold text-ink">Unlock all subjects free for 7 days</p>
          <p className="font-body text-xs text-ink-3 mt-0.5">No payment needed to start</p>
        </button>
      )}

      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={
                filter === item.key
                  ? "rounded-full px-3 py-2 text-xs font-body font-semibold bg-teal text-white"
                  : "rounded-full px-3 py-2 text-xs font-body font-semibold bg-white border border-ink/10 text-ink-3"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Icon name={Icons.book} size={40} className="text-ink/20 mb-3 block" aria-hidden />
            <p className="font-body font-semibold text-ink-3">No subjects found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((subject) => {
              const meta = getSubjectMeta(subject.slug);
              const subjectProgress = progress?.subjects.find((entry) => entry.subject_id === subject.id);
              const pct = Math.round(subjectProgress?.percentage ?? 0);

              const content = (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => (subject.has_access ? navigate(`/app/subjects/${subject.id}`) : undefined)}
                  className="w-full rounded-2xl bg-white border border-ink/5 p-3 text-left flex items-center gap-3 active:scale-[0.99] transition-transform"
                >
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl flex-shrink-0"
                    style={{ backgroundColor: meta.paleColor }}
                  >
                    {meta.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-ink text-base truncate">{subject.name}</p>
                    <p className="font-body text-xs text-ink-3 mt-0.5">{subject.chapter_count} chapters</p>
                    {pct > 0 ? (
                      <>
                        <div className="w-full h-1 bg-ink/10 rounded-full mt-3 overflow-hidden">
                          <div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="font-body text-xs text-ink-3 mt-1">{pct}% complete</p>
                      </>
                    ) : (
                      <p className="font-body text-xs text-teal font-semibold mt-3">Start learning →</p>
                    )}
                  </div>

                  <Icon name={Icons.forward} size={18} className="text-ink-3" aria-hidden />
                </button>
              );

              if (!subject.has_access) {
                return (
                  <PremiumLock
                    key={subject.id}
                    subjectId={subject.id}
                    classNumber={classNum ?? 10}
                  >
                    {content}
                  </PremiumLock>
                );
              }

              return content;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
