import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useMeStats } from "../hooks/useAuth";
import { useProgressSummary } from "../hooks/useProgress";
import { useSubjects } from "../hooks/useContent";
import { Skeleton } from "../components/ui/Skeleton";
import { Icon } from "../components/ui/Icon";
import { Icons } from "../lib/icons";
import { showMetric } from "../lib/displayValue";
import { getSubjectMeta } from "../lib/subjects";

function MetricCard({
  label,
  value,
  emptyText,
  icon,
  iconColor,
}: {
  label: string;
  value: number;
  emptyText: string;
  icon: string;
  iconColor: string;
}) {
  const metric = showMetric(value, "—");
  return (
    <div className="bg-white rounded-2xl p-3 text-center border border-ink/5">
      <Icon name={icon} size={20} className="mx-auto mb-1 block" style={{ color: iconColor }} aria-hidden />
      <p className="font-display font-bold text-ink text-lg leading-none">{metric.display}</p>
      <p className="text-ink-3 text-[11px] font-body mt-1">
        {metric.isEmpty ? emptyText : label}
      </p>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading: statsLoading } = useMeStats();
  const { data: progress, isLoading: progressLoading } = useProgressSummary();
  const { data: subjects, isLoading: subjectsLoading } = useSubjects(user?.current_class ?? null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning," : hour < 17 ? "Good afternoon," : "Good evening,";
  const firstName = user?.name?.split(" ")[0] ?? "Student";
  const streakDays = stats?.streak_days ?? 0;
  const loading = statsLoading || progressLoading;
  const inProgress = progress?.subjects.find((item) => item.percentage > 0 && item.percentage < 100);
  const showGoalNudge = !stats?.exam_date;

  return (
    <div className="pb-6">
      <section className="bg-gradient-to-br from-teal to-teal-dark px-5 pt-12 pb-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-body text-[13px] text-white/70">{greeting}</p>
            <h1 className="font-display text-[26px] font-bold text-white leading-tight">{firstName}</h1>
            {streakDays > 0 ? (
              <div className="inline-flex items-center gap-1 mt-2 bg-amber/20 text-amber rounded-full px-2.5 py-1">
                <span className="text-xs font-body font-semibold">🔥 {streakDays}-day streak</span>
              </div>
            ) : (
              <p className="font-body text-xs text-white/60 mt-2">🔥 Start your streak today!</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/app/profile")}
            className="touch rounded-full bg-white/15 text-white"
            aria-label="Open profile"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                className="w-11 h-11 rounded-full border-2 border-white/30"
                alt=""
              />
            ) : (
              <span className="font-display font-bold text-lg">{firstName[0]?.toUpperCase()}</span>
            )}
          </button>
        </div>
      </section>

      <div className="px-4 -mt-3 space-y-4">
        {showGoalNudge && (
          <button
            type="button"
            onClick={() => navigate("/app/goal-setup")}
            className="w-full text-left rounded-2xl bg-amber-pale border border-amber/25 border-l-4 border-l-amber px-4 py-3 active:scale-[0.99] transition-transform"
          >
            <p className="font-body text-sm font-semibold text-ink">Set your exam goal</p>
            <p className="font-body text-xs text-ink-3 mt-0.5">Add date and daily target to stay on track</p>
          </button>
        )}

        {loading ? (
          <Skeleton className="h-24 rounded-2xl" />
        ) : inProgress ? (
          <button
            onClick={() => navigate(`/app/subjects/${inProgress.subject_id}`)}
            className="w-full bg-white rounded-2xl border border-ink/5 p-4 text-left active:scale-[0.99] transition-transform"
          >
            <p className="font-body text-[11px] font-semibold text-ink-3 uppercase tracking-wide">Continue learning</p>
            <p className="font-display text-base font-bold text-ink mt-0.5">{inProgress.name}</p>
            <div className="w-full h-1 bg-ink/10 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-teal rounded-full" style={{ width: `${Math.round(inProgress.percentage)}%` }} />
            </div>
            <p className="font-body text-xs text-ink-3 mt-1">{Math.round(inProgress.percentage)}% complete</p>
          </button>
        ) : (
          <button
            onClick={() => navigate("/app/subjects")}
            className="w-full bg-white rounded-2xl border border-ink/5 p-4 text-left active:scale-[0.99] transition-transform"
          >
            <p className="font-body text-[11px] font-semibold text-ink-3 uppercase tracking-wide">Get started</p>
            <p className="font-display text-base font-bold text-ink mt-0.5">Start your first lesson</p>
            <p className="font-body text-xs text-ink-3 mt-1">Pick a subject and begin now</p>
          </button>
        )}

        {loading ? (
          <Skeleton className="h-20 rounded-2xl" />
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <MetricCard
              label="Videos"
              value={stats?.videos_completed ?? 0}
              emptyText="Start your first video"
              icon="play_circle"
              iconColor="#0D6E6E"
            />
            <MetricCard
              label="Tests"
              value={stats?.tests_taken ?? 0}
              emptyText="Take your first test"
              icon="assignment"
              iconColor="#534AB7"
            />
            <MetricCard
              label="Avg score"
              value={Math.round(stats?.avg_test_score ?? 0)}
              emptyText="Attempt a test"
              icon="emoji_events"
              iconColor="#F5A623"
            />
          </div>
        )}

        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-bold text-base text-ink">Your subjects</h2>
            <button
              type="button"
              onClick={() => navigate("/app/subjects")}
              className="touch text-sm font-body font-semibold text-teal"
            >
              See all
            </button>
          </div>

          {subjectsLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((item) => (
                <div key={item} className="skeleton h-16 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(subjects ?? []).slice(0, 4).map((subject) => {
                const meta = getSubjectMeta(subject.slug);
                const subjectProgress = progress?.subjects.find((entry) => entry.subject_id === subject.id);
                const pct = Math.round(subjectProgress?.percentage ?? 0);
                return (
                  <button
                    key={subject.id}
                    onClick={() => navigate(`/app/subjects/${subject.id}`)}
                    className="w-full bg-white rounded-2xl border border-ink/5 px-3 py-2.5 text-left flex items-center gap-3 active:scale-[0.99] transition-transform"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: meta.paleColor }}
                    >
                      {meta.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-sm text-ink truncate">{subject.name}</p>
                      {pct > 0 ? (
                        <>
                          <div className="w-full h-1 bg-ink/10 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-teal rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="font-body text-[11px] text-ink-3 mt-1">{pct}% complete</p>
                        </>
                      ) : (
                        <p className="font-body text-[11px] text-ink-3 mt-1">Start learning →</p>
                      )}
                    </div>
                    <Icon name={Icons.forward} size={16} className="text-ink-3" aria-hidden />
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
