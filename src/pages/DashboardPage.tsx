import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useMeStats } from "../hooks/useAuth";
import { useProgressSummary } from "../hooks/useProgress";
import { useSubjects } from "../hooks/useContent";
import { useAllTrajectories } from "../hooks/useTrajectory";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Skeleton } from "../components/ui/Skeleton";
import { Icon } from "../components/ui/Icon";
import { Icons } from "../lib/icons";
import type { SubjectTrajectory } from "../types";

function MiniSparkline({ weeks }: { weeks: SubjectTrajectory["weeks"] }) {
  if (weeks.length < 2) return null;
  const recent = weeks.slice(-8);
  const max = Math.max(...recent.map((w) => w.avg_score), 1);
  const W = 80;
  const H = 32;
  const pts = recent.map((w, i) => {
    const x = (i / (recent.length - 1)) * W;
    const y = H - (w.avg_score / max) * H;
    return `${x},${y}`;
  });
  const last = recent[recent.length - 1];
  const trend = recent.length >= 2
    ? last.avg_score - recent[recent.length - 2].avg_score
    : 0;

  return (
    <div className="flex items-end gap-2">
      <svg width={W} height={H} className="overflow-visible">
        <polyline
          points={pts.join(" ")}
          fill="none"
          stroke={trend >= 0 ? "#0D6E6E" : "#EF4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`text-[11px] font-body font-bold ${
          trend >= 0 ? "text-teal" : "text-red-500"
        }`}
      >
        {trend >= 0 ? "+" : ""}{Math.round(trend)}%
      </span>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading: statsLoading } = useMeStats();
  const { data: progress, isLoading: progressLoading } = useProgressSummary();
  const { data: subjects } = useSubjects(user?.current_class ?? null);
  const { data: trajectories } = useAllTrajectories();

  const loading = statsLoading || progressLoading;
  const inProgress = progress?.subjects.find(
    (s) => s.percentage > 0 && s.percentage < 100
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] ?? "Student";

  const daysToExam = stats?.days_to_exam ?? null;
  const showExamCountdown = daysToExam !== null && daysToExam <= 180;
  const showGoalNudge = !stats?.exam_date;

  const scoreThisWeek = stats?.score_this_week ?? 0;
  const scoreTrend = stats?.score_trend ?? 0;
  const hasScoreData = scoreThisWeek > 0;

  return (
    <div className="pb-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal to-teal-dark px-4 pt-12 pb-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-body">{greeting},</p>
            <h1 className="text-white text-2xl font-display font-bold leading-tight">
              {firstName}!
            </h1>
            {showExamCountdown ? (
              <div className="flex items-center gap-1.5 mt-1.5 bg-white/15 rounded-xl px-2.5 py-1 w-fit">
                <Icon name={Icons.timer} size={14} className="text-amber" aria-hidden />
                <span className="text-white text-sm font-body font-semibold">
                  {daysToExam === 0
                    ? "Exam day!"
                    : daysToExam === 1
                    ? "1 day to exam"
                    : `${daysToExam} days to exam`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-1.5">
                <Icon name={Icons.streak} size={16} className="text-amber" aria-hidden />
                <span className="text-white/80 text-sm font-body">
                  {stats?.streak_days ?? 0} day streak
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate("/app/profile")}
            className="flex-shrink-0"
            aria-label="Profile"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                className="w-11 h-11 rounded-full border-2 border-white/30"
                alt=""
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">
                  {firstName[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Score trajectory card */}
        {hasScoreData && (
          <div className="bg-white rounded-2xl border border-ink/5 p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-body text-[11px] text-ink-3 uppercase tracking-wide font-semibold">
                  This Week's Score
                </p>
                <p className="font-display font-bold text-2xl text-ink mt-0.5">
                  {Math.round(scoreThisWeek)}%
                </p>
                {scoreTrend !== 0 && (
                  <p
                    className={`font-body text-xs mt-0.5 font-semibold ${
                      scoreTrend >= 0 ? "text-teal" : "text-red-500"
                    }`}
                  >
                    {scoreTrend >= 0 ? "▲" : "▼"} {Math.abs(Math.round(scoreTrend))}% vs last week
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => navigate("/app/subjects")}
                className="text-[11px] text-teal font-body font-semibold"
              >
                View all
              </button>
            </div>
            {trajectories && trajectories.length > 0 && (
              <div className="space-y-2 mt-2">
                {trajectories.slice(0, 3).map((traj) => (
                  <div key={traj.subject_id} className="flex items-center gap-3">
                    <p className="font-body text-xs text-ink-3 w-20 truncate">{traj.subject_name}</p>
                    <div className="flex-1">
                      <MiniSparkline weeks={traj.weeks} />
                    </div>
                    <p className="font-body text-xs font-semibold text-ink w-8 text-right">
                      {traj.weeks.length > 0
                        ? `${Math.round(traj.weeks[traj.weeks.length - 1].avg_score)}%`
                        : "–"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Goal nudge */}
        {showGoalNudge && !hasScoreData && (
          <button
            type="button"
            onClick={() => navigate("/app/goal-setup")}
            className="w-full flex items-center gap-3 bg-amber/8 border border-amber/20 rounded-2xl px-4 py-3 text-left"
          >
            <Icon name={Icons.target} size={20} className="text-amber flex-shrink-0" aria-hidden />
            <div className="flex-1">
              <p className="font-body font-semibold text-sm text-ink">Set your exam goal</p>
              <p className="font-body text-xs text-ink-3">Add your exam date for a countdown</p>
            </div>
            <Icon name={Icons.forward} size={16} className="text-amber" aria-hidden />
          </button>
        )}

        {/* Continue learning / start card */}
        {loading ? (
          <Skeleton className="h-24 rounded-2xl" />
        ) : inProgress ? (
          <button
            onClick={() => navigate(`/app/subjects/${inProgress.subject_id}`)}
            className="w-full bg-amber/10 border border-amber/25 rounded-2xl p-4 text-left flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-amber font-body font-bold uppercase tracking-wider mb-1">
                Continue Learning
              </p>
              <p className="font-display font-bold text-ink text-base truncate">
                {inProgress.name}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <ProgressBar value={inProgress.percentage} color="amber" className="flex-1" />
                <span className="text-xs text-ink-3 font-body flex-shrink-0">
                  {Math.round(inProgress.percentage)}%
                </span>
              </div>
            </div>
            <Icon name={Icons.forward} size={18} className="text-amber flex-shrink-0" aria-hidden />
          </button>
        ) : (
          <button
            onClick={() => navigate("/app/subjects")}
            className="w-full bg-teal/5 border border-teal/15 rounded-2xl p-4 text-left flex items-center gap-3"
          >
            <div className="flex-1">
              <p className="text-[11px] text-teal font-body font-bold uppercase tracking-wider mb-1">
                Get Started
              </p>
              <p className="font-display font-bold text-ink text-base">
                Start your first lesson
              </p>
              <p className="text-ink-3 text-sm font-body mt-0.5">
                Pick a subject and begin learning
              </p>
            </div>
            <Icon name={Icons.forward} size={18} className="text-teal flex-shrink-0" aria-hidden />
          </button>
        )}

        {/* Stats strip */}
        {loading ? (
          <Skeleton className="h-20 rounded-2xl" />
        ) : stats ? (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Videos", value: stats.videos_completed, iconName: Icons.video },
              { label: "Tests", value: stats.tests_taken, iconName: Icons.quiz },
              { label: "Avg Score", value: `${Math.round(stats.avg_test_score)}%`, iconName: Icons.score },
            ].map(({ label, value, iconName }) => (
              <div key={label} className="bg-white rounded-2xl p-3 text-center border border-ink/5">
                <Icon name={iconName} size={18} className="text-teal mx-auto mb-1 block" aria-hidden />
                <p className="font-display font-bold text-ink text-lg leading-none">{value}</p>
                <p className="text-ink-3 text-[11px] font-body mt-1">{label}</p>
              </div>
            ))}
          </div>
        ) : null}

        {/* Subjects */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-ink text-base">Your Subjects</h2>
            <button
              onClick={() => navigate("/app/subjects")}
              className="text-teal text-sm font-body font-semibold"
            >
              See all
            </button>
          </div>

          {subjects ? (
            <div className="space-y-2">
              {subjects.slice(0, 4).map((subject) => {
                const subjectProgress = progress?.subjects.find(
                  (s) => s.subject_id === subject.id
                );
                return (
                  <button
                    key={subject.id}
                    onClick={() => navigate(`/app/subjects/${subject.id}`)}
                    className="w-full bg-white rounded-2xl p-3 flex items-center gap-3 border border-ink/5 active:scale-[0.98] transition-transform"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: subject.color + "20" }}
                    >
                      {subject.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <p className="font-body font-semibold text-ink text-sm truncate">
                          {subject.name}
                        </p>
                        <span className="text-xs text-ink-3 font-body ml-2 flex-shrink-0">
                          {Math.round(subjectProgress?.percentage ?? 0)}%
                        </span>
                      </div>
                      <ProgressBar value={subjectProgress?.percentage ?? 0} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          )}
        </div>

        {/* Class label */}
        {user?.current_class && (
          <p className="text-center text-xs text-ink-3 font-body pb-2">
            Class {user.current_class} · {user.medium === "malayalam" ? "Malayalam Medium" : "English Medium"}
          </p>
        )}
      </div>
    </div>
  );
}
