import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useSubjects } from "../hooks/useContent";
import { useProgressSummary } from "../hooks/useProgress";
import { useSubscription } from "../hooks/useSubscription";
import { PremiumLock } from "../components/content/PremiumLock";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Skeleton } from "../components/ui/Skeleton";
import { Icon } from "../components/ui/Icon";
import { Icons } from "../lib/icons";

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
    ...(subjects ?? []).map((s) => ({ key: s.slug, label: s.name })),
  ];

  const filtered =
    filter === "all"
      ? (subjects ?? [])
      : (subjects ?? []).filter((s) => s.slug === filter);

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-teal to-teal-dark px-4 pt-12 pb-6">
        <h1 className="font-display font-bold text-2xl text-white">Subjects</h1>
        <p className="text-white/70 text-sm font-body mt-0.5">
          {classNum ? `Class ${classNum}` : "All Classes"}
        </p>
      </div>

      {/* Trial CTA */}
      {showTrialBanner && (
        <button
          type="button"
          onClick={() => navigate("/app/pricing")}
          className="mx-4 mt-3 w-[calc(100%-2rem)] flex items-center gap-3 bg-gradient-to-r from-amber/15 to-amber/5 border border-amber/30 rounded-2xl px-4 py-3 text-left active:scale-[0.98] transition-transform"
        >
          <Icon name={Icons.sparkle} size={22} className="text-amber flex-shrink-0" aria-hidden />
          <div className="flex-1">
            <p className="font-body font-bold text-sm text-ink">Unlock all subjects free for 7 days</p>
            <p className="font-body text-xs text-ink-3 mt-0.5">No payment needed to start</p>
          </div>
          <Icon name={Icons.forward} size={16} className="text-amber" aria-hidden />
        </button>
      )}

      {/* Filter chips */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-colors ${
                filter === f.key
                  ? "bg-teal text-white"
                  : "bg-white text-ink-3 border border-ink/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Icon name={Icons.book} size={40} className="text-ink/20 mb-3 block" aria-hidden />
            <p className="font-body font-semibold text-ink-3">No subjects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((subject) => {
              const subjectProgress = progress?.subjects.find(
                (p) => p.subject_id === subject.id
              );
              const pct = subjectProgress?.percentage ?? 0;

              const card = (
                <button
                  key={subject.id}
                  onClick={() =>
                    subject.has_access
                      ? navigate(`/app/subjects/${subject.id}`)
                      : undefined
                  }
                  className="bg-white rounded-2xl border border-ink/5 overflow-hidden w-full text-left active:scale-[0.97] transition-transform"
                >
                  <div
                    className="h-24 flex items-center justify-center text-4xl"
                    style={{ backgroundColor: subject.color + "15" }}
                  >
                    {subject.icon}
                  </div>
                  <div className="p-3">
                    <p className="font-display font-bold text-ink text-sm leading-tight">
                      {subject.name}
                    </p>
                    <p className="text-ink-3 text-[11px] font-body mt-0.5 mb-2">
                      {subject.name_ml}
                    </p>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-ink-3 font-body">
                        {subject.chapter_count} chapters
                      </span>
                      <span className="text-[11px] text-ink-3 font-body">{Math.round(pct)}%</span>
                    </div>
                    <ProgressBar value={pct} />
                  </div>
                </button>
              );

              if (!subject.has_access) {
                return (
                  <PremiumLock
                    key={subject.id}
                    subjectId={subject.id}
                    classNumber={classNum ?? 10}
                  >
                    {card}
                  </PremiumLock>
                );
              }

              return card;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
